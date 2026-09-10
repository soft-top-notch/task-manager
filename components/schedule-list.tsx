"use client";

import { formatEther } from "ethers";
import { formatPeriod, formatTimestamp, isDue, shortenAddress } from "@/lib/format";
import type { PaymentSchedule } from "@/lib/types";

type ScheduleListProps = {
  schedules: PaymentSchedule[];
  nowSeconds: number;
  busy: boolean;
  canManage: boolean;
  onExecute: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
};

export function ScheduleList({
  schedules,
  nowSeconds,
  busy,
  canManage,
  onExecute,
  onCancel,
}: ScheduleListProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Schedules</h2>
      {schedules.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">No schedules yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {schedules.map((schedule) => {
            const due = isDue(
              schedule.lastPaidAt,
              schedule.periodSeconds,
              nowSeconds
            );
            return (
              <li
                key={schedule.id}
                className="rounded-xl border border-stone-200 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-900">
                      #{schedule.id} → {shortenAddress(schedule.recipient)}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatEther(schedule.amountWei)} ETH {formatPeriod(schedule.periodSeconds)}
                    </p>
                    <p className="text-xs text-stone-400">
                      Last paid: {formatTimestamp(schedule.lastPaidAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        !schedule.active
                          ? "bg-stone-100 text-stone-500"
                          : due
                            ? "bg-teal-50 text-teal-800"
                            : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {!schedule.active ? "Cancelled" : due ? "Due" : "Waiting"}
                    </span>
                    <button
                      type="button"
                      disabled={busy || !schedule.active || !due}
                      onClick={() => onExecute(schedule.id)}
                      className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      Execute payment
                    </button>
                    {canManage && schedule.active ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onCancel(schedule.id)}
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
