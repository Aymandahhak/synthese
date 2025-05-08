import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, WifiOff, Activity } from 'lucide-react';
import AuthService from '@/services/AuthService';
import axios from 'axios';

// New styled login component
export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [testingApi, setTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [testingServer, setTestingServer] = useState(false);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Get role from user data
      let role = 'default';
      
      if (user.role_name) {
        role = user.role_name;
      } else if (user.role && typeof user.role === 'object' && user.role.name) {
        role = user.role.name;
      } else if (user.role && typeof user.role === 'string') {
        role = user.role;
      } else if (user.role_id) {
        // Map role ID to name if only ID is available
        const roleMap = {
          1: 'admin',
          2: 'responsable_formation',
          3: 'responsable_dr',
          4: 'responsable_cdc',
          5: 'formateur_animateur',
          6: 'formateur_participant'
        };
        role = roleMap[user.role_id] || 'default';
      }
      
      console.log(`User authenticated with role: ${role}`);
      
      // Redirect responsable_formation to their dashboard
      if (role === 'responsable_formation') {
        navigate('/profile/dashboard'); // Redirect to protected profile dashboard
      } 
      // For other roles, use the standard dashboard path
      else if (role === 'admin') {
        navigate('/admin/dashboard');
      } 
      else {
        // Convert role_name format (with underscore) to URL format (with hyphen)
        const routeRole = role.replace('_', '-');
        navigate(`/${routeRole}/dashboard`);
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testApiConnection = async () => {
    setTestingApi(true);
    setApiStatus(null);
    try {
      // Test both direct and via proxy
      const directResult = await AuthService.directApiTest();
      const proxyResult = await AuthService.testApiConnection();
      
      let message = '';
      if (directResult && !proxyResult.success) {
        message = "API accessible en direct, proxy contourné pour la connexion directe. Veuillez essayer de vous connecter maintenant.";
      } else if (!directResult) {
        message = "API inaccessible - vérifiez que le serveur Laravel est démarré";
      } else if (directResult && proxyResult.success) {
        message = "API accessible via les deux méthodes. La connexion devrait fonctionner.";
      }
      
      setApiStatus({
        direct: directResult,
        proxy: proxyResult.success,
        message
      });
    } catch (error) {
      console.error("API test error:", error);
      setApiStatus({
        direct: false,
        proxy: false,
        message: `Erreur de test: ${error.message || "Erreur inconnue"}`
      });
    } finally {
      setTestingApi(false);
    }
  };

  const checkServerHealth = async () => {
    setTestingServer(true);
    setServerStatus(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Test different endpoints
      const results = {};
      
      // Test 1: Basic Laravel page
      try {
        const basicResponse = await axios.get(apiUrl, {
          timeout: 5000,
          proxy: false
        });
        results.laravel = {
          status: basicResponse.status,
          ok: basicResponse.status === 200,
          message: 'Serveur Laravel accessible'
        };
      } catch (e) {
        results.laravel = {
          status: e.response?.status || 0,
          ok: false,
          message: 'Erreur accès serveur Laravel: ' + e.message
        };
      }
      
      // Test 2: Sanctum CSRF endpoint
      try {
        const csrfResponse = await axios.get(`${apiUrl}/sanctum/csrf-cookie`, {
          timeout: 5000,
          proxy: false
        });
        results.csrf = {
          status: csrfResponse.status,
          ok: csrfResponse.status >= 200 && csrfResponse.status < 300,
          message: 'CSRF accessible'
        };
      } catch (e) {
        results.csrf = {
          status: e.response?.status || 0,
          ok: false,
          message: 'Erreur CSRF: ' + e.message
        };
      }
      
      console.log('Server health check results:', results);
      setServerStatus(results);
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerStatus({ error: error.message });
    } finally {
      setTestingServer(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoginError('');
    
    try {
      await login(email, password);
      // Navigation is handled by the useEffect above
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la connexion.';
      let errorDetails = '';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.details) {
        errorDetails = error.details;
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.response.status >= 500) {
          errorMessage = `Erreur serveur (${error.response.status}). Veuillez contacter l'administrateur.`;
          // Try to extract more details from the response if available
          if (error.response.data) {
            try {
              if (typeof error.response.data === 'string') {
                errorDetails = error.response.data;
              } else if (error.response.data.message) {
                errorDetails = error.response.data.message;
              } else if (error.response.data.error) {
                errorDetails = error.response.data.error;
              } else {
                errorDetails = JSON.stringify(error.response.data);
              }
            } catch (e) {
              errorDetails = "Erreur lors de la récupération des détails";
            }
          }
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      }
      
      // Set the error message
      setLoginError(errorDetails ? `${errorMessage} Détails: ${errorDetails}` : errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // CSS for new login UI
  const loginStyles = `
    .login-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(0deg, rgba(16, 137, 211, 0.1) 0%, rgba(18, 177, 209, 0.2) 100%);
      width: 100%;
      padding: 1rem;
    }

    .login-container {
      max-width: 350px;
      background: #F8F9FD;
      background: linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%);
      border-radius: 40px;
      padding: 25px 35px;
      border: 5px solid rgb(255, 255, 255);
      box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
      margin: 20px;
      width: 100%;
    }

    .login-heading {
      text-align: center;
      font-weight: 900;
      font-size: 30px;
      color: rgb(16, 137, 211);
      margin-bottom: 20px;
    }

    .login-form {
      margin-top: 20px;
    }

    .login-input {
      width: 100%;
      background: white;
      border: none;
      padding: 15px 20px;
      border-radius: 20px;
      margin-top: 15px;
      box-shadow: #cff0ff 0px 10px 10px -5px;
      border-inline: 2px solid transparent;
    }

    .login-input:focus {
      outline: none;
      border-inline: 2px solid #12B1D1;
    }

    .login-input::placeholder {
      color: rgb(170, 170, 170);
    }

    .login-form .forgot-password {
      display: block;
      margin-top: 10px;
      margin-left: 10px;
    }

    .login-form .forgot-password a {
      font-size: 11px;
      color: #0099ff;
      text-decoration: none;
    }

    .login-form .login-button {
      display: block;
      width: 100%;
      font-weight: bold;
      background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
      color: white;
      padding-block: 15px;
      margin: 20px auto;
      border-radius: 20px;
      box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 20px 10px -15px;
      border: none;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
    }

    .login-form .login-button:hover {
      transform: scale(1.03);
      box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 23px 10px -20px;
    }

    .login-form .login-button:active {
      transform: scale(0.95);
      box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 15px 10px -10px;
    }

    .social-account-container {
      margin-top: 25px;
    }

    .social-account-container .title {
      display: block;
      text-align: center;
      font-size: 10px;
      color: rgb(170, 170, 170);
    }

    .social-account-container .social-accounts {
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 5px;
    }

    .social-button {
      background: linear-gradient(45deg, rgb(0, 0, 0) 0%, rgb(112, 112, 112) 100%);
      border: 5px solid white;
      padding: 5px;
      border-radius: 50%;
      width: 40px;
      aspect-ratio: 1;
      display: grid;
      place-content: center;
      box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 12px 10px -8px;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
    }

    .social-button:hover {
      transform: scale(1.2);
    }

    .social-button:active {
      transform: scale(0.9);
    }

    .social-button svg {
      fill: white;
      margin: auto;
      width: 20px;
      height: 20px;
    }

    .agreement {
      display: block;
      text-align: center;
      margin-top: 15px;
    }

    .agreement a {
      text-decoration: none;
      color: #0099ff;
      font-size: 9px;
    }

    .error-message {
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: rgb(239, 68, 68);
      padding: 10px;
      border-radius: 10px;
      margin-bottom: 15px;
      font-size: 12px;
    }

    .input-error {
      color: rgb(239, 68, 68);
      font-size: 11px;
      margin-top: 5px;
      margin-left: 10px;
    }

    .test-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 15px;
    }

    .test-button {
      font-size: 10px;
      padding: 8px 12px;
      border-radius: 15px;
      background: linear-gradient(45deg, rgba(16, 137, 211, 0.8) 0%, rgba(18, 177, 209, 0.8) 100%);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      box-shadow: rgba(133, 189, 215, 0.6) 0px 10px 10px -8px;
    }

    .test-button:hover {
      background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
    }

    .test-status {
      margin-top: 10px;
      font-size: 11px;
      padding: 10px;
      border-radius: 10px;
      background-color: rgba(244, 247, 251, 0.8);
    }

    .remember-me {
      display: flex;
      align-items: center;
      margin-top: 15px;
      margin-left: 10px;
    }

    .remember-me input {
      margin-right: 5px;
    }

    .remember-me label {
      font-size: 12px;
      color: #666;
    }

    .home-link {
      margin-top: 20px;
      text-align: center;
    }
    
    .home-link a {
      font-size: 12px;
      color: #0099ff;
      text-decoration: none;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 15px;
    }

    .account-card {
      background-color: rgba(244, 247, 251, 0.8);
      border-radius: 10px;
      padding: 10px;
      font-size: 12px;
    }

    .account-card .role {
      font-weight: bold;
      color: rgb(16, 137, 211);
    }

    .account-card .email {
      font-size: 10px;
      color: #666;
      word-break: break-all;
    }

    .auto-fill-button {
      width: 100%;
      font-size: 11px;
      padding: 8px;
      margin-top: 15px;
      border-radius: 15px;
      background: linear-gradient(45deg, rgba(16, 137, 211, 0.8) 0%, rgba(18, 177, 209, 0.8) 100%);
      color: white;
      border: none;
      cursor: pointer;
    }
  `;

  useEffect(() => {
    // Add the login styles to the document
    const styleElement = document.createElement("style");
    styleElement.innerHTML = loginStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-heading">OFPPT Formation</h1>
        
        {loginError && (
          <div className="error-message">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="Adresse Email"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="input-error">{errors.email}</p>
          )}
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="Mot de Passe"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="input-error">{errors.password}</p>
          )}
          
          <div className="remember-me">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me">Se souvenir de moi</label>
          </div>
          
          <span className="forgot-password">
            <a href="#">Mot de passe oublié?</a>
          </span>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="login-button"
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 style={{ marginRight: '8px', width: '16px', height: '16px' }} className="animate-spin" />
                Connexion...
              </span>
            ) : (
              "Connexion"
            )}
          </button>
        </form>
        
        <div className="social-account-container">
          <span className="title">Ou se connecter avec</span>
          <div className="social-accounts">
            <button className="social-button">
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
            </button>
            <button className="social-button">
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path>
              </svg>
            </button>
            <button className="social-button">
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* API Testing buttons */}
        <div className="test-buttons">
          <button
            type="button"
            onClick={testApiConnection}
            disabled={testingApi}
            className="test-button"
          >
            {testingApi ? (
              <>
                <Loader2 style={{ marginRight: '4px', width: '10px', height: '10px' }} className="animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <WifiOff style={{ marginRight: '4px', width: '10px', height: '10px' }} />
                Tester la connexion API
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={checkServerHealth}
            disabled={testingServer}
            className="test-button"
          >
            {testingServer ? (
              <>
                <Loader2 style={{ marginRight: '4px', width: '10px', height: '10px' }} className="animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <Activity style={{ marginRight: '4px', width: '10px', height: '10px' }} />
                Santé du Serveur
              </>
            )}
          </button>
        </div>
        
        {apiStatus && !serverStatus && (
          <div className="test-status">
            <div>Direct: {apiStatus.direct ? '✅' : '❌'}</div>
            <div>Proxy: {apiStatus.proxy ? '✅' : '❌'}</div>
            <div style={{ marginTop: '5px' }}>{apiStatus.message}</div>
          </div>
        )}
        
        {serverStatus && (
          <div className="test-status">
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Diagnostic du Serveur:</div>
            {serverStatus.error ? (
              <div style={{ color: 'red' }}>{serverStatus.error}</div>
            ) : (
              <div>
                <div style={{ color: serverStatus.laravel?.ok ? 'green' : 'red' }}>
                  Laravel: {serverStatus.laravel?.status} {serverStatus.laravel?.message}
                </div>
                <div style={{ color: serverStatus.csrf?.ok ? 'green' : 'red' }}>
                  CSRF: {serverStatus.csrf?.status} {serverStatus.csrf?.message}
                </div>
                <div style={{ color: '#666', marginTop: '5px', fontSize: '10px' }}>
                  * Si ces tests passent mais le login échoue, vérifiez que la base de données est configurée.
                </div>
              </div>
            )}
          </div>
        )}
        
        <span className="agreement">
          <a href="#">Conditions d'utilisation</a>
        </span>

        <div className="home-link">
          <Link to="/">← Retour à l'accueil</Link>
        </div>
        
        {/* Development Test Accounts */}
        {true && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgb(16, 137, 211)', marginBottom: '5px' }}>
              Comptes de test (Développement uniquement)
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
              Mot de passe: <span style={{ fontFamily: 'monospace', background: '#eee', padding: '0 4px', borderRadius: '3px' }}>password</span>
            </div>
            
            <div className="accounts-grid">
              <div className="account-card">
                <div className="role">Admin</div>
                <div className="email">admin@example.com</div>
              </div>
              <div className="account-card">
                <div className="role">Responsable Formation</div>
                <div className="email">responsable.formation@example.com</div>
              </div>
              <div className="account-card">
                <div className="role">Responsable DR</div>
                <div className="email">responsable.dr@example.com</div>
              </div>
              <div className="account-card">
                <div className="role">Responsable CDC</div>
                <div className="email">responsable.cdc@example.com</div>
              </div>
              <div className="account-card">
                <div className="role">Formateur Animateur</div>
                <div className="email">formateur.animateur@example.com</div>
              </div>
              <div className="account-card">
                <div className="role">Formateur Participant</div>
                <div className="email">formateur.participant@example.com</div>
              </div>
            </div>
            
            <button 
              className="auto-fill-button"
              onClick={(e) => {
                e.preventDefault();
                const account = prompt("Sélectionnez un compte (1-6):\n1. Admin\n2. Responsable Formation\n3. Responsable DR\n4. Responsable CDC\n5. Formateur Animateur\n6. Formateur Participant");
                
                const emails = [
                  'admin@example.com',
                  'responsable.formation@example.com',
                  'responsable.dr@example.com',
                  'responsable.cdc@example.com',
                  'formateur.animateur@example.com',
                  'formateur.participant@example.com'
                ];
                
                const index = parseInt(account) - 1;
                if (index >= 0 && index < emails.length) {
                  setEmail(emails[index]);
                  setPassword('password');
                }
              }}
            >
              Auto-remplir les identifiants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}