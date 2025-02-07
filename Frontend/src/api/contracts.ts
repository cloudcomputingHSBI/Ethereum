import VotingContractABI from "../../abis/MultiElectionNFTVoting.json";
import { ethers } from "ethers";


const RPC_URL = "https://arbitrum-mainnet.infura.io/v3/63900b58876143a983fbcb3081113ea8"
const CONTRACT_ADDRESS = "0x4b66FaF9B0865c20F852850BdE95A1465aC3ef93"

//const RPC_URL = "https://sepolia.infura.io/v3/63900b58876143a983fbcb3081113ea8"
//const CONTRACT_ADDRESS = "0xe6B5F25252B6abFdf3D83a7f04D6884d5241B928"


export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

export const getVotingContract = (wallet: ethers.Wallet) => {
  return new ethers.Contract(CONTRACT_ADDRESS, VotingContractABI.abi, wallet);
};
