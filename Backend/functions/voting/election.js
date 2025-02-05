const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { myNftContract, multiElectionVotingContract } = require('../eth/contracts');


const router = express.Router();

// Route: Wahlen abrufen (nur die zugänglichen)
router.get('/elections', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Wahlen abrufen, die entweder offen oder für den Nutzer eingeschränkt zugänglich sind
    const elections = await prisma.election.findMany({
      where: {
        OR: [
          { access_type: 'open' },
          { 
            access_type: 'restricted',
            election_users: { some: { user_id: userId } }
          }
        ]
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
        access_type: true,
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
    const { name, description, formData, startdate, enddate, access_type, allowedUsers } = req.body;

    // Wahlparameter vorbereiten
    const startTime = Math.floor(new Date(startdate).getTime() / 1000);
    const endTime = Math.floor(new Date(enddate).getTime() / 1000);

    // Kandidaten aus formData extrahieren
    const radioButtons = formData.filter((item) => item.element === 'RadioButtons');
    const candidates = radioButtons[0].options.map(option => option.text);


    //Wahl auf der Blockchain erstellen
    const tx = await multiElectionVotingContract.createElection(name, candidates, startTime, endTime);
    await tx.wait(); // Transaktion abwarten

    // Blockchain-ID abrufen
    const blockchainId = await multiElectionVotingContract.electionCount();

    console.log('Blockchain-ID:', blockchainId.toString());

    // Wahl in der Datenbank speichern
    const election = await prisma.election.create({
      data: {
        name,
        description,
        start_date: new Date(startdate),
        end_date: new Date(enddate),
        created_by: userId,
        form_schema: formData || {},
        access_type,
        blockchain_id: blockchainId.toString(),
      },
    });

    // Berechtigte Nutzer für "restricted" Wahlen in der DB speichern
    if (access_type === 'restricted' && allowedUsers && allowedUsers.length > 0) {
      await prisma.election_users.createMany({
        data: allowedUsers.map(userId => ({
          election_id: election.election_id,
          user_id: userId,
        })),
      });

      // Wallet-Adressen der berechtigten Nutzer abrufen und NFTs minten
      const userWallets = await prisma.wallets.findMany({
        where: {
          user_id: { in: allowedUsers },
        },
        select: { wallet_address: true }
      });

      await Promise.all(
        userWallets.map(async (wallet) => {
          if (wallet.wallet_address) {
            const txMint = await myNftContract.mint(wallet.wallet_address, blockchainId);
            await txMint.wait();
          }
        })
      );
    }

    res.json({ success: true, election, blockchainId: blockchainId.toString() });
  } catch (error) {
    console.error('Fehler beim Erstellen der Wahl:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
});

router.get('/elections/:id/details', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Wahldetails aus der Datenbank abrufen
    const election = await prisma.election.findUnique({
      where: { election_id: parseInt(id, 10) },
      include: { 
        election_users: true // Lädt alle berechtigten Benutzer für restricted Wahlen
      },
    });

    if (!election) {
      return res.status(404).json({ error: 'Wahl nicht gefunden' });
    }

    // Wahldetails in ein Objekt packen
    const electionDetails = {
      election_id: election.election_id,
      name: election.name,
      description: election.description,
      start_date: election.start_date,
      end_date: election.end_date,
      blockchain_id: election.blockchain_id,
      form_schema: election.form_schema,
      access_type: election.access_type,
      allowedUsers: election.access_type === 'restricted' 
        ? election.election_users.map((eu) => eu.user_id) 
        : [],
    };

    res.json({ success: true, election: electionDetails });
  } catch (error) {
    console.error('Fehler beim Abrufen der Wahldetails:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten' });
  }
});

router.post('/elections/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { candidateIndex } = req.body;
    const userId = req.user.id;

    if (candidateIndex === undefined) {
      return res.status(400).json({ error: 'Ungültige Parameter.' });
    }

    // Wahl aus der Datenbank abrufen
    const election = await prisma.election.findUnique({
      where: { election_id: parseInt(id, 10) },
    });

    if (!election) {
      return res.status(404).json({ error: 'Wahl nicht gefunden' });
    }

    // Nutzer-Wallet abrufen
    const userWallet = await prisma.wallets.findFirst({
      where: { user_id: userId },
      select: { wallet_address: true }
    });

    if (!userWallet) {
      return res.status(403).json({ error: 'Keine Wallet gefunden. Registrierung erforderlich.' });
    }

    let tokenId;

    // Prüfen, ob die Wahl "restricted" oder "open" ist
    if (election.access_type === 'restricted') {
      // GESCHÜTZTE WAHLEN (Nutzer muss NFT bereits besitzen)
      try {
        tokenId = await myNftContract.tokenOfOwnerByIndex(userWallet.wallet_address, 0);
      } catch (error) {
        return res.status(403).json({ error: 'Du besitzt kein NFT für diese Wahl.' });
      }
    } else {
      // OFFENE WAHLEN (NFT muss vorher gemintet werden)
      console.log(`Minting NFT für ${userWallet.wallet_address} für Wahl ${id}`);
      const mintTx = await myNftContract.mint(userWallet.wallet_address, id);
      await mintTx.wait(); // Warten, bis das NFT in der Blockchain bestätigt wurde

      // Neue NFT-ID abrufen
      tokenId = await myNftContract.tokenOfOwnerByIndex(userWallet.wallet_address, 0);
    }

    // Sicherstellen, dass das NFT zur Wahl gehört
    const nftElectionId = await myNftContract.getElectionId(tokenId);
    if (nftElectionId.toString() !== election.blockchain_id.toString()) {
      return res.status(403).json({ error: 'Dieses NFT ist nicht für diese Wahl gültig.' });
    }

    // 5️⃣ Stimme auf der Blockchain abgeben
    const tx = await multiElectionVotingContract.vote(election.blockchain_id, candidateIndex, tokenId);
    await tx.wait();

    res.json({ success: true, message: 'Abstimmung erfolgreich!', transaction: tx.hash });

  } catch (error) {
    console.error('Fehler beim Abstimmen:', error);
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten.' });
  }
});

module.exports = router;
