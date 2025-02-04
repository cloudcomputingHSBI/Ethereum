const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { PrismaClient } = require('@prisma/client');
const { multiElectionVotingContract } = require('../eth/contracts');
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
    const startTime = Math.floor(new Date(startdate).getTime() / 1000);
    const endTime = Math.floor(new Date(enddate).getTime() / 1000);

    // const tx = await multiElectionVotingContract.createElection(
    //   name,
    //   candidates, // Array der Kandidatennamen
    //   startTime,
    //   endTime
    // );
    // await tx.wait(); // Auf Bestätigung der Transaktion warten

    // // Blockchain-ID der Wahl abrufen
    // const blockchainId = await multiElectionVotingContract.electionCount();

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

    res.json({ success: true, election });
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
    const { candidateIndex, tokenId } = req.body;

    if (candidateIndex === undefined || !tokenId) {
      return res.status(400).json({ error: 'Ungültige Parameter.' });
    }

    const election = await prisma.election.findUnique({
      where: { election_id: parseInt(id, 10) },
    });

    if (!election) {
      return res.status(404).json({ error: 'Wahl nicht gefunden' });
    }

    // Abstimmung auf der Blockchain durchführen
    const tx = await multiElectionVotingContract.vote(election.blockchain_id, candidateIndex, tokenId);
    await tx.wait();

    res.json({ success: true, message: 'Abstimmung erfolgreich.' });
  } catch (error) {
    console.error('Fehler beim Abstimmen:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
});

module.exports = router;
