const express = require('express');
const cors = require('cors');
const { registerUser } = require('./functions/auth/register');
const { loginUser } = require('./functions/auth/login');
const electionRoutes = require('./functions/voting/election');
const authenticateToken = require('./functions/middlewares/authenticateToken');

const app = express();

// Aktiviere CORS für alle Routen
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Routen definieren
app.post('/registerUser', registerUser);
app.post('/loginUser', loginUser);
app.use('/api', authenticateToken , electionRoutes);

// Exportiere die App für Google Cloud Functions
const functionsFramework = require('@google-cloud/functions-framework');
functionsFramework.http('app', app);
