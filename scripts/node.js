const ganache = require("ganache");

const PORT = Number(process.env.CHAIN_PORT || 8545);
const MNEMONIC =
  process.env.MNEMONIC ||
  "test test test test test test test test test test test junk";

const OWNER_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const OWNER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

async function main() {
  const server = ganache.server({
    chain: { chainId: 31337 },
    wallet: { mnemonic: MNEMONIC, totalAccounts: 10, defaultBalance: 10000 },
    logging: { quiet: false },
  });

  await server.listen(PORT, "127.0.0.1");
  console.log(`Local chain listening on http://127.0.0.1:${PORT} (chainId 31337)`);
  console.log("Import this owner account into MetaMask:\n");
  console.log(`Account #0: ${OWNER_ADDRESS}`);
  console.log(`Private Key: ${OWNER_KEY}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
