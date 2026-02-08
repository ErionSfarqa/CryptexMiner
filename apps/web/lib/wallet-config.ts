import type { WalletNetwork, WalletProvider } from "@/store/app-store";

export interface WalletProviderOption {
  id: WalletProvider;
  label: string;
  logo: string;
}

export interface WalletNetworkOption {
  id: WalletNetwork;
  label: string;
  logo: string;
}

export const walletProviderOptions: WalletProviderOption[] = [
  { id: "exodus", label: "Exodus", logo: "/wallet-logos/exodus.png" },
  { id: "trustwallet", label: "Trust Wallet", logo: "/wallet-logos/trustwallet.png" },
  { id: "phantom", label: "Phantom", logo: "/wallet-logos/phantom.png" },
  { id: "metamask", label: "MetaMask", logo: "/wallet-logos/metamask.png" },
  { id: "coinbase", label: "Coinbase", logo: "/wallet-logos/coinbase.png" },
  { id: "okx", label: "OKX", logo: "/wallet-logos/okx.png" },
  { id: "other", label: "Other", logo: "" },
];

export const walletNetworkOptions: WalletNetworkOption[] = [
  { id: "bitcoin", label: "Bitcoin", logo: "/network-logos/bitcoin.svg" },
  { id: "ethereum", label: "Ethereum", logo: "/network-logos/ethereum.svg" },
  { id: "solana", label: "Solana", logo: "/network-logos/solana.svg" },
  { id: "bnb-chain", label: "BNB Chain", logo: "/network-logos/bnb-chain.svg" },
  { id: "polygon", label: "Polygon", logo: "/network-logos/polygon.svg" },
  { id: "avalanche", label: "Avalanche", logo: "/network-logos/avalanche.svg" },
  { id: "ton", label: "TON", logo: "/network-logos/ton.svg" },
  { id: "arbitrum", label: "Arbitrum", logo: "/network-logos/arbitrum.svg" },
  { id: "optimism", label: "Optimism", logo: "/network-logos/optimism.svg" },
  { id: "dogecoin", label: "Dogecoin", logo: "/network-logos/dogecoin.svg" },
];

export function normalizeWalletProvider(provider: string): WalletProvider {
  return walletProviderOptions.some((item) => item.id === provider) ? (provider as WalletProvider) : "other";
}

export function normalizeWalletNetwork(network: string): WalletNetwork {
  const normalized = network.trim().toLowerCase();

  if (normalized === "ethereum" || normalized === "eth") return "ethereum";
  if (normalized === "solana" || normalized === "sol") return "solana";
  if (normalized === "bnb chain" || normalized === "bnb-chain" || normalized === "bnb") return "bnb-chain";
  if (normalized === "polygon" || normalized === "matic") return "polygon";
  if (normalized === "avalanche" || normalized === "avax") return "avalanche";
  if (normalized === "ton" || normalized === "toncoin") return "ton";
  if (normalized === "arbitrum" || normalized === "arb") return "arbitrum";
  if (normalized === "optimism" || normalized === "op") return "optimism";
  if (normalized === "dogecoin" || normalized === "doge") return "dogecoin";

  return "bitcoin";
}

export function providerById(provider: WalletProvider) {
  return walletProviderOptions.find((item) => item.id === provider) ?? walletProviderOptions[walletProviderOptions.length - 1];
}

export function networkById(network: WalletNetwork) {
  return walletNetworkOptions.find((item) => item.id === network) ?? walletNetworkOptions[0];
}

export function validateAddressForNetwork(network: WalletNetwork, address: string) {
  const trimmed = address.trim();
  if (!trimmed) {
    return "Address is required.";
  }

  if (network === "bitcoin") {
    const isValidBtc = /^(bc1[a-z0-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(trimmed);
    return isValidBtc ? null : "Enter a valid Bitcoin address (bc1, 1, or 3).";
  }

  const isValidEth = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  if (network === "ethereum") {
    return isValidEth ? null : "Enter a valid Ethereum address (0x + 40 hex chars).";
  }

  if (network === "solana") {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed) ? null : "Enter a valid Solana address.";
  }

  return trimmed.length >= 12 ? null : "Address looks too short for the selected network.";
}
