"use client";

import { formatEther } from "ethers";
import { formatTimestamp, shortenAddress } from "@/lib/format";
import type { PaymentRecord } from "@/lib/types";

type PaymentHistoryProps = {
  history: PaymentRecord[];
};

export function PaymentHistory({ history }: PaymentHistoryProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Payment history</h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">No payments have been executed yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2 pr-4 font-medium">When</th>
                <th className="py-2 pr-4 font-medium">Schedule</th>
                <th className="py-2 pr-4 font-medium">Recipient</th>
                <th className="py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={`${item.paidAt}-${index}`} className="border-b border-stone-100">
                  <td className="py-2 pr-4 text-stone-700">
                    {formatTimestamp(item.paidAt)}
                  </td>
                  <td className="py-2 pr-4">#{item.scheduleId}</td>
                  <td className="py-2 pr-4 font-mono">
                    {shortenAddress(item.recipient)}
                  </td>
                  <td className="py-2">{formatEther(item.amountWei)} ETH</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
