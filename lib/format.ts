export function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatPeriod(seconds: bigint | number): string {
  const value = Number(seconds);
  if (value % (60 * 60 * 24) === 0) {
    const days = value / (60 * 60 * 24);
    return days === 1 ? "every day" : `every ${days} days`;
  }
  if (value % (60 * 60) === 0) {
    const hours = value / (60 * 60);
    return hours === 1 ? "every hour" : `every ${hours} hours`;
  }
  if (value % 60 === 0) {
    const minutes = value / 60;
    return minutes === 1 ? "every minute" : `every ${minutes} minutes`;
  }
  return `every ${value} seconds`;
}

export function formatTimestamp(seconds: bigint): string {
  if (seconds === 0n) return "Never";
  return new Date(Number(seconds) * 1000).toLocaleString();
}

export function isDue(lastPaidAt: bigint, periodSeconds: bigint, nowSeconds: number): boolean {
  if (lastPaidAt === 0n) return true;
  return BigInt(nowSeconds) >= lastPaidAt + periodSeconds;
}
