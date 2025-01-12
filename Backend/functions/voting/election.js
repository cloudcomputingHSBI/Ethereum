const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const router = express.Router();

// Route: Wahlen abrufen, für die der Nutzer zugelassen ist
router.get('/elections', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Alle Wahlen, auf die der Nutzer Zugriff hat
    const elections = await prisma.election.findMany({
      where: {
        OR: [
          { password: null }, // Öffentlich, falls kein Passwort
          { created_by: userId }, // Wahlen, die vom Nutzer erstellt wurden
        ],
      },
      select: {
        election_id: true,
        name: true,
        description: true,
        start_date: true,
        end_date: true,
        blockchain_id: true,
        password: true,
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

// Route: Neue Wahl erstellen
router.post('/createElection', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, description, formData, startdate, enddate, password } = req.body;


    // Erstelle eine neue Wahl
    const election = await prisma.election.create({
      data: {
        name,
        description,
        start_date: startdate ? new Date(startdate) : null,
        end_date: enddate ? new Date(enddate) : null,
        password: password || null,
        created_by: userId,
        form_schema: formData || {},
      },
    });

    

    res.json(election);
  } catch (error) {
    console.error('Fehler beim Erstellen der Wahl:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
});

router.post('/elections/:id/details', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const election = await prisma.election.findUnique({
      where: { election_id: parseInt(id, 10) },
    });

    if (!election) {
      return res.status(404).json({ error: 'Wahl nicht gefunden' });
    }

    // Passwort validieren (falls erforderlich)
    if (election.password && election.password !== password) {
      return res.status(403).json({ error: 'Ungültiges Passwort' });
    }

    res.json(election); // Rückgabe der Wahldaten
  } catch (error) {
    console.error('Fehler beim Abrufen der Wahldetails:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten' });
  }
});

module.exports = router;
