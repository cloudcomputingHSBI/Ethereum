import express from 'express';
import authenticateToken from '../middlewares/authenticateToken.js';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient(); 

const router = express.Router();

// Route: Get all users
router.get('/allUsers', async (req, res) => {
  try {
    // Holt alle Benutzer aus der Datenbank
    const users = await prisma.users.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        is_verified: true,
        registered_at: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// module.exports = router;
export default router; // ESM-Export