import { BrowserProvider, Contract, type Eip1193Provider } from "ethers";
import { RECURRING_PAYROLL_ABI } from "@/lib/abi";

type EthereumProvider = Eip1193Provider & {
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void;
};

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim() ?? "";
export const EXPECTED_CHAIN_ID = BigInt(
  process.env.NEXT_PUBLIC_CHAIN_ID?.trim() || "31337"
);

export function getEthereum(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return window.ethereum as EthereumProvider | undefined;
}

export function hasWallet(): boolean {
  return Boolean(getEthereum());
}

export async function getBrowserProvider(): Promise<BrowserProvider> {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("No wallet found. Install MetaMask and try again.");
  }
  return new BrowserProvider(ethereum);
}

export async function connectWallet(): Promise<string> {
  const provider = await getBrowserProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts[0]) throw new Error("Wallet did not return an account.");
  return accounts[0];
}

export async function ensureExpectedNetwork(
  provider: BrowserProvider
): Promise<void> {
  const network = await provider.getNetwork();
  if (network.chainId === EXPECTED_CHAIN_ID) return;

  const hexChainId = `0x${EXPECTED_CHAIN_ID.toString(16)}`;
  const ethereum = getEthereum();
  if (!ethereum) return;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 4902 && EXPECTED_CHAIN_ID === 31337n) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: "Local Ganache",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["http://127.0.0.1:8545"],
          },
        ],
      });
      return;
    }
    throw error;
  }
}

export async function getPayrollContract(
  provider: BrowserProvider,
  withSigner = false
): Promise<Contract> {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONTRACT_ADDRESS. Deploy the contract first."
    );
  }
  if (withSigner) {
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, RECURRING_PAYROLL_ABI, signer);
  }
  return new Contract(CONTRACT_ADDRESS, RECURRING_PAYROLL_ABI, provider);
}
