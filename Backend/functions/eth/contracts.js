require("dotenv").config();
const { ethers } = require("ethers");

// 1. Verbindung zu Ethereum herstellen
const provider = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
);

console.log("INFURA_PROJECT_ID:", process.env.INFURA_PROJECT_ID);


// 2. Wallet erstellen und mit dem Provider verbinden
const privateKey = process.env.PRIVATE_KEY.startsWith("0x")
  ? process.env.PRIVATE_KEY
  : `0x${process.env.PRIVATE_KEY}`;
const wallet = new ethers.Wallet(privateKey, provider);

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Vorhanden" : "Fehlt");

// 3. ABI der Smart Contracts importieren
const MyNFT = require("../../abis/MyNFT.json"); // Pfad zu deiner ABI-Datei
const MultiElectionNFTVoting = require("../../abis/MultiElectionNFTVoting.json");


console.log("MY_NFT_ADDRESS:", process.env.MY_NFT_ADDRESS);

// 4. Smart Contract-Adressen aus der `.env` laden
const MY_NFT_ADDRESS = process.env.MY_NFT_ADDRESS; // Adresse des MyNFT-Contracts
const MULTI_ELECTION_NFT_VOTING_ADDRESS = process.env.MULTI_ELECTION_NFT_VOTING_ADDRESS; // Adresse des Voting-Contracts

// 5. Contract-Instanzen erstellen
const myNftContract = new ethers.Contract(MY_NFT_ADDRESS, MyNFT.abi, wallet);
const multiElectionVotingContract = new ethers.Contract(
  MULTI_ELECTION_NFT_VOTING_ADDRESS,
  MultiElectionNFTVoting.abi,
  wallet
);

console.log("MULTI_ELECTION_NFT_VOTING_ADDRESS:", process.env.MULTI_ELECTION_NFT_VOTING_ADDRESS);


// 6. Export der Contract-Instanzen
module.exports = {
  provider,
  wallet,
  myNftContract,
  multiElectionVotingContract,
};
