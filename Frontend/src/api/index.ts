import axios from 'axios';

// API-Client konfigurieren
const API_BASE_URL = 'http://localhost:8080'; // Base URL aus .env

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor für Authorization-Header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken'); // JWT aus localStorage holen
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // JWT in die Anfrage einfügen
  }
  return config;
});

// Interceptor für Fehlerbehandlung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
