"use client";

import { useState, type FormEvent } from "react";
import { PERIOD_PRESETS } from "@/lib/types";

type ScheduleFormProps = {
  disabled: boolean;
  busy: boolean;
  onCreate: (
    recipient: string,
    ethAmount: string,
    periodSeconds: number
  ) => Promise<void>;
};

export function ScheduleForm({ disabled, busy, onCreate }: ScheduleFormProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.1");
  const [period, setPeriod] = useState(String(PERIOD_PRESETS[0].seconds));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(recipient.trim(), amount.trim(), Number(period));
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">New payment schedule</h2>
      <p className="mt-1 text-sm text-stone-500">
        Recipient address, ETH amount, and how often it can be paid.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-medium text-stone-700">
          Recipient
          <input
            required
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="0x…"
            className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 font-mono text-sm outline-none focus:border-teal-600"
          />
        </label>
        <label className="text-sm font-medium text-stone-700">
          Amount (ETH)
          <input
            required
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-teal-600"
          />
        </label>
        <label className="text-sm font-medium text-stone-700">
          Period
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-teal-600"
          >
            {PERIOD_PRESETS.map((preset) => (
              <option key={preset.seconds} value={preset.seconds}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={disabled || busy}
          className="sm:col-span-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          Create schedule
        </button>
      </form>
    </section>
  );
}
