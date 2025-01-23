const { ethers } = require("hardhat");

async function main() {
  // 1) MyNFT-Contract deployen
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNft = await MyNFT.deploy();
  // Ethers v6: Warte auf die erfolgreiche Deployment-Transaktion
  await myNft.waitForDeployment();

  // Contract-Adresse auslesen
  const myNftAddress = await myNft.getAddress();
  console.log("MyNFT deployed to:", myNftAddress);

  // 2) Beispiel: Ein paar NFTs minten
  const [owner] = await ethers.getSigners();
  let tx = await myNft.mint(owner.address);
  await tx.wait();

  // 3) NFTVoting-Contract deployen
  const candidateNames = ["Alice", "Bob", "Charlie"];
  const NFTVoting = await ethers.getContractFactory("NFTVoting");
  const nftVoting = await NFTVoting.deploy(candidateNames, myNftAddress);
  await nftVoting.waitForDeployment();

  const nftVotingAddress = await nftVoting.getAddress();
  console.log("NFTVoting deployed to:", nftVotingAddress);

  // 4) (Optional) Test: Owner stimmt für Kandidat 0 ab
  tx = await nftVoting.vote(0);
  await tx.wait();
  console.log(`Owner (${owner.address}) hat für ${candidateNames[0]} abgestimmt`);
  console.log(await nftVoting.getCandidates());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
