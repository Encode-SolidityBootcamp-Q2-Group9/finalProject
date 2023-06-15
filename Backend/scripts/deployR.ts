import { RussianRoulette, RussianRoulette__factory,  } from "../typechain-types";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    // Setup wallet, provider, signer & check balance
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    console.log(`Connected to wallet address ${wallet.address}`);
    const provider = new ethers.providers.InfuraProvider("sepolia", process.env.INFURA_API_KEY);
    const lastBlock = await provider?.getBlock("latest");
    console.log(`Connected to the block number ${lastBlock?.number}`);
    const signer = wallet.connect(provider);
    console.log(`Connected to signer address ${signer.address}`);
    const balance = await signer.getBalance();
    console.log(`Account balance: ${ethers.utils.formatEther(balance)} ETH`);
    
    // Define your contract factories
    let russianRouletteContractFactory: RussianRoulette__factory;


   
    // Deploy Contract
    console.log("Deploying RussianRoulette contract");
    russianRouletteContractFactory = new RussianRoulette__factory(signer);
    const RRContract = await russianRouletteContractFactory.deploy();

    const deployReceipt = await RRContract.deployTransaction.wait();
    console.log(`The deploy transaction was mined in block ${deployReceipt.blockNumber}`);
    
   
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
