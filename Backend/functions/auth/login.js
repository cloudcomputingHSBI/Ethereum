import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = '12345';

const loginUser = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Ungültige E-Mail-Adresse oder Passwort.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Ungültige E-Mail-Adresse oder Passwort.' });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '3h' }
    );

    res.status(200).json({
      message: 'Login erfolgreich',
      token,
    });
  } catch (error) {
    console.error('Fehler beim Login:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
};

export { loginUser }; // ESM-Export
