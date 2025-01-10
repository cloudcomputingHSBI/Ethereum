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
          { is_public: true },
          { electionaccess: { some: { user_id: userId, access_granted: true } } },
        ],
      },
      select: {
        election_id: true,
        name: true,
        description: true,
        start_date: true,
        end_date: true,
        is_public: true,
      },
    });

    res.json(elections);
  } catch (error) {
    console.error('Fehler beim Abrufen der Wahlen:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten' });
  }
});

// Route: Mock-Ergebnisse für eine Wahl abrufen
router.get('/elections/:electionId/results', authenticateToken, async (req, res) => {
  const { electionId } = req.params;

  try {
    // Mock-Daten für Ergebnisse
    const mockResults = {
      electionId: parseInt(electionId, 10),
      totalVotes: 150,
      candidates: [
        { name: 'Kandidat A', votes: 70 },
        { name: 'Kandidat B', votes: 50 },
        { name: 'Kandidat C', votes: 30 },
      ],
      winner: 'Kandidat A',
    };

    res.json({
      success: true,
      data: mockResults,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Ergebnisse:', error);
    res.status(500).json({
      success: false,
      message: 'Ergebnisse konnten nicht abgerufen werden.',
    });
  }
});

const getElectionResults = async (req, res) => {
  const { electionId } = req.params;

  try {
    const mockResults = {
      electionId: parseInt(electionId, 10),
      totalVotes: 150,
      candidates: [
        { name: 'Kandidat A', votes: 70 },
        { name: 'Kandidat B', votes: 50 },
        { name: 'Kandidat C', votes: 30 },
      ],
      winner: 'Kandidat A',
    };

    res.json({
      success: true,
      data: mockResults,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Ergebnisse:', error);
    res.status(500).json({
      success: false,
      message: 'Ergebnisse konnten nicht abgerufen werden.',
    });
  }
};

router.get('/elections/:electionId/results', authenticateToken, getElectionResults);

module.exports = {
  router,
  getElectionResults,
};


module.exports = router;
