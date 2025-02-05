import express from 'express';
import cors from 'cors';
import { registerUser } from './functions/auth/register.js';
import { loginUser } from './functions/auth/login.js';
import electionRoutes from './functions/voting/election.js'; // Achte darauf, dass election.js den Router korrekt exportiert
import userRoutes from './functions/users/users.js'; // Gleiches gilt für userRoutes
import authenticateToken from './functions/middlewares/authenticateToken.js'; // Sicherstellen, dass authenticateToken exportiert wird

import functionsFramework from '@google-cloud/functions-framework';


const app = express();

// Aktiviere CORS für alle Routen
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Routen definieren
app.post('/registerUser', registerUser);
app.post('/loginUser', loginUser);
app.use('/api', authenticateToken , electionRoutes);
app.use('/users', authenticateToken, userRoutes);

// Exportiere die App für Google Cloud Functions
//const functionsFramework = require("@google-cloud/functions-framework");
functionsFramework.http("app", app);
