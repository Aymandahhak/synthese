import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Container,
  Paper,
  Grid,
  Button,
  TextField,
  Divider,
  Snackbar,
  Avatar,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../api/axios';

const Parametres = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // États pour les informations du formateur
  const [formateur, setFormateur] = useState({
    id: 0,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    photo: ''
  });
  
  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // États pour le suivi des modifications
  const [isProfileModified, setIsProfileModified] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchFormateurData();
  }, []);

  const fetchFormateurData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dans un vrai projet, appel API pour récupérer les données
      // const response = await api.get('/formateur/profile');
      
      // Simulation des données pour la démo
      const mockData = {
        id: 1,
        nom: 'Durand',
        prenom: 'Alex',
        email: 'alex.durand@formation.fr',
        telephone: '06 12 34 56 78',
        specialite: 'Pédagogie active',
        photo: 'https://i.pravatar.cc/300'
      };
      
      setFormateur(mockData);
    } catch (error) {
      console.error("Error fetching formateur data:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormateur(prev => ({ ...prev, [name]: value }));
    setIsProfileModified(true);
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Validation
    if (name === 'new_password') {
      if (value.length < 8) {
        setPasswordErrors(prev => ({ 
          ...prev, 
          new_password: 'Le mot de passe doit contenir au moins 8 caractères' 
        }));
      } else {
        setPasswordErrors(prev => ({ ...prev, new_password: '' }));
      }
    }
    
    if (name === 'confirm_password') {
      if (value !== passwordData.new_password) {
        setPasswordErrors(prev => ({ 
          ...prev, 
          confirm_password: 'Les mots de passe ne correspondent pas' 
        }));
      } else {
        setPasswordErrors(prev => ({ ...prev, confirm_password: '' }));
      }
    }
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.current_password) {
      errors.current_password = 'Veuillez entrer votre mot de passe actuel';
    }
    
    if (!passwordData.new_password) {
      errors.new_password = 'Veuillez entrer un nouveau mot de passe';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (!passwordData.confirm_password) {
      errors.confirm_password = 'Veuillez confirmer votre nouveau mot de passe';
    } else if (passwordData.confirm_password !== passwordData.new_password) {
      errors.confirm_password = 'Les mots de passe ne correspondent pas';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    try {
      // Dans un vrai projet, appel API pour mettre à jour les données
      // await api.put('/formateur/profile', formateur);
      
      console.log("Profil mis à jour:", formateur);
      
      setSnackbar({
        open: true,
        message: 'Profil mis à jour avec succès',
        severity: 'success'
      });
      
      setIsProfileModified(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: `Erreur: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      // Dans un vrai projet, appel API pour mettre à jour le mot de passe
      // await api.put('/formateur/password', {
      //   current_password: passwordData.current_password,
      //   new_password: passwordData.new_password
      // });
      
      console.log("Mot de passe mis à jour");
      
      setSnackbar({
        open: true,
        message: 'Mot de passe modifié avec succès',
        severity: 'success'
      });
      
      // Réinitialiser le formulaire
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error("Error updating password:", error);
      
      // Simuler une erreur de mot de passe incorrect
      setPasswordErrors({
        ...passwordErrors,
        current_password: 'Mot de passe actuel incorrect'
      });
      
      setSnackbar({
        open: true,
        message: 'Le mot de passe actuel est incorrect',
        severity: 'error'
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
      <Typography mt={2}>Chargement des paramètres...</Typography>
    </Box>
  );
  
  if (error) return (
    <Box mt={4} p={2}>
      <Alert severity="error">{error}</Alert>
      <Button variant="contained" color="primary" onClick={fetchFormateurData} sx={{ mt: 2 }}>
        Réessayer
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Box mb={4} mt={2}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/formateur-animateur"
          sx={{ mb: 2 }}
        >
          Retour au profil
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Paramètres du compte
        </Typography>
      </Box>

      {/* Informations personnelles */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Informations personnelles
        </Typography>
        
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} mb={4}>
          <Box textAlign="center">
            <Avatar 
              src={formateur.photo} 
              alt={`${formateur.prenom} ${formateur.nom}`}
              sx={{ width: 150, height: 150, margin: '0 auto 16px' }}
            />
            <IconButton color="primary" component="label">
              <input type="file" hidden accept="image/*" />
              <PhotoCameraIcon />
            </IconButton>
            <Typography variant="caption" display="block">
              Changer la photo
            </Typography>
          </Box>
          
          <Grid container spacing={2} flex={1}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={formateur.nom}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="prenom"
                value={formateur.prenom}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formateur.email}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={formateur.telephone}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Spécialité"
                name="specialite"
                value={formateur.specialite}
                onChange={handleProfileChange}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box textAlign="right">
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleUpdateProfile}
            disabled={!isProfileModified}
          >
            Mettre à jour
          </Button>
        </Box>
      </Paper>

      {/* Changement de mot de passe */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Changement de mot de passe
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mot de passe actuel"
              name="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              error={!!passwordErrors.current_password}
              helperText={passwordErrors.current_password}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              name="new_password"
              type="password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              error={!!passwordErrors.new_password}
              helperText={passwordErrors.new_password}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Confirmer le nouveau mot de passe"
              name="confirm_password"
              type="password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              error={!!passwordErrors.confirm_password}
              helperText={passwordErrors.confirm_password}
            />
          </Grid>
        </Grid>
        
        <Box textAlign="right" mt={2}>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<LockResetIcon />}
            onClick={handleUpdatePassword}
            disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
          >
            Changer le mot de passe
          </Button>
        </Box>
      </Paper>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Parametres; 