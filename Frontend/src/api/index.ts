import axios from 'axios';

// API-Client konfigurieren
const API_BASE_URL = 'http://localhost:8080'; // Base URL aus .env

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
