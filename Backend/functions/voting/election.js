//import gatewayApiClient from '../../gatewayApiClient.js';
import express from 'express';
import authenticateToken from '../middlewares/authenticateToken.js';
import { PrismaClient } from '@prisma/client';
import gatewayApiClient from '../../gatewayApiClient.js';

// const express = require('express');
// const authenticateToken = require('../middlewares/authenticateToken');
// const { PrismaClient } = require('@prisma/client');
// const gatewayApiClient = require('../../gatewayApiClient');
// //const gatewayApiClient = require('../../gatewayApiClient');
const prisma = new PrismaClient();

const router = express.Router();

// Route: Wahlen abrufen (nur die zugänglichen)
router.get('/elections', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Wahlen abrufen, die entweder offen oder für den Nutzer eingeschränkt zugänglich sind
    const elections = await prisma.election.findMany({
      where: {
        OR: [
          { access_type: 'open' },
          { 
            access_type: 'restricted',
            election_users: { some: { user_id: userId } }
          }
        ]
      },
      select: {
        election_id: true,
        name: true,
        description: true,
        start_date: true,
        end_date: true,
        blockchain_id: true,
        created_by: true,
        created_at: true,
        access_type: true,
      },
    });

    res.json(elections);
  } catch (error) {
    console.error('Fehler beim Abrufen der Wahlen:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten' });
  }
});


// Route: Neue Wahl erstellen (Blockchain und Datenbank)
router.post('/createElection', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, formData, startdate, enddate, access_type, allowedUsers } = req.body;



    // Blockchain-Transaktion ausführen
    const startTime = Math.floor(new Date(startdate).getTime());
    const endTime = Math.floor(new Date(enddate).getTime());

    // Wahl in der Datenbank speichern
    const election = await prisma.election.create({
      data: {
        name,
        description,
        start_date: new Date(startdate),
        end_date: new Date(enddate),
        created_by: userId,
        form_schema: formData || {},
        access_type,
        // blockchain_id: blockchainId.toString(), // Blockchain-ID speichern
      },
    });

    // Falls restricted, die berechtigten Nutzer in election_users speichern
    if (access_type === 'restricted' && allowedUsers && allowedUsers.length > 0) {
      await prisma.election_users.createMany({
        data: allowedUsers.map(userId => ({
          election_id: election.election_id,
          user_id: userId,
        })),
      });
    }
    
    const radioButtons = formData.filter((item) => item.element === 'RadioButtons');
    const options = radioButtons[0].options.map(option => option.text);

    const options_parse = options.join(',');
    const election_id = String(election.election_id);
    console.log(startTime, endTime);
    const start_time_str = String(startTime);
    const end_time_str = String(endTime);
    
    
    const gatwayResponse = await gatewayApiClient.post('/api/createElection', {
      election_id,
      options_parse,
      start_time_str,
      end_time_str,
    });

    res.json({ success: true, election }); //gatewayResponse ?
  } catch (error) {
    console.error('Fehler beim Erstellen der Wahl:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
});

router.get('/elections/:id/details', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Wahldetails aus der Datenbank abrufen
    const election = await prisma.election.findUnique({
      where: { election_id: parseInt(id, 10) },
      include: { 
        election_users: true // Lädt alle berechtigten Benutzer für restricted Wahlen
      },
    });

    if (!election) {
      return res.status(404).json({ error: 'Wahl nicht gefunden' });
    }

    // Wahldetails in ein Objekt packen
    const electionDetails = {
      election_id: election.election_id,
      name: election.name,
      description: election.description,
      start_date: election.start_date,
      end_date: election.end_date,
      blockchain_id: election.blockchain_id,
      form_schema: election.form_schema,
      access_type: election.access_type,
      allowedUsers: election.access_type === 'restricted' 
        ? election.election_users.map((eu) => eu.user_id) 
        : [],
    };

    const status =
    electionDetails.start_date && electionDetails.end_date
          ? new Date(electionDetails.start_date) > new Date()
            ? 'Geplant'
            : new Date(electionDetails.end_date) < new Date()
            ? 'Beendet'
            : 'Laufend'
          : 'Unbekannt';

    let gatewayResults;
    if(status == 'Beendet'){
      gatewayResults = await gatewayApiClient.get(`/api/results/${election.election_id}`);
    }


    res.json({ success: true, election: electionDetails, gatewayResults: gatewayResults ? gatewayResults.data: {} });
  } catch (error) {
    console.error('Fehler beim Abrufen der Wahldetails:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten' });
  }
});





// Route: Abstimmung durchführen
router.post('/elections/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    //const { candidateIndex, tokenId } = req.body;
    const {formData} = req.body;

    // if (candidateIndex === undefined || !tokenId) {
    //   return res.status(400).json({ error: 'Ungültige Parameter.' });
    // }

    const user_id = String(req.user.id);
    console.log(user_id);
    const election = await prisma.election.findUnique({
      where: { election_id: parseInt(id, 10) },
    });

    if (!election) {
      return res.status(404).json({ error: 'Wahl nicht gefunden' });
    }

    const key = formData[0].value[0];  
    const selected_button = election.form_schema[0].options.filter((item) => item.key == key);
    const selected_text = String(selected_button[0].text);
    console.log(selected_button, key, selected_text);

    const election_id = String(election.election_id);


    if (election.access_type === 'restricted') {
      const isAuthorized = await prisma.election_users.findFirst({
        where: { election_id: parseInt(id, 10), user_id: userId },
      });

      if (!isAuthorized) {
        return res.status(403).json({ error: 'Sie sind nicht berechtigt, an dieser Wahl teilzunehmen.' });
      }
    }

    
    // Abstimmung auf der Blockchain durchführen
    try{
      const gatewayResponse = await gatewayApiClient.post('/api/vote', {
        election_id,
        selected_text,
        user_id,
      });

    } catch(error){
      res.status(400).json({error: 'Sie haben bereits für diese Wahl abgestimmt'});
    }
    


    res.json({ success: true, message: 'Abstimmung erfolgreich.' });
  } catch (error) {
    console.error('Fehler beim Abstimmen:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
});

export default router;
