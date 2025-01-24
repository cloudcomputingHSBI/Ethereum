const { ethers } = require("hardhat");

async function main() {
  // 1) MyNFT-Contract deployen
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNft = await MyNFT.deploy();
  await myNft.waitForDeployment();

  // Contract-Adresse auslesen
  const myNftAddress = await myNft.getAddress();
  console.log("MyNFT deployed to:", myNftAddress);

  // 2) Beispiel: Ein paar NFTs minten
  const [owner] = await ethers.getSigners();

  tx = await myNft.mint(owner.address, 1); // NFT für Wahl 2
  await tx.wait();

  console.log("NFTs wurden gemintet und Wahlen zugeordnet:");
  console.log(`- Owner: Token für Wahl 1`);
  console.log(`- Owner: Token für Wahl 2`);

  // 3) MultiElectionNFTVoting-Contract deployen
  const MultiElectionNFTVoting = await ethers.getContractFactory("MultiElectionNFTVoting");
  const multiElectionVoting = await MultiElectionNFTVoting.deploy(myNftAddress);
  await multiElectionVoting.waitForDeployment();

  const multiElectionVotingAddress = await multiElectionVoting.getAddress();
  console.log("MultiElectionNFTVoting deployed to:", multiElectionVotingAddress);

  // 4) Neue Wahlen erstellen
  const currentTime = Math.floor(Date.now() / 1000); // Aktuelle Zeit in Unix-Timestamp
  const votingStartTime = currentTime + 10; // Startzeit: 1 Minute in der Zukunft
  const votingEndTime = votingStartTime + 3600; // Endzeit: 1 Stunde nach Start

  // Wahl 1 erstellen
  const candidateNames1 = ["Alice", "Bob"];
  tx = await multiElectionVoting.createElection(
    "Wahl 1",
    candidateNames1,
    votingStartTime,
    votingEndTime
  );
  await tx.wait();
  console.log("Wahl 1 erstellt:", candidateNames1);

  // Wahl 2 erstellen
  const candidateNames2 = ["Eve", "Mallory"];
  tx = await multiElectionVoting.createElection(
    "Wahl 2",
    candidateNames2,
    votingStartTime,
    votingEndTime
  );
  await tx.wait();
  console.log("Wahl 2 erstellt:", candidateNames2);

  // 5) (Optional) Test: Owner stimmt für Kandidat 0 in Wahl 1 ab
  console.log("Warte auf Startzeit der Abstimmung...");
  await new Promise((resolve) => setTimeout(resolve, (votingStartTime - currentTime) * 1000));

  // Abstimmung in Wahl 1
  tx = await multiElectionVoting.vote(1, 0, 1); // Wahl-ID: 1, Kandidat-Index: 0, Token-ID: 1
  await tx.wait();
  console.log(`Owner (${owner.address}) hat in Wahl 1 für ${candidateNames1[0]} abgestimmt`);

  // Ergebnisse abrufen
  const candidates = await multiElectionVoting.getCandidates(1);
  console.log("Kandidaten und Stimmen für Wahl 1:", candidates);

  const electionTimes = await multiElectionVoting.getElectionTimes(1);
  console.log("Zeiten für Wahl 1:", electionTimes);

  const getElectionDetails = await multiElectionVoting.getElectionDetails(1);
  console.log("Alle Details für Wahl 1:", getElectionDetails);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
