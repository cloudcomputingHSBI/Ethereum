import axios from 'axios';

// 🔹 API-Base-URL (falls nicht in .env definiert, hier anpassen)
const API_BASE_URL = 'http://localhost:8080';

// 🔹 API-Client erstellen
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔹 Token-Variable für Node.js speichern
let authToken: string | null = null;

// Funktion zum Setzen des Tokens (wird von Tests oder Login-Funktion verwendet)
export function setAuthToken(token: string) {
  authToken = token;
}

// 🔹 Interceptor für Authorization-Header (setzt Token aus Speicher)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    authToken = localStorage.getItem('jwtToken'); // Falls im Browser, nutze localStorage
  }

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 🔹 Interceptor für Fehlerbehandlung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
