const fs = require("fs");
const path = require("path");
const solc = require("solc");

const CONTRACT_FILE = "RecurringPayroll.sol";
const sourcePath = path.join(__dirname, "..", "contracts", CONTRACT_FILE);
const source = fs.readFileSync(sourcePath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    [CONTRACT_FILE]: { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const fatal = output.errors.filter((error) => error.severity === "error");
  for (const error of output.errors) {
    console[error.severity === "error" ? "error" : "warn"](error.formattedMessage);
  }
  if (fatal.length > 0) {
    process.exit(1);
  }
}

const compiled = output.contracts[CONTRACT_FILE].RecurringPayroll;
const artifact = {
  contractName: "RecurringPayroll",
  abi: compiled.abi,
  bytecode: `0x${compiled.evm.bytecode.object}`,
};

const artifactsDir = path.join(__dirname, "..", "artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });
fs.writeFileSync(
  path.join(artifactsDir, "RecurringPayroll.json"),
  JSON.stringify(artifact, null, 2)
);

const abiTs = `export const RECURRING_PAYROLL_ABI = ${JSON.stringify(
  artifact.abi,
  null,
  2
)} as const;\n`;
fs.writeFileSync(path.join(__dirname, "..", "lib", "abi.ts"), abiTs);

console.log("Compiled RecurringPayroll");
