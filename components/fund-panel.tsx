"use client";

import { useState, type FormEvent } from "react";

type FundPanelProps = {
  balanceEth: string;
  disabled: boolean;
  busy: boolean;
  onDeposit: (ethAmount: string) => Promise<void>;
};

export function FundPanel({
  balanceEth,
  disabled,
  busy,
  onDeposit,
}: FundPanelProps) {
  const [amount, setAmount] = useState("1");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onDeposit(amount.trim());
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Contract treasury</h2>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-stone-900">
        {Number(balanceEth).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })}{" "}
        <span className="text-base font-medium text-stone-500">ETH</span>
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-teal-600"
        />
        <button
          type="submit"
          disabled={disabled || busy}
          className="shrink-0 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          Deposit
        </button>
      </form>
    </section>
  );
}
