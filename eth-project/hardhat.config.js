require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
      // Hier keine "accounts"-Angaben nötig, wenn du das Default-Hardhat-Network benutzt
    }
  }
};
