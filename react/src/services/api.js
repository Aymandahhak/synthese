import axios from 'axios';

// Use the environment variable for API base URL 
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const SANCTUM_CSRF_URL = import.meta.env.VITE_SANCTUM_CSRF_URL || `${API_BASE_URL}/sanctum/csrf-cookie`;

// Base URL for API calls for public access (no auth)
const API_URL = 'http://localhost:8000/api';
const PUBLIC_API = `${API_URL}/public`;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Append /api to the base URL
  withCredentials: true, // Important for Sanctum session/cookie based auth
  headers: {
    'Accept': 'application/json',
  },
  timeout: 15000, // Set a consistent 15 second timeout
});

// Function to get CSRF cookie from Sanctum
const getCsrfCookie = async () => {
  try {
    await axios.get(SANCTUM_CSRF_URL, { 
      withCredentials: true,
      timeout: 8000, // Shorter timeout for CSRF cookie
      headers: {
        'Accept': 'application/json',
      },
    });
    console.log("CSRF cookie set successfully");
  } catch (error) {
    console.error("Error fetching CSRF cookie:", error);
    // Continue without throwing - CSRF may not be required in all setups
  }
};

// Interceptor to add Authorization header if a token exists (e.g., in localStorage)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken'); // Get token from local storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor for improved error handling and debugging
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received - server might be down or unreachable');
    }
    
    // For timeout errors, provide a clearer message
    if (error.code === 'ECONNABORTED') {
      error.message = 'Le serveur ne répond pas dans le délai imparti. Veuillez réessayer plus tard.';
    }
    
    // For network errors, provide a clearer message
    if (error.message.includes('Network Error')) {
      error.message = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et que le serveur est démarré.';
    }
    
    return Promise.reject(error);
  }
);

// --- API Service Functions (for use with authentication later) ---

// User Auth/Info
export const getUser = () => apiClient.get('/user');
export const getTestMessage = () => apiClient.get('/test');
export const login = async (email, password) => {
    await getCsrfCookie();
    return apiClient.post('/login', { email, password });
};
export const logout = () => apiClient.post('/logout');

// Profile
export const getProfile = () => apiClient.get('/profile');
export const updateProfile = (profileData) => apiClient.put('/profile', profileData);
export const updatePassword = (passwordData) => apiClient.put('/profile/password', passwordData);

// Formateurs List (for dropdowns)
export const getFormateursList = () => apiClient.get('/formateurs-list');

// --- Responsable Formation Specific (authenticated routes for later) --- 
const rfPrefix = '/responsable-formation';

// Dashboard
export const getResponsableFormationDashboardData = () => apiClient.get(`${rfPrefix}/dashboard`);

// Authenticated routes for later use
export const getSessionList = (params = {}) => apiClient.get(`${rfPrefix}/sessions`, { params });
export const getSession = (id) => apiClient.get(`${rfPrefix}/sessions/${id}`);
export const createSession = (sessionData) => apiClient.post(`${rfPrefix}/sessions`, sessionData);
export const updateSession = (id, sessionData) => apiClient.put(`${rfPrefix}/sessions/${id}`, sessionData);
export const deleteSession = (id) => apiClient.delete(`${rfPrefix}/sessions/${id}`);

// Feedbacks
export const getFeedbacks = (params = {}) => apiClient.get(`${rfPrefix}/feedbacks`, { params });
export const getFeedbacksBySession = (sessionId) => apiClient.get(`${rfPrefix}/sessions/${sessionId}/feedbacks`);
export const getFeedback = (id) => apiClient.get(`${rfPrefix}/feedbacks/${id}`);
export const createFeedback = (feedbackData) => apiClient.post(`/feedbacks`, feedbackData);
export const updateFeedback = (id, feedbackData) => apiClient.put(`/feedbacks/${id}`, feedbackData);
export const deleteFeedback = (id) => apiClient.delete(`/feedbacks/${id}`);

// Presences
export const getPresences = (sessionId, date = null) => {
  const params = { session_id: sessionId };
  if (date) params.date = date;
  return apiClient.get(`${rfPrefix}/presences`, { params });
};
export const updatePresences = (presenceData) => apiClient.post(`${rfPrefix}/presences`, { presences: presenceData });
export const getAuthPresenceStats = (sessionId) => apiClient.get(`${rfPrefix}/presences/stats`, { params: { session_id: sessionId } });

