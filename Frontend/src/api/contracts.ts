import { getEnvVar } from "../env";


import VotingContractABI from "../../abis/MultiElectionNFTVoting.json";



import { ethers } from "ethers";

// Nutze `process.env`, nicht `import.meta.env`
const RPC_URL = "https://sepolia.infura.io/v3/63900b58876143a983fbcb3081113ea8"
const CONTRACT_ADDRESS = "0xf57E9A61404D816fc3bbC266e20f7c6D642A22DA"

console.log("🔗 RPC-URL:", RPC_URL);
console.log("📝 Vertragsadresse:", CONTRACT_ADDRESS);

export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

export const getVotingContract = (wallet: ethers.Wallet) => {
  return new ethers.Contract(CONTRACT_ADDRESS, VotingContractABI.abi, wallet);
};
