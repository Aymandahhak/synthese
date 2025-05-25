// src/api/axios.js
import axios from 'axios';

// Créer une instance axios configurée
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Ajouter le préfixe API
  withCredentials: false, // Désactiver temporairement pour tester
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  config => {
    console.log(`Requête API: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('Erreur de requête API:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  response => {
    console.log(`Réponse API: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    console.error('Erreur de réponse API:', error.response || error);
    return Promise.reject(error);
  }
);

export default api;
