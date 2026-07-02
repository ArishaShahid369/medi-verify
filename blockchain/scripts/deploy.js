import { ethers } from "ethers";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🚀 Deploying MediVerify to Sepolia...");

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deployer:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  const artifact = JSON.parse(
    readFileSync("./artifacts/contracts/MediVerify.sol/MediVerify.json", "utf8")
  );

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log("Deploying...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("--------------------------------");
  console.log("✅ MediVerify deployed on Sepolia!");
  console.log("📍 Contract Address:", address);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${address}`);
  console.log("--------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});