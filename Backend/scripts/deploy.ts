import { Lottery, Lottery__factory, LotteryToken, LotteryToken__factory } from "../typechain-types";
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
    let lotteryContractFactory: Lottery__factory;
    let lotteryTokenContractFactory: LotteryToken__factory;

    // Define contract deployment parameters
    const tokenName = "LottoToken";
    const tokenSymbol = "LTO";
    const purchaseRatio = 1000; // example value, adjust as needed
    const betPrice = ethers.utils.parseUnits("1", 18); // example value, adjust as needed
    const betFee = ethers.utils.parseUnits("0.2", 18);// example value, adjust as needed

    // Deploy LotteryToken
    console.log("Deploying LotteryToken contract");
    lotteryTokenContractFactory = new LotteryToken__factory(signer);
    const lotteryTokenContract = await lotteryTokenContractFactory.deploy(tokenName, tokenSymbol);

    const tokenDeployReceipt = await lotteryTokenContract.deployTransaction.wait();
    console.log(`The deploy transaction was mined in block ${tokenDeployReceipt.blockNumber}`);
    console.log(`The LotteryToken contract was deployed at address ${lotteryTokenContract.address}`);

    // Deploy Lottery
    console.log("Deploying Lottery contract");
    lotteryContractFactory = new Lottery__factory(signer);
    const lotteryContract = await lotteryContractFactory.deploy(tokenName, tokenSymbol, purchaseRatio, betPrice, betFee);

    const lotteryDeployReceipt = await lotteryContract.deployTransaction.wait();
    console.log(`The deploy transaction was mined in block ${lotteryDeployReceipt.blockNumber}`);
    console.log(`The Lottery contract was deployed at address ${lotteryContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
