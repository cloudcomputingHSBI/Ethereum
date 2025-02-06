const { ethers } = require("hardhat");

async function main() {
  const startTime = Date.now(); // Startzeit der gesamten Ausführung
  const deployStartTime = Date.now();

  // 1) MultiElectionNFTVoting-Contract (inklusive NFT-Logik) deployen
  const VotingContract = await ethers.getContractFactory("MultiElectionNFTVoting");
  const votingInstance = await VotingContract.deploy();
  await votingInstance.waitForDeployment();
  const deployEndTime = Date.now();

  const votingContractAddress = await votingInstance.getAddress();
  console.log(`MultiElectionNFTVoting deployed to: ${votingContractAddress}`);
  console.log(`Dauer für Deployment: ${(deployEndTime - deployStartTime) / 1000} Sekunden\n`);

  // 2) Beispiel: NFT an die eigene Adresse minten (wird jetzt in createElection gemacht)
  const [owner] = await ethers.getSigners();
  console.log(`Aktueller Owner: ${owner.address}`);

  // 3) Neue Wahlen erstellen
  const currentTime = Math.floor(Date.now() / 1000); // Aktuelle Zeit in Unix-Timestamp
  const votingStartTime = currentTime + 1; // Startzeit: 1 Sekunde in der Zukunft
  const votingEndTime = votingStartTime + 3600; // Endzeit: 1 Stunde nach Start

  // Wahl 1 erstellen mit Owner als einziger wahlberechtigter Adresse
  const candidateNames1 = ["Alice", "Bob"];
  tx = await votingInstance.createElection(
    "Wahl 1",
    candidateNames1,
    votingStartTime,
    votingEndTime,
    [owner.address] // Nur der Owner kann abstimmen
  );
  await tx.wait();
  console.log("Wahl 1 erstellt:", candidateNames1);

  // Wahl 2 erstellen mit Owner als einziger wahlberechtigter Adresse
  const candidateNames2 = ["Eve", "Mallory"];
  tx = await votingInstance.createElection(
    "Wahl 2",
    candidateNames2,
    votingStartTime,
    votingEndTime,
    [owner.address] // Nur der Owner kann abstimmen
  );
  await tx.wait();
  console.log("Wahl 2 erstellt:", candidateNames2);

  // 4) (Optional) Test: Owner stimmt für Kandidat 0 in Wahl 1 ab
  console.log("Warte auf Startzeit der Abstimmung...");
  await new Promise((resolve) => setTimeout(resolve, (votingStartTime - currentTime) * 1000));

  // Abstimmung in Wahl 1 mit automatisch erkannter Token-ID
  tx = await votingInstance.vote(1, 0); // Wahl-ID: 1, Kandidat-Index: 0 (Alice)
  await tx.wait();
  console.log(`Owner (${owner.address}) hat in Wahl 1 für ${candidateNames1[0]} abgestimmt`);

  // Abstimmung für Wahl 2 mit automatisch erkannter Token-ID
  tx = await votingInstance.vote(2, 1); // Wahl-ID: 2, Kandidat-Index: 1 (Mallory)
  await tx.wait();
  console.log(`Owner (${owner.address}) hat in Wahl 2 für ${candidateNames2[1]} abgestimmt`);

  // 5) Ergebnisse abrufen
  const candidates1 = await votingInstance.getCandidates(1);
  console.log("Kandidaten und Stimmen für Wahl 1:", candidates1);

  const candidates2 = await votingInstance.getCandidates(2);
  console.log("Kandidaten und Stimmen für Wahl 2:", candidates2);

  const electionTimes1 = await votingInstance.getElectionTimes(1);
  console.log("Zeiten für Wahl 1:", electionTimes1);

  const electionTimes2 = await votingInstance.getElectionTimes(2);
  console.log("Zeiten für Wahl 2:", electionTimes2);

  const getElectionDetails1 = await votingInstance.getElectionDetails(1);
  console.log("Alle Details für Wahl 1:", getElectionDetails1);

  const getElectionDetails2 = await votingInstance.getElectionDetails(2);
  console.log("Alle Details für Wahl 2:", getElectionDetails2);

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`Gesamtdauer des Deployments: ${totalTime} Sekunden`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
