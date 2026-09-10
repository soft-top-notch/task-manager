export type PaymentSchedule = {
  id: number;
  recipient: string;
  amountWei: bigint;
  periodSeconds: bigint;
  lastPaidAt: bigint;
  active: boolean;
};

export type PaymentRecord = {
  scheduleId: number;
  recipient: string;
  amountWei: bigint;
  paidAt: bigint;
};

export const PERIOD_PRESETS = [
  { label: "1 minute (demo)", seconds: 60 },
  { label: "1 hour", seconds: 60 * 60 },
  { label: "1 day", seconds: 60 * 60 * 24 },
  { label: "1 week", seconds: 60 * 60 * 24 * 7 },
  { label: "30 days", seconds: 60 * 60 * 24 * 30 },
] as const;
