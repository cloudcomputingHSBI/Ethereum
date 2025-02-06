import { ethers } from "ethers";
import VotingContractABI from "../../abis/MultiElectionNFTVoting.json";

/**
 * Erstellt eine Instanz des Ethereum Providers.
 */
export function getProvider() {
  return new ethers.JsonRpcProvider(import.meta.env.VITE_ETHEREUM_RPC_URL);
}

/**
 * Erstellt eine Instanz des Voting Contracts für Blockchain-Interaktionen.
 */
export function getVotingContract(signer: ethers.Signer) {
  const contractAddress = import.meta.env.VITE_VOTING_CONTRACT;
  if (!contractAddress) throw new Error("❌ Fehler: Voting Contract Adresse fehlt in .env!");

  return new ethers.Contract(contractAddress, VotingContractABI.abi, signer);
}
