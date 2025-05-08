import axios from 'axios';

// Configuration de l'URL de base pour les requêtes API
const API_URL = `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:8000/api';

// Create an axios instance with auth header
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
});

// Add auth token to requests
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for handling common errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            if (error.response.status === 401) {
                console.error('Unauthorized access - 401');
            } else if (error.response.status === 403) {
                console.error('Forbidden access - 403');
            } else if (error.response.status === 422) {
                console.error('Validation Error - 422', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

// Error handling helper
const handleApiError = (error, customMessage) => {
  console.error(`${customMessage}:`, error.response?.data || error.message);
  
  if (error.response?.status === 401) {
    console.error('Authentication expired - redirecting to login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  
  if (error.response?.status === 403) {
    throw new Error('Vous n\'avez pas les permissions nécessaires pour effectuer cette action.');
  }
  
  throw error.response?.data || new Error(customMessage);
};

/**
 * Utility function for retrying API calls with exponential backoff
 * @param {Function} apiFn - The API function to call
 * @param {Array} args - Arguments to pass to the API function
 * @param {Number} maxRetries - Maximum number of retries
 * @param {Number} initialDelay - Initial delay in ms
 * @returns {Promise} - Promise that resolves with the API response
 */
const retryWithBackoff = async (apiFn, args = [], maxRetries = 3, initialDelay = 300) => {
  let numRetries = 0;
  let delay = initialDelay;

  while (numRetries < maxRetries) {
    try {
      return await apiFn(...args);
    } catch (error) {
      numRetries++;
      if (numRetries >= maxRetries) {
        throw error; // Exceeded max retries, propagate the error
      }
      
      console.warn(`API call failed, retrying (${numRetries}/${maxRetries}) after ${delay}ms...`, error.message);
      
      // Wait for the delay period
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      delay *= 2;
    }
  }
};

/**
 * Get dashboard statistics
 * @returns {Promise<object>} Promise resolving with dashboard stats
 */
const getDashboardStats = async () => {
    try {
        // Check if token exists in localStorage and set it in headers if needed
        const token = localStorage.getItem('authToken');
        if (token && !apiClient.defaults.headers.common['Authorization']) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Use the retry utility
        const response = await retryWithBackoff(
            () => apiClient.get('/admin/dashboard-stats'), 
            [], // No arguments needed for this call
            3    // Max retries
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error.response?.status, error.response?.data || error.message);
        
        // Check for authentication errors
        if (error.response?.status === 401) {
            console.error("Authentication failed - token may be invalid or expired");
            // Optionally trigger logout or token refresh here
        }
        
        throw error.response?.data || new Error('Failed to fetch dashboard stats. Please try refreshing the page.');
    }
};

/**
 * Get recent users for dashboard
 */
const getRecentUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users/recent');
    return response.data;
  } catch (error) {
    console.error("Error fetching recent users:", error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch recent users');
  }
};

/**
 * Get users with pagination support.
 * @param {number} [page=1] Page number for pagination.
 * @param {string} [searchTerm=''] Optional search term.
 * @returns {Promise<object>} Promise resolving with paginated users object (including data, links, meta).
 */
const getUsers = async (page = 1, searchTerm = '') => {
    try {
        const response = await apiClient.get('/admin/users', {
             params: { 
                 page,
                 search: searchTerm
             }
         });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Failed to fetch users');
    }
};

/**
 * Create a new user.
 * Requires name, email, password, password_confirmation, role_id.
 * @param {Object} userData User data to create.
 * @returns {Promise<Object>} Promise resolving with created user.
 */
const createUser = async (userData) => {
    try {
        const response = await apiClient.post('/admin/users', userData);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create user');
    }
};

/**
 * Update an existing user.
 * Sends only provided fields. Password requires password_confirmation if sent.
 * @param {number} userId User ID to update.
 * @param {Object} userData Updated user data (e.g., { name, email, role_id, password?, password_confirmation? }).
 * @returns {Promise<Object>} Promise resolving with updated user.
 */
const updateUser = async (userId, userData) => {
    try {
        const response = await apiClient.put(`/admin/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update user');
    }
};

/**
 * Delete a user.
 * @param {number} userId User ID to delete.
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
    try {
        await apiClient.delete(`/admin/users/${userId}`);
    } catch (error) {
        console.error("Error deleting user:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete user');
    }
};

/**
 * Get all roles.
 * @returns {Promise<Array>} Promise resolving with roles array.
 */
const getRoles = async () => {
    try {
        const response = await apiClient.get('/roles');
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch roles');
    }
};

// Regions API endpoints
const getRegions = async () => {
    try {
        const response = await apiClient.get('/admin/regions');
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch regions');
    }
};

