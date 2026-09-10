"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import {
  CONTRACT_ADDRESS,
  connectWallet,
  ensureExpectedNetwork,
  getBrowserProvider,
  getEthereum,
  getPayrollContract,
  hasWallet,
} from "@/lib/contract";
import type { PaymentRecord, PaymentSchedule } from "@/lib/types";

type PayrollState = {
  account: string | null;
  owner: string | null;
  balanceEth: string;
  schedules: PaymentSchedule[];
  history: PaymentRecord[];
  nowSeconds: number;
};

const emptyState: PayrollState = {
  account: null,
  owner: null,
  balanceEth: "0",
  schedules: [],
  history: [],
  nowSeconds: Math.floor(Date.now() / 1000),
};

function decodeContractError(error: unknown): string {
  if (error && typeof error === "object") {
    const maybe = error as {
      shortMessage?: string;
      reason?: string;
      message?: string;
    };
    if (maybe.shortMessage) return maybe.shortMessage;
    if (maybe.reason) return maybe.reason;
    if (maybe.message) return maybe.message;
  }
  return "Transaction failed.";
}

export function usePayroll() {
  const [state, setState] = useState<PayrollState>(emptyState);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = Boolean(CONTRACT_ADDRESS);
  const walletAvailable = hasWallet();
  const isOwner =
    Boolean(state.account && state.owner) &&
    state.account?.toLowerCase() === state.owner?.toLowerCase();

  const refresh = useCallback(async (account?: string | null) => {
    if (!CONTRACT_ADDRESS) return;
    const provider = await getBrowserProvider();
    const contract = await getPayrollContract(provider);
    const [owner, balance, rawSchedules, rawHistory] = await Promise.all([
      contract.owner() as Promise<string>,
      provider.getBalance(CONTRACT_ADDRESS),
      contract.getSchedules(),
      contract.getHistory(),
    ]);

    const schedules: PaymentSchedule[] = (
      rawSchedules as {
        recipient: string;
        amount: bigint;
        period: bigint;
        lastPaidAt: bigint;
        active: boolean;
      }[]
    ).map((item, id) => ({
      id,
      recipient: item.recipient,
      amountWei: item.amount,
      periodSeconds: item.period,
      lastPaidAt: item.lastPaidAt,
      active: item.active,
    }));

    const history: PaymentRecord[] = (
      rawHistory as {
        scheduleId: bigint;
        recipient: string;
        amount: bigint;
        paidAt: bigint;
      }[]
    ).map((item) => ({
      scheduleId: Number(item.scheduleId),
      recipient: item.recipient,
      amountWei: item.amount,
      paidAt: item.paidAt,
    }));

    setState((current) => ({
      account: account ?? current.account,
      owner,
      balanceEth: formatEther(balance),
      schedules,
      history: [...history].reverse(),
      nowSeconds: Math.floor(Date.now() / 1000),
    }));
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setStatus(null);
    try {
      const account = await connectWallet();
      const provider = await getBrowserProvider();
      await ensureExpectedNetwork(provider);
      setState((current) => ({ ...current, account }));
      await refresh(account);
      setStatus("Wallet connected.");
    } catch (err) {
      setError(decodeContractError(err));
    }
  }, [refresh]);

  const runTx = useCallback(
    async (label: string, action: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      setStatus(null);
      try {
        const provider = await getBrowserProvider();
        await ensureExpectedNetwork(provider);
        await action();
        await refresh();
        setStatus(label);
      } catch (err) {
        setError(decodeContractError(err));
      } finally {
        setBusy(false);
      }
    },
    [refresh]
  );

  const deposit = useCallback(
    async (ethAmount: string) => {
      await runTx("Deposit confirmed.", async () => {
        const provider = await getBrowserProvider();
        const contract = await getPayrollContract(provider, true);
        const tx = await contract.deposit({ value: parseEther(ethAmount) });
        await tx.wait();
      });
    },
    [runTx]
  );

  const createSchedule = useCallback(
    async (recipient: string, ethAmount: string, periodSeconds: number) => {
      await runTx("Schedule created.", async () => {
        const provider = await getBrowserProvider();
        const contract = await getPayrollContract(provider, true);
        const tx = await contract.createSchedule(
          recipient,
          parseEther(ethAmount),
          periodSeconds
        );
        await tx.wait();
      });
    },
    [runTx]
  );

  const executePayment = useCallback(
    async (scheduleId: number) => {
      await runTx(`Payment #${scheduleId} executed.`, async () => {
        const provider = await getBrowserProvider();
        const contract = await getPayrollContract(provider, true);
        const tx = await contract.executePayment(scheduleId);
        await tx.wait();
      });
    },
    [runTx]
  );

  const cancelSchedule = useCallback(
    async (scheduleId: number) => {
      await runTx(`Schedule #${scheduleId} cancelled.`, async () => {
        const provider = await getBrowserProvider();
        const contract = await getPayrollContract(provider, true);
        const tx = await contract.cancelSchedule(scheduleId);
        await tx.wait();
      });
    },
    [runTx]
  );

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum?.on) return;

    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0];
      const next = Array.isArray(accounts) ? String(accounts[0] ?? "") : "";
      if (!next) {
        setState(emptyState);
        return;
      }
      void refresh(next);
    };

    ethereum.on("accountsChanged", onAccounts);
    return () => {
      ethereum.removeListener?.("accountsChanged", onAccounts);
    };
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => ({
        ...current,
        nowSeconds: Math.floor(Date.now() / 1000),
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    ...state,
    busy,
    status,
    error,
    configured,
    walletAvailable,
    isOwner,
    connect,
    refresh,
    deposit,
    createSchedule,
    executePayment,
    cancelSchedule,
  };
}
