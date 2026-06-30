import hre from "hardhat";

async function main() {
  console.log("Deploying MediVerify Smart Contract...");
  console.log("Network: Sepolia Testnet");
  console.log("--------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const MediVerify = await hre.ethers.getContractFactory("MediVerify");
  const mediVerify = await MediVerify.deploy();
  await mediVerify.waitForDeployment();

  const address = await mediVerify.getAddress();

  console.log("--------------------------------");
  console.log("MediVerify deployed!");
  console.log("Contract Address:", address);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${address}`);
  console.log("--------------------------------");
  console.log("Add to backend .env:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});