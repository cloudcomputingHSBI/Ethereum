const { PrismaClient } = require("@prisma/client");
const { ethers } = require("ethers");
const { provider, wallet } = require("./contracts");

const prisma = new PrismaClient();

// Mindestbetrag für eine Transaktion
const MIN_BALANCE = ethers.parseEther("0.0005");

// Betrag, der nachüberwiesen wird
const REFILL_AMOUNT = ethers.parseEther("0.001");

async function getWalletBalance(walletAddress) {
  return await provider.getBalance(walletAddress);
}

async function sendEthToUser(walletAddress) {
  try {
    console.log(`Überweise ${ethers.formatEther(REFILL_AMOUNT)} ETH an ${walletAddress}...`);

    // Prüfen, ob die Master-Wallet genug Guthaben hat
    const masterBalance = await provider.getBalance(wallet.address);
    if (masterBalance < REFILL_AMOUNT) {
      console.error("Master-Wallet hat nicht genug Guthaben für eine Nachzahlung.");
      return null;
    }

    // ETH senden
    const tx = await wallet.sendTransaction({
      to: walletAddress,
      value: REFILL_AMOUNT,
      gasLimit: 21000,
    });

    console.log(`Transaktion gesendet: ${tx.hash}`);
    await tx.wait();
    console.log(`Transaktion bestätigt: ${tx.hash}`);

    return tx.hash;
  } catch (error) {
    console.error("Fehler beim Nachladen von ETH:", error);
    return null;
  }
}

async function requestEth(req, res) {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ success: false, error: "Wallet-Adresse fehlt" });
  }

  try {
    // 1️⃣ Guthaben des Nutzers abrufen
    const balance = await getWalletBalance(walletAddress);
    console.log(`Wallet-Guthaben: ${ethers.formatEther(balance)} ETH`);

    // 2️⃣ Falls genug Guthaben vorhanden ist, kein Nachladen nötig
    if (balance >= MIN_BALANCE) {
      return res.json({ success: true, message: "Guthaben reicht aus, keine Nachladung erforderlich" });
    }

    // 3️⃣ ETH nachladen
    console.log("Guthaben zu niedrig, überweise ETH...");
    const txHash = await sendEthToUser(walletAddress);

    if (!txHash) {
      return res.status(500).json({ success: false, error: "Fehler beim Senden von ETH" });
    }

    return res.json({ success: true, message: "ETH erfolgreich nachgeladen", transactionHash: txHash });

  } catch (error) {
    console.error("Fehler bei der ETH-Prüfung:", error);
    return res.status(500).json({ success: false, error: "Interner Fehler bei der Guthabenprüfung" });
  }
}

module.exports = { requestEth };
