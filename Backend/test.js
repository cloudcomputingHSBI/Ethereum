const { ethers } = require("ethers");

// Test-Private Key (soll vom Nutzer eingegeben werden)
const privateKey = "0xb59202ff36ddcade0f449548837aeb0019c1d9bfdffb58012fa44fb663eb665b"; 

// Public Key aus der Datenbank (angenommen)
const storedPublicKey = "0xecD708D5e9BE24F290ad6899EE21D8aF328f80c0"; // Hier den Public Key aus der DB einfügen

// Nachricht zum Signieren
const message = "Testnachricht";

async function verifyKeyPair(privateKey, storedPublicKey) {
  try {
    const wallet = new ethers.Wallet(privateKey);

    // Nachricht signieren
    const signature = await wallet.signMessage(message);

    // Public Key aus der Signatur extrahieren
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // Überprüfung, ob der extrahierte Public Key mit dem in der DB gespeicherten Public Key übereinstimmt
    if (recoveredAddress.toLowerCase() === storedPublicKey.toLowerCase()) {
      console.log("✅ Der Private Key passt zum gespeicherten Public Key!");
    } else {
      console.log("❌ Der Private Key stimmt NICHT mit dem gespeicherten Public Key überein!");
    }
  } catch (error) {
    console.error("❌ Fehler bei der Überprüfung:", error);
  }
}

// Test durchführen
verifyKeyPair(privateKey, storedPublicKey);