const createRegion = async (regionData) => {
    try {
        const response = await apiClient.post('/admin/regions', regionData);
        return response.data;
    } catch (error) {
        console.error("Error creating region:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create region');
    }
};

const updateRegion = async (regionId, regionData) => {
    try {
        const response = await apiClient.put(`/admin/regions/${regionId}`, regionData);
        return response.data;
    } catch (error) {
        console.error("Error updating region:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update region');
    }
};

const deleteRegion = async (regionId) => {
    try {
        await apiClient.delete(`/admin/regions/${regionId}`);
    } catch (error) {
        console.error("Error deleting region:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete region');
    }
};

// Filieres API endpoints
const getFilieres = async () => {
    try {
        const response = await apiClient.get('/admin/filieres');
        return response.data;
    } catch (error) {
        console.error("Error fetching filieres:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch filieres');
    }
};

const createFiliere = async (filiereData) => {
    try {
        const response = await apiClient.post('/admin/filieres', filiereData);
        return response.data;
    } catch (error) {
        console.error("Error creating filiere:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create filiere');
    }
};

const updateFiliere = async (filiereId, filiereData) => {
    try {
        const response = await apiClient.put(`/admin/filieres/${filiereId}`, filiereData);
        return response.data;
    } catch (error) {
        console.error("Error updating filiere:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update filiere');
    }
};

const deleteFiliere = async (filiereId) => {
    try {
        await apiClient.delete(`/admin/filieres/${filiereId}`);
    } catch (error) {
        console.error("Error deleting filiere:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete filiere');
    }
};

// Formations API endpoints
const getFormations = async (page = 1, searchTerm = '') => {
    try {
        const response = await apiClient.get('/admin/formations', { 
            params: { 
                page,
                search: searchTerm 
            }
        });
        return response.data; // Assuming paginated response
    } catch (error) {
        console.error("Error fetching formations:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch formations');
    }
};

const createFormation = async (formationData) => {
    try {
        const response = await apiClient.post('/admin/formations', formationData);
        return response.data;
    } catch (error) {
        console.error("Error creating formation:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create formation');
    }
};

const updateFormation = async (formationId, formationData) => {
    try {
        const response = await apiClient.put(`/admin/formations/${formationId}`, formationData);
        return response.data;
    } catch (error) {
        console.error("Error updating formation:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update formation');
    }
};

const deleteFormation = async (formationId) => {
    try {
        await apiClient.delete(`/admin/formations/${formationId}`);
    } catch (error) {
        console.error("Error deleting formation:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete formation');
    }
};

// Sessions API endpoints
const getSessions = async (page = 1, filters = {}) => {
    try {
        const params = { page, ...filters };
        const response = await apiClient.get('/admin/sessions', { params });
        return response.data; // Assuming paginated response
    } catch (error) {
        console.error("Error fetching sessions:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch sessions');
    }
};

const getSessionById = async (sessionId) => {
    try {
        const response = await apiClient.get(`/admin/sessions/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching session details:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch session details');
    }
};

const createSession = async (sessionData) => {
    try {
        const response = await apiClient.post('/admin/sessions', sessionData);
        return response.data;
    } catch (error) {
        console.error("Error creating session:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create session');
    }
};

const updateSession = async (sessionId, sessionData) => {
    try {
        const response = await apiClient.put(`/admin/sessions/${sessionId}`, sessionData);
        return response.data;
    } catch (error) {
        console.error("Error updating session:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update session');
    }
};

const deleteSession = async (sessionId) => {
    try {
        await apiClient.delete(`/admin/sessions/${sessionId}`);
    } catch (error) {
        console.error("Error deleting session:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete session');
    }
};

const getFormateurs = async () => {
    try {
        const response = await apiClient.get('/admin/formateurs-list');
        return response.data;
    } catch (error) {
        console.error("Error fetching formateurs:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch formateurs');
    }
};

// Optionally add a health check method to test API connectivity
const checkApiHealth = async () => {
    try {
        const response = await apiClient.get('/test');
        return {
            status: 'success',
            message: response.data?.message || 'API is reachable',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'error',
            message: `API is unreachable: ${error.message}`,
            timestamp: new Date().toISOString(),
            details: error.response?.data || null
        };
    }
};

const AdminService = {
    getDashboardStats,
    getRecentUsers,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
    getRegions,
    createRegion,
    updateRegion,
    deleteRegion,
    getFilieres,
    createFiliere,
    updateFiliere,
    deleteFiliere,
    getFormations,
    createFormation,
    updateFormation,
    deleteFormation,
    getSessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession,
    getFormateurs,
    checkApiHealth
};

export default AdminService;