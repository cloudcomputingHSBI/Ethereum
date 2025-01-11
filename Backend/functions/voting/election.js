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

router.post('/createElection', authenticateToken, async (req, res) => {

  try {

    const userId = req.user.id;

    let { name, description, formData, password, startDate, endDate} = req.body;

    // Nur gemocked!!!!
    startDate = new Date();
    endDate = new Date();

    // Erstelle eine neue Wahl
    const election = await prisma.election.create({
      data: 
      {
        name,
        description,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        password,
        created_by: userId,
        form_schema: formData,
        }
    })

    res.json(election);

  }
  catch (error) {
    console.error('Fehler beim Erstellen der Wahl:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten' });
  }

});

module.exports = router;
