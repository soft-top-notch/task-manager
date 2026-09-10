"use client";

import { CONTRACT_ADDRESS } from "@/lib/contract";
import { shortenAddress } from "@/lib/format";
import { FundPanel } from "@/components/fund-panel";
import { PaymentHistory } from "@/components/payment-history";
import { ScheduleForm } from "@/components/schedule-form";
import { ScheduleList } from "@/components/schedule-list";
import { usePayroll } from "@/hooks/use-payroll";

export function PayrollApp() {
  const payroll = usePayroll();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-800">
            Recurring payroll
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
            Automatic payments for employees and freelancers
          </h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            The owner funds a Solidity contract, creates a schedule (recipient +
            amount + period), then executes each due payment with a button.
          </p>
        </div>
        <button
          type="button"
          onClick={() => payroll.connect()}
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          {payroll.account
            ? shortenAddress(payroll.account)
            : "Connect wallet"}
        </button>
      </header>

      {!payroll.configured ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Deploy the contract first (`npm run node` then `npm run deploy:local`) so
          `.env.local` receives `NEXT_PUBLIC_CONTRACT_ADDRESS`.
        </p>
      ) : null}

      {!payroll.walletAvailable ? (
        <p className="mt-4 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
          MetaMask (or another injected wallet) is required to talk to the
          contract through ethers.js.
        </p>
      ) : null}

      {payroll.owner ? (
        <p className="mt-4 text-sm text-stone-500">
          Contract {shortenAddress(CONTRACT_ADDRESS)} · Owner{" "}
          {shortenAddress(payroll.owner)}
          {payroll.isOwner ? " (you)" : ""}
        </p>
      ) : null}

      {payroll.error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {payroll.error}
        </p>
      ) : null}
      {payroll.status ? (
        <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {payroll.status}
        </p>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <FundPanel
            balanceEth={payroll.balanceEth}
            disabled={!payroll.account || !payroll.configured}
            busy={payroll.busy}
            onDeposit={payroll.deposit}
          />
          <ScheduleForm
            disabled={!payroll.isOwner || !payroll.configured}
            busy={payroll.busy}
            onCreate={payroll.createSchedule}
          />
        </div>
        <ScheduleList
          schedules={payroll.schedules}
          nowSeconds={payroll.nowSeconds}
          busy={payroll.busy}
          canManage={payroll.isOwner}
          onExecute={payroll.executePayment}
          onCancel={payroll.cancelSchedule}
        />
      </div>

      <div className="mt-5">
        <PaymentHistory history={payroll.history} />
      </div>
    </div>
  );
}
