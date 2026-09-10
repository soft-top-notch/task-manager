const assert = require("node:assert/strict");
const { test } = require("node:test");
const ganache = require("ganache");
const { ethers } = require("ethers");
const artifact = require("../artifacts/RecurringPayroll.json");

async function deploy() {
  const eip1193 = ganache.provider({
    chain: { chainId: 31337 },
    wallet: {
      mnemonic: "test test test test test test test test test test test junk",
      defaultBalance: 10000,
    },
    logging: { quiet: true },
  });
  const provider = new ethers.BrowserProvider(eip1193);
  const accounts = await provider.send("eth_accounts", []);
  const owner = await provider.getSigner(accounts[0]);
  const worker = await provider.getSigner(accounts[1]);
  const other = await provider.getSigner(accounts[2]);
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    owner
  );
  const payroll = await factory.deploy();
  await payroll.waitForDeployment();
  return { provider, eip1193, payroll, owner, worker, other, accounts };
}

test("owner can create a schedule and execute the first payment immediately", async () => {
  const { payroll, worker } = await deploy();
  const amount = ethers.parseEther("0.5");
  const workerAddress = await worker.getAddress();

  await (await payroll.deposit({ value: ethers.parseEther("2") })).wait();
  await (await payroll.createSchedule(workerAddress, amount, 60)).wait();
  await (await payroll.executePayment(0)).wait();

  const history = await payroll.getHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].recipient, workerAddress);
  assert.equal(history[0].amount, amount);
});

test("second payment waits until the period elapses", async () => {
  const { payroll, worker, eip1193 } = await deploy();
  const workerAddress = await worker.getAddress();

  await (await payroll.deposit({ value: ethers.parseEther("2") })).wait();
  await (
    await payroll.createSchedule(workerAddress, ethers.parseEther("0.1"), 3600)
  ).wait();
  await (await payroll.executePayment(0)).wait();

  await assert.rejects(payroll.executePayment.staticCall(0));

  await eip1193.request({
    method: "evm_increaseTime",
    params: [3600],
  });
  await eip1193.request({ method: "evm_mine", params: [] });

  await (await payroll.executePayment(0)).wait();
  const history = await payroll.getHistory();
  assert.equal(history.length, 2);
});

test("non-owner cannot create a schedule", async () => {
  const { payroll, worker, other } = await deploy();
  const asOther = payroll.connect(other);
  await assert.rejects(
    asOther.createSchedule.staticCall(
      await worker.getAddress(),
      ethers.parseEther("1"),
      60
    )
  );
});
