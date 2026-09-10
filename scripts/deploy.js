const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const OWNER_KEY =
  process.env.OWNER_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function main() {
  const artifactPath = path.join(__dirname, "..", "artifacts", "RecurringPayroll.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Run `npm run compile` first.");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_KEY, provider);
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );
  const payroll = await factory.deploy();
  await payroll.waitForDeployment();

  const address = await payroll.getAddress();
  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();

  console.log(`RecurringPayroll deployed to ${address} (chainId ${chainId})`);

  const envPath = path.join(__dirname, "..", ".env.local");
  fs.writeFileSync(
    envPath,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}\nNEXT_PUBLIC_CHAIN_ID=${chainId}\n`
  );
  console.log(`Wrote ${envPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
