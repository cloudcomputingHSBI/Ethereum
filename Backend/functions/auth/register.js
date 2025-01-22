const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const parse = require('mrz').parse;
const crypto = require('crypto');
const ethers = require('ethers');


const prisma = new PrismaClient();

// Funktion zur Verschlüsselung des privaten Schlüssels mit `crypto.createCipheriv`
function encryptPrivateKey(privateKey, secret) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(secret).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Rückgabe der verschlüsselten Daten zusammen mit dem IV
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
  };
}

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

    // Generiere ein neues Wallet für den Benutzer
    const wallet = ethers.Wallet.createRandom();

    // Verschlüssle den privaten Schlüssel
    const secret = process.env.PRIVATE_KEY_SECRET || 'geheim';
    const { encryptedData, iv } = encryptPrivateKey(wallet.privateKey, secret);

    // Speichere das Wallet in der Datenbank
    await prisma.wallets.create({
      data: {
        user_id: user.user_id,
        wallet_address: wallet.address,
        encrypted_private_key: encryptedData,
        iv: iv,
      },
    });

    res.status(201).json({ message: 'Benutzer und Wallet erfolgreich registriert.', user });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
};
