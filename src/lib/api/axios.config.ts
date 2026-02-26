// src/lib/api/axios.config.ts
import axios from 'axios';

// Configuration de base d'axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Erreur 401 - Non autorisé
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Erreur 403 - Accès interdit
      if (error.response.status === 403) {
        console.error('Accès interdit');
      }
      
      // Erreur 500 - Erreur serveur
      if (error.response.status === 500) {
        console.error('Erreur serveur');
      }
    }
    return Promise.reject(error);
  }
);

export default api;