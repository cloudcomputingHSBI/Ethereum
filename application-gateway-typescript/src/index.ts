import routes from './route';

const express = require('express');
const cors = require('cors');


const app = express();

// Aktiviere CORS für alle Routen
app.use(cors({
  origin: 'http://localhost:5174', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
// app.get('/api', async (req, res) => {
//     console.log("Iam unalive");
//     res.send("API route reached");
// });

app.use('/api', routes);
   
// Exportiere die App für Google Cloud Functions
const functionsFramework = require('@google-cloud/functions-framework');
functionsFramework.http('app', app);