// Reports
export const downloadSessionsReport = () => apiClient.get(`${rfPrefix}/reports/sessions`, { responseType: 'blob' });
export const downloadFeedbacksReport = () => apiClient.get(`${rfPrefix}/reports/feedbacks`, { responseType: 'blob' });
export const downloadPresencesReport = () => apiClient.get(`${rfPrefix}/reports/presences`, { responseType: 'blob' });

// ===========================================
// Public API Functions (no authentication)
// ===========================================

// For public (non-authenticated) API access - currently using fetch API
export const publicApi = {
  // Profile data
  getResponsableProfile: async () => {
    try {
      // Set a timeout to ensure the request doesn't hang indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // First try to get data from the public endpoint
      const response = await fetch(`${PUBLIC_API}/responsable-formation/profile`, {
        signal: controller.signal
      }).catch(error => {
        // Handle network errors or timeouts
        console.warn(`Network error for profile API: ${error.message}`);
        return null;
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // If fetch failed completely or timed out
      if (!response || !response.ok) {
        console.warn(`Public API not available: ${response?.status || 'Network Error'}. Using fallback data.`);
        // Return fallback data if the API endpoint is not available
        return {
          id: 1,
          name: 'Responsable Formation (Fallback)',
          role: 'Responsable Formation',
          avatar: '/avatars/responsable1.jpg',
          email: 'responsable@ofppt.ma',
          departement: 'Formation Continue',
          date_debut_fonction: '2020-01-01',
          description: 'Responsable des formations continues',
          statistics: {
            pending_validations: 5,
            active_formations: 10,
            completed_formations: 15,
            formateurs_en_formation: 8
          },
          recentActivity: [
            {action: 'Formation planifiée', description: 'Formation React', date: '2023-05-15'},
            {action: 'Formation en cours', description: 'Formation Laravel', date: '2023-05-10'},
            {action: 'Formation terminée', description: 'Formation JavaScript', date: '2023-05-05'}
          ]
        };
      }
      
      // Parse the JSON with a timeout
      try {
        const jsonData = await response.json();
        return jsonData;
      } catch (jsonError) {
        console.error('Error parsing profile JSON:', jsonError);
        // Return fallback on JSON parse error
        return {
          id: 1,
          name: 'Responsable Formation (JSON Error)',
          role: 'Responsable Formation',
          avatar: '/avatars/responsable1.jpg',
          email: 'responsable@ofppt.ma',
          statistics: {
            pending_validations: 5,
            active_formations: 10,
            completed_formations: 15,
            formateurs_en_formation: 8
          }
        };
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return fallback data in case of error
      return {
        id: 1,
        name: 'Responsable Formation (Error Fallback)',
        role: 'Responsable Formation',
        avatar: '/avatars/responsable1.jpg',
        email: 'responsable@example.com',
        departement: 'Formation Continue',
        statistics: {
          pending_validations: 3,
          active_formations: 7, 
          completed_formations: 12,
          formateurs_en_formation: 5
        },
        recentActivity: [
          {action: 'Formation planifiée', description: 'Formation Web', date: '2023-05-10'}
        ]
      };
    }
  },
  
  // Formations data
  getFormations: async () => {
    try {
      // Set a timeout to ensure the request doesn't hang indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${PUBLIC_API}/responsable-formation/formations`, {
        signal: controller.signal
      }).catch(error => {
        console.warn(`Network error for formations API: ${error.message}`);
        return null;
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // If fetch failed completely or timed out
      if (!response || !response.ok) {
        console.warn(`Formations API not available: ${response?.status || 'Network Error'}. Using fallback data.`);
        // Return fallback data if the API endpoint is not available
        return {
          message: 'Liste des formations récupérée avec succès (données statiques)',
          data: [
            {
              id: 1,
              titre: 'Formation React',
              description: 'Apprendre React.js',
              date_debut: '2023-06-01',
              date_fin: '2023-06-15',
              lieu: 'Casablanca',
              capacite_max: 20,
              statut: 'planifiee'
            },
            {
              id: 2,
              titre: 'Formation Laravel',
              description: 'Apprendre Laravel',
              date_debut: '2023-07-01',
              date_fin: '2023-07-15',
              lieu: 'Rabat',
              capacite_max: 15,
              statut: 'en_cours'
            }
          ]
        };
      }
      
      // Parse the JSON with a try/catch
      try {
        const jsonData = await response.json();
        return jsonData;
      } catch (jsonError) {
        console.error('Error parsing formations JSON:', jsonError);
        // Return fallback on JSON parse error
        return {
          message: 'Liste des formations (erreur JSON)',
          data: [
            {
              id: 1,
              titre: 'Formation React',
              description: 'Apprendre React.js',
              date_debut: '2023-06-01',
              date_fin: '2023-06-15'
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error fetching formations:', error);
      // Return fallback data in case of error
      return {
        message: 'Liste des formations (données statiques)',
        data: [
          {
            id: 1,
            titre: 'Formation React',
            description: 'Apprendre React.js',
            date_debut: '2023-06-01',
            date_fin: '2023-06-15',
            lieu: 'Casablanca',
            capacite_max: 20,
            statut: 'planifiee'
          },
          {
            id: 2,
            titre: 'Formation Laravel',
            description: 'Apprendre Laravel',
            date_debut: '2023-07-01',
            date_fin: '2023-07-15',
            lieu: 'Rabat',
            capacite_max: 15,
            statut: 'en_cours'
          }
        ]
      };
    }
  },
  
  createFormation: async (formationData) => {
    try {
      // Use apiClient with timeout for authenticated POST
      const isFormData = formationData instanceof FormData;
      const response = await apiClient.post(
        '/responsable-formation/formations',
        formationData,
        {
          headers: isFormData ? { 'Accept': 'application/json' } : undefined,
          timeout: 10000 // 10 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating formation:', error);
      // Return error in a consistent format
      return {
        error: error.message || 'Une erreur s\'est produite lors de la création de la formation',
        message: 'Erreur lors de la création de la formation',
        data: null
      };
    }
  },

  // Sessions data
  getSessions: async () => {
    try {
      // Set a timeout to ensure the request doesn't hang indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${PUBLIC_API}/responsable-formation/sessions`, {
        signal: controller.signal
      }).catch(error => {
        console.warn(`Network error for sessions API: ${error.message}`);
        return null;
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // If fetch failed completely or timed out
      if (!response || !response.ok) {
        console.warn(`Sessions API not available: ${response?.status || 'Network Error'}. Using fallback data.`);
        // Return fallback data for sessions
        return {
          message: 'Liste des sessions récupérée avec succès',
          data: [
            {
              id: 1,
              formation_id: 1,
              titre: 'Session 1 - React Basics',
              date: '2023-06-01',
              heure_debut: '09:00',
              heure_fin: '12:00',
              lieu: 'Salle A',
              formateur_id: 1,
              formateur_nom: 'Ahmed Alaoui'
            },
            {
              id: 2,
              formation_id: 1,
              titre: 'Session 2 - React Components',
              date: '2023-06-02',
              heure_debut: '09:00',
              heure_fin: '12:00',
              lieu: 'Salle A',
              formateur_id: 1,
              formateur_nom: 'Ahmed Alaoui'
            }
          ]
        };
      }
      
      // Parse the JSON safely
      try {
        const jsonData = await response.json();
        return jsonData;
      } catch (jsonError) {
        console.error('Error parsing sessions JSON:', jsonError);
        // Return fallback data in case of JSON parsing error
        return {
          message: 'Liste des sessions (erreur JSON)',
          data: [
            {
              id: 1,
              formation_id: 1,
              titre: 'Session 1 - React Basics',
              date: '2023-06-01',
              heure_debut: '09:00',
              heure_fin: '12:00'
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Return fallback data in case of error
      return {
        message: 'Liste des sessions (données statiques)',
        data: [
          {
            id: 1,
            formation_id: 1,
            titre: 'Session 1 - React Basics',
            date: '2023-06-01',
            heure_debut: '09:00',
            heure_fin: '12:00',
            lieu: 'Salle A',
            formateur_id: 1,
            formateur_nom: 'Ahmed Alaoui'
          },
          {
            id: 2,
            formation_id: 1,
            titre: 'Session 2 - React Components',
            date: '2023-06-02',
            heure_debut: '09:00',
            heure_fin: '12:00',
            lieu: 'Salle A',
            formateur_id: 1,
            formateur_nom: 'Ahmed Alaoui'
          }
        ]
      };
    }
  },
  
  createSession: async (sessionData) => {
    try {
      const response = await apiClient.post('/responsable-formation/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      return {
        error: error.message || 'Une erreur s\'est produite lors de la création de la session',
        message: 'Erreur lors de la création de la session',
        data: null
      };
    }
  },

  // Presence stats data
  getPresenceStats: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${PUBLIC_API}/responsable-formation/presences/stats`, {
        signal: controller.signal
      }).catch(error => {
        console.warn(`Network error for presence stats API: ${error.message}`);
        return null;
      });

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        console.warn(`Presence stats API not available: ${response?.status || 'Network Error'}. Using fallback data.`);
        return {
          message: 'Statistiques de présence récupérées avec succès (données statiques)',
          data: {
            total_sessions: 25,
            presence_rate: 85,
            sessions_by_month: [
              { month: 'Jan', count: 2 }, { month: 'Fév', count: 3 }, { month: 'Mar', count: 4 },
              { month: 'Avr', count: 3 }, { month: 'Mai', count: 5 }, { month: 'Juin', count: 8 }
            ],
            recent_absences: [
              { formateur: 'Karim Bennani', date: '2023-05-20', session: 'Laravel Basics' },
              { formateur: 'Sara Amrani', date: '2023-05-18', session: 'JavaScript ES6' }
            ]
          }
        };
      }
      
      try {
        const jsonData = await response.json();
        return jsonData;
      } catch (jsonError) {
         console.error('Error parsing presence stats JSON:', jsonError);
         return {
            message: 'Statistiques de présence (erreur JSON)',
            data: { total_sessions: 0, presence_rate: 0, sessions_by_month: [], recent_absences: [] }
         };
      }
    } catch (error) {
      console.error('Error fetching presence stats:', error);
      return {
        message: 'Statistiques de présence (données statiques erreur)',
        data: {
          total_sessions: 25,
          presence_rate: 85,
          sessions_by_month: [
            { month: 'Jan', count: 2 }, { month: 'Fév', count: 3 }, { month: 'Mar', count: 4 },
            { month: 'Avr', count: 3 }, { month: 'Mai', count: 5 }, { month: 'Juin', count: 8 }
          ],
          recent_absences: [
            { formateur: 'Karim Bennani', date: '2023-05-20', session: 'Laravel Basics' },
            { formateur: 'Sara Amrani', date: '2023-05-18', session: 'JavaScript ES6' }
          ]
        }
      };
    }
  },
  
  // Reports data
  getReports: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${PUBLIC_API}/responsable-formation/reports`, {
        signal: controller.signal
      }).catch(error => {
        console.warn(`Network error for reports API: ${error.message}`);
        return null;
      });

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        console.warn(`Reports API not available: ${response?.status || 'Network Error'}. Using fallback data.`);
        return {
          message: 'Rapports récupérés avec succès (données statiques)',
          data: [
            { id: 1, titre: 'Rapport Trimestriel - Formations Q1 2023', date_creation: '2023-04-05', type: 'pdf', taille: '1.2 MB', url: '/reports/q1-2023.pdf' },
            { id: 2, titre: 'Statistiques de Participation - Janvier 2023', date_creation: '2023-02-10', type: 'excel', taille: '856 KB', url: '/reports/stats-jan-2023.xlsx' }
          ]
        };
      }
      
      try {
        const jsonData = await response.json();
        return jsonData;
      } catch (jsonError) {
        console.error('Error parsing reports JSON:', jsonError);
        return {
            message: 'Rapports (erreur JSON)',
            data: []
        };
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      return {
        message: 'Rapports (données statiques erreur)',
        data: [
          { id: 1, titre: 'Rapport Trimestriel - Formations Q1 2023', date_creation: '2023-04-05', type: 'pdf', taille: '1.2 MB', url: '/reports/q1-2023.pdf' },
          { id: 2, titre: 'Statistiques de Participation - Janvier 2023', date_creation: '2023-02-10', type: 'excel', taille: '856 KB', url: '/reports/stats-jan-2023.xlsx' }
        ]
      };
    }
  },

  // Absences data
  getAbsences: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${PUBLIC_API}/responsable-formation/absences`, {
        signal: controller.signal
      }).catch(error => {
        console.warn(`Network error for absences API: ${error.message}`);
        return null;
      });

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        console.warn(`Absences API not available: ${response?.status || 'Network Error'}. Using fallback data.`);
        return {
          message: 'Liste des absences récupérée avec succès (données statiques)',
          data: [
            { id: 1, name: "Hannah Laurent", image: "/avatars/placeholder.png", department: "Marketing", absenceType: "Congé maladie", startDate: "2023-04-15", endDate: "2023-04-20" },
            { id: 2, name: "Thomas Martin", image: "/avatars/placeholder.png", department: "Développement", absenceType: "Congé annuel", startDate: "2023-04-10", endDate: "2023-04-17" }
          ]
        };
      }
      
      try {
        const jsonData = await response.json();
        return jsonData;
      } catch (jsonError) {
        console.error('Error parsing absences JSON:', jsonError);
        // If data is critical and can't be handled by fallback, rethrow or handle specifically
        // For now, returning fallback to prevent crashes
        return {
            message: 'Liste des absences (erreur JSON)',
            data: []
        };
      }
    } catch (error) {
      console.error('Error fetching absences:', error);
      // Fallback for other errors
       return {
          message: 'Liste des absences récupérée avec succès (données statiques erreur)',
          data: [
            { id: 1, name: "Hannah Laurent", image: "/avatars/placeholder.png", department: "Marketing", absenceType: "Congé maladie", startDate: "2023-04-15", endDate: "2023-04-20" },
            { id: 2, name: "Thomas Martin", image: "/avatars/placeholder.png", department: "Développement", absenceType: "Congé annuel", startDate: "2023-04-10", endDate: "2023-04-17" }
          ]
        };
    }
  },

  // Documents data
  getDocuments: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${PUBLIC_API}/responsable-formation/documents`, {
        signal: controller.signal
      }).catch(error => {
        console.warn(`Network error for documents API: ${error.message}`);
        return null;
      });

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        console.warn(`Documents API not available: ${response?.status || 'Network Error'}. Using fallback data.`);
        return {
          message: 'Liste des documents récupérée avec succès (données statiques)',
          data: [
            { id: 1, title: "Rapport Trimestriel - Formations Q1 2023", type: "pdf", size: "1.2 MB", createdAt: "2023-04-05", category: "Rapports", url: "/documents/rapport-q1-2023.pdf" },
            { id: 2, title: "Guide du Formateur - Techniques Pédagogiques", type: "docx", size: "850 KB", createdAt: "2023-03-15", category: "Guides", url: "/documents/guide-formateur-2023.docx" }
          ]
        };
      }
      
      try {
        const jsonData = await response.json();
        return jsonData;
      } catch (jsonError) {
        console.error('Error parsing documents JSON:', jsonError);
        return {
            message: 'Liste des documents (erreur JSON)',
            data: []
        };
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
       return {
          message: 'Liste des documents récupérée avec succès (données statiques erreur)',
          data: [
            { id: 1, title: "Rapport Trimestriel - Formations Q1 2023", type: "pdf", size: "1.2 MB", createdAt: "2023-04-05", category: "Rapports", url: "/documents/rapport-q1-2023.pdf" },
            { id: 2, title: "Guide du Formateur - Techniques Pédagogiques", type: "docx", size: "850 KB", createdAt: "2023-03-15", category: "Guides", url: "/documents/guide-formateur-2023.docx" }
          ]
        };
    }
  },
  
  // Logistics data
  getLogistics: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${PUBLIC_API}/responsable-formation/logistics`, {
        signal: controller.signal
      }).catch(error => {
        console.warn(`Network error for logistics API: ${error.message}`);
        return null;
      });

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        console.warn(`Logistics API not available: ${response?.status || 'Network Error'}. Using fallback data.`);
        return {
          message: 'Liste des ressources logistiques récupérée avec succès (données statiques)',
          data: [
            { id: 1, name: "Salle de formation A2", type: "Salle", capacity: 30, equipment: ["Projecteur", "Tableau blanc"], location: "Bâtiment A", status: "disponible", imageUrl: "/rooms/salle-a2.jpg" },
            { id: 2, name: "Vidéoprojecteur HP HD", type: "Équipement", serialNumber: "VP-20230115", location: "Stock", status: "maintenance", imageUrl: "/equipment/projector.jpg" }
          ]
        };
      }
      
      try {
        const jsonData = await response.json();
        return jsonData;
      } catch (jsonError) {
        console.error('Error parsing logistics JSON:', jsonError);
        return {
            message: 'Liste des ressources logistiques (erreur JSON)',
            data: []
        };
      }
    } catch (error) {
      console.error('Error fetching logistics:', error);
       return {
          message: 'Liste des ressources logistiques récupérée avec succès (données statiques erreur)',
          data: [
            { id: 1, name: "Salle de formation A2", type: "Salle", capacity: 30, equipment: ["Projecteur", "Tableau blanc"], location: "Bâtiment A", status: "disponible", imageUrl: "/rooms/salle-a2.jpg" },
            { id: 2, name: "Vidéoprojecteur HP HD", type: "Équipement", serialNumber: "VP-20230115", location: "Stock", status: "maintenance", imageUrl: "/equipment/projector.jpg" }
          ]
        };
    }
  },
};

// Function to prepare for authentication later
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Test API connection and log results to console
export const testApiConnection = async () => {
  console.log("Testing API connection to Laravel backend...");
  
  try {
    // First try the test endpoint (simpler than connection-test)
    try {
      const testEndpointResponse = await fetch(`${API_URL}/test`);
      if (testEndpointResponse.ok) {
        const testData = await testEndpointResponse.json();
        console.log("%c✅ API Server Connection Test Successful!", "color: green; font-weight: bold;");
        console.log("Connected to:", API_URL);
        console.log("Server Details:", testData);
        
        // Continue to test the public endpoint
        const publicTestResponse = await fetch(`${PUBLIC_API}/responsable-formation/profile`);
        
        if (publicTestResponse.ok) {
          console.log("%c✅ Public API Routes Working Correctly!", "color: green; font-weight: bold;");
          const data = await publicTestResponse.json();
          console.log("Profile Data Sample:", data);
          return true;
        } else {
          console.error("%c⚠️ Public API endpoints not accessible:", "color: orange; font-weight: bold;", 
            publicTestResponse.status, publicTestResponse.statusText);
          console.error("Base server connection is working, but public routes may not be configured correctly");
          console.error("Check if the public routes are properly defined in Laravel routes/api.php");
          return false;
        }
      } else {
        throw new Error(`Test endpoint failed: ${testEndpointResponse.status}`);
      }
    } catch (testError) {
      // If test fails, show comprehensive error information
      console.error("%c❌ API Server Connection Failed", "color: red; font-weight: bold;");
      console.error("Could not connect to API endpoint");
      console.error("Attempted URLs:", 
        `${API_URL}/test`, 
        `${PUBLIC_API}/responsable-formation/profile`);
      
      console.error("%c📋 Troubleshooting Checklist:", "color: blue; font-weight: bold;");
      console.error("1. Is your Laravel server running? Run 'php artisan serve'");
      console.error("2. Check Laravel CORS configuration in config/cors.php");
      console.error("3. Verify API URLs:", { 
        API_URL, 
        PUBLIC_API,
        "Laravel Default": "http://localhost:8000/api"
      });
      console.error("4. Check browser network tab for more details on the failed request");
      console.error("5. Verify that the routes are correctly defined in Laravel routes/api.php");
      return false;
    }
  } catch (error) {
    console.error("%c❌ API Connection Error:", "color: red; font-weight: bold;", error);
    console.error("Complete connection failure - this is likely a server, network, or CORS issue");
    return false;
  }
};

// Do NOT auto-call the test function here - it will be called from App.jsx
// testApiConnection();