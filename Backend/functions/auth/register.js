const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const parse = require('mrz').parse;

const prisma = new PrismaClient();

exports.registerUser = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, password, mrzData } = req.body;

  try {
    // Prüfe, ob alle erforderlichen Daten vorhanden sind
    if (!firstName || !lastName || !email || !password || !mrzData) {
      return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt werden.' });
    }

    // MRZ-Daten auffüllen
    const mrzLines = [
      ('IDD<<' + mrzData.block1).padEnd(30, '<'), // Erste Zeile (TD1, 30 Zeichen)
      (mrzData.block2 + '<' + mrzData.block3 + 'D<<' + mrzData.block4).padEnd(29, '<') + mrzData.block5, // Zweite Zeile
      (lastName.toUpperCase() + '<<' + firstName.toUpperCase()).padEnd(30, '<'), // Dritte Zeile: Nachname und Vorname
    ];

    // MRZ-Daten parsen und validieren
    const result = parse(mrzLines);

    if (!result.valid) {
      return res.status(400).json({ error: 'Ungültige MRZ-Daten.' });
    }

    // Überprüfen, ob die MRZ-Daten bereits registriert wurden
    const existingUser = await prisma.users.findFirst({
      where: {
        mrz_data: {
          equals: JSON.stringify(mrzData),
        },
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Diese MRZ-Daten wurden bereits registriert.' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer in der Datenbank erstellen
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        mrz_data: JSON.stringify(mrzData),
        is_verified: true,
        name: `${firstName} ${lastName}`,
      },
    });

    res.status(201).json({ message: 'Benutzer erfolgreich registriert.', user });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
};
