import type { HardhatConfig } from "hardhat/types/config";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatConfig = {
  solidity: {
    version: "0.8.19",
  },
  networks: {
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};

export default config;