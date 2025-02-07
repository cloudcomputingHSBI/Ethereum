require("dotenv").config();
const { ethers } = require("ethers");

// 1. Verbindung zu Ethereum herstellen
const provider = new ethers.JsonRpcProvider(
  `${process.env.INFURA_URL}`
);

console.log("INFURA_PROJECT_ID:", process.env.INFURA_URL);
console.log("INFURA_URL:", process.env.INFURA_URL ? "Gefunden" : "Fehlt");

// 2. Wallet erstellen und mit dem Provider verbinden
const privateKey = process.env.PRIVATE_KEY.startsWith("0x")
  ? process.env.PRIVATE_KEY
  : `0x${process.env.PRIVATE_KEY}`;
const wallet = new ethers.Wallet(privateKey, provider);

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Vorhanden" : "Fehlt");

// 3. ABI des **einzigen** Smart Contracts importieren
const MultiElectionNFTVoting = require("../../abis/MultiElectionNFTVoting.json");

// 4. Contract-Adresse aus `.env` laden
const MULTI_ELECTION_NFT_VOTING_ADDRESS = process.env.MULTI_ELECTION_NFT_VOTING_ADDRESS;
console.log("MULTI_ELECTION_NFT_VOTING_ADDRESS:", MULTI_ELECTION_NFT_VOTING_ADDRESS ? "Gefunden" : "Fehlt");

// 5. Contract-Instanz erstellen
const multiElectionVotingContract = new ethers.Contract(
  MULTI_ELECTION_NFT_VOTING_ADDRESS,
  MultiElectionNFTVoting.abi,
  wallet
);

// 6. Export der Contract-Instanz
module.exports = {
  provider,
  wallet,
  multiElectionVotingContract, // Nur noch diesen Contract exportieren
};
