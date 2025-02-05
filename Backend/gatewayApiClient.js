import axios from 'axios';

const API_BASE_URL = 'http://localhost:6666'; // Base URL aus .env

const gatewayApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// //Interceptor für Authorization-Header
// gatewayApiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('jwtToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Interceptor für Fehlerbehandlung
// gatewayApiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error.response || error.message);
//     return Promise.reject(error);
//   }
// );

export default gatewayApiClient;