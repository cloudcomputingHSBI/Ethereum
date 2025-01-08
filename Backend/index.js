const express = require('express');
const { registerUser } = require('./functions/auth/register');
const { loginUser } = require('./functions/auth/login');


// Debugging: Ausgaben hinzufügen
console.log('registerUser:', typeof registerUser);
console.log('loginUser:', typeof loginUser);

const app = express();
app.use(express.json()); // Middleware für JSON-Parsing

// Routen definieren
app.post('/registerUser', registerUser);
app.post('/loginUser', loginUser);


// Exportiere die App für Google Cloud Functions
const functionsFramework = require('@google-cloud/functions-framework');
functionsFramework.http('app', app);
