const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const parse = require('mrz').parse;
const { provider, wallet } = require('../eth/contracts');
const { ethers } = require('ethers');

const prisma = new PrismaClient();


const INITIAL_ETH_AMOUNT = ethers.parseEther('0.01');

console.log("INITIAL_ETH_AMOUNT:", INITIAL_ETH_AMOUNT);


async function sendInitialEth(recipientAddress) {
  try {
    console.log(`Sende ${ethers.formatEther(INITIAL_ETH_AMOUNT)} ETH an ${recipientAddress}...`);

    // Prüfen, ob die Master-Wallet genügend Guthaben hat
    const masterBalance = await provider.getBalance(wallet.address);
    if (masterBalance < INITIAL_ETH_AMOUNT) {
      console.error("Master-Wallet hat nicht genug Guthaben für den Transfer.");
      return null;
    }

    // Erstelle und sende die Transaktion mit der bereits vorhandenen Wallet
    const tx = await wallet.sendTransaction({
      to: recipientAddress,
      value: INITIAL_ETH_AMOUNT,
    });

    console.log(`Transaktion gesendet: ${tx.hash}`);
    await tx.wait();
    console.log(`Transaktion bestätigt: ${tx.hash}`);

    return tx.hash;
  } catch (error) {
    console.error("Fehler beim Senden von ETH:", error);
    return null;
  }
}

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, mrzData, publicKey } = req.body;

    if (!firstName || !lastName || !email || !password || !mrzData || !publicKey) {
      return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt werden.' });
    }

    // Prüfen, ob Nutzer bereits existiert
    // const existingUser = await prisma.users.findFirst({
    //   where: { mrz_data: { equals: mrzData } },
    // });
    // if (existingUser) {
    //   return res.status(409).json({ error: 'Diese MRZ-Daten wurden bereits registriert.' });
    // }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer speichern
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        mrz_data: mrzData,
        is_verified: true,
        name: `${firstName} ${lastName}`,
      },
    });

    // Public Key in Datenbank speichern
    await prisma.wallets.create({
      data: {
        user_id: user.user_id,
        wallet_address: publicKey,
      },
    });

    // 1️⃣ ETH an die neue Wallet senden
    const txHash = await sendInitialEth(publicKey);

    if (!txHash) {
      return res.status(500).json({ 
        message: 'Benutzer wurde registriert, aber die ETH-Überweisung ist fehlgeschlagen. Bitte kontaktiere den Support.', 
        walletAddress: publicKey
      });
    }

    res.status(201).json({ 
      message: 'Benutzer erfolgreich registriert und ETH gesendet.',
      walletAddress: publicKey,
      transactionHash: txHash
    });

  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
};
