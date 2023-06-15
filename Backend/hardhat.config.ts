import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan"; // add this line

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.7.0",
      },
      {
        version: "0.8.9",
      },
      {
        version: "0.8.4",
      },
    ],
    overrides: {
      "contracts/Lock.sol": {
        version: "0.8.9",
      },
      "contracts/LotteryToken.sol": {
        version: "0.8.4",
      },
      "contracts/YourChainlinkContract.sol": {
        version: "0.7.0",
      },
    },
  },
  networks: {
    sepolia: {
      url: "https://rpc2.sepolia.org",  // replace with your RPC node
      accounts: ["97a821c7cf94d717739f2b9a67d076152f22fee1997527ed6cb60fb584570ef9"], // replace with your private key
      // other settings as needed
    },
    // other networks as needed
  },
  etherscan: {
    apiKey: "7DCJMQ4BCZ2AQAMN2XVDIW6PHDYBUDG5XW"
  },
};

export default config;
