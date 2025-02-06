require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`], // Achte auf das "0x" vor dem privaten Schlüssel
    },
    arbitrumOne: { // Arbitrum One mit Infura
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, // Infura RPC für Arbitrum
      accounts: [`0x${process.env.PRIVATE_KEY}`], // Wallet Private Key (aus .env)
      chainId: 42161, // Chain-ID für Arbitrum One Mainnet
    },
  },
};
