# Recurring Payroll

A simplified on-chain payroll system: the owner funds a Solidity contract, creates payment schedules (recipient + amount + period), executes due payments with a button, and reviews payment history.

## Stack

- Solidity (`RecurringPayroll`)
- Next.js + TypeScript
- ethers.js v6
- solc (compile) and Ganache (local chain)

## How it works

1. **Create a schedule** — the owner stores a recipient address, ETH amount, and period (in seconds).
2. **Execute payment** — click **Execute payment** when the schedule is due. The first payment can run immediately; later ones wait for the period.
3. **History** — each successful transfer is stored on-chain and listed in the UI.

The contract holds ETH in a treasury. Execute fails if the balance is too low.

## Local setup

```bash
npm install
npm run compile
```

Start a local chain in one terminal:

```bash
npm run node
```

Deploy in another terminal (writes `.env.local`):

```bash
npm run deploy:local
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### MetaMask

1. Add network **Local Ganache**: RPC `http://127.0.0.1:8545`, chain ID `31337`, currency `ETH`.
2. Import the first private key printed by `npm run node` (that account is the contract owner).
3. Connect that wallet in the app, deposit ETH, create a schedule, then execute.

Use the **1 minute (demo)** period when you want to wait a short time and click execute again.

## Scripts

- `npm run dev` — Next.js development server
- `npm run build` — production build
- `npm test` — compile the contract and run tests
- `npm run compile` — compile Solidity with solc
- `npm run node` — local Ganache chain
- `npm run deploy:local` — deploy to the local chain

## Contract API (simplified)

| Function | Who | Purpose |
| --- | --- | --- |
| `deposit()` | anyone | send ETH into the treasury |
| `createSchedule(recipient, amount, period)` | owner | register a recurring payout |
| `executePayment(scheduleId)` | anyone | pay if due |
| `getSchedules()` / `getHistory()` | anyone | read current state |

## Project layout

```
contracts/RecurringPayroll.sol
scripts/compile.js
scripts/node.js
scripts/deploy.js
test/RecurringPayroll.test.js
app/                 Next.js UI
hooks/use-payroll.ts ethers.js wiring
lib/abi.ts           generated contract ABI
```
