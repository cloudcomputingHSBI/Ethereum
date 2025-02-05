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

router.get('/elections', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Alle Wahlen, für die der Nutzer zugelassen ist
    const elections = await prisma.election.findMany({
      where: {
        election_users: {
          some: {
            user_id: userId,
          },
        },
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
    const { name, description, formData, startdate, enddate } = req.body;



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
        // blockchain_id: blockchainId.toString(), // Blockchain-ID speichern
      },
    });
    
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

// Route: Wahldetails aus der Blockchain abrufen
router.get('/elections/:id/details', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Blockchain-Details abrufen
    const [name, startTime, endTime, candidates] = await multiElectionVotingContract.getElectionDetails(
      id
    );

    const electionDetails = {
      name,
      startTime: startTime.toString(), // BigInt in String konvertieren
      endTime: endTime.toString(),     // BigInt in String konvertieren
      candidates: candidates.map((candidate) => ({
        name: candidate[0],
        votes: candidate[1].toString(), // BigInt in String konvertieren
      })),
    };

    res.json({ success: true, electionDetails });
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

    const election = await prisma.election.findUnique({
      where: { election_id: parseInt(id, 10) },
    });

    if (!election) {
      return res.status(404).json({ error: 'Wahl nicht gefunden' });
    }


    const radioButtons = formData.filter((item) => item.element === 'RadioButtons');
    const selectedOption = radioButtons[0].options.map(option => option.selected);
    const selectedTest = selectedOption ? selectedOption.text : null;

    console.log(selectedTest)

    const election_id = String(election.election_id);
    // Abstimmung auf der Blockchain durchführen
    const gatewayResponse = await gatewayApiClient.post('/api/vote', {
      election_id,
      options_parse,
    });


    res.json({ success: true, message: 'Abstimmung erfolgreich.' });
  } catch (error) {
    console.error('Fehler beim Abstimmen:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
});

export default router;
