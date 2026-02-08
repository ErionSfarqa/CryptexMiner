"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FiatCurrency, SupportedCoin } from "@/lib/binance";

export type WalletProvider = "exodus" | "metamask" | "phantom" | "trustwallet" | "coinbase";

export interface MiningActivity {
  id: string;
  coin: SupportedCoin;
  amount: number;
  timestamp: number;
  hashrate: number;
  blockEvent: boolean;
}

export interface SavedAddress {
  id: string;
  label: string;
  network: string;
  address: string;
  provider: WalletProvider;
  createdAt: number;
}

interface CryptexState {
  balances: Record<SupportedCoin, number>;
  activities: MiningActivity[];
  addresses: SavedAddress[];
  lowPowerAnimations: boolean;
  preferredFiat: FiatCurrency;
  calibrationComplete: boolean;
  addReward: (payload: Omit<MiningActivity, "id" | "timestamp">) => void;
  setCalibrationComplete: (value: boolean) => void;
  setLowPowerAnimations: (value: boolean) => void;
  setPreferredFiat: (value: FiatCurrency) => void;
  addAddress: (payload: Omit<SavedAddress, "id" | "createdAt">) => void;
  updateAddress: (id: string, patch: Partial<Omit<SavedAddress, "id" | "createdAt">>) => void;
  deleteAddress: (id: string) => void;
  resetLocalData: () => void;
}

const initialBalances: Record<SupportedCoin, number> = {
  BTC: 0,
  ETH: 0,
  SOL: 0,
};

export const useCryptexStore = create<CryptexState>()(
  persist(
    (set) => ({
      balances: initialBalances,
      activities: [],
      addresses: [],
      lowPowerAnimations: false,
      preferredFiat: "USD",
      calibrationComplete: false,
      addReward: ({ coin, amount, hashrate, blockEvent }) =>
        set((state) => ({
          balances: {
            ...state.balances,
            [coin]: state.balances[coin] + amount,
          },
          activities: [
            {
              id: crypto.randomUUID(),
              coin,
              amount,
              hashrate,
              timestamp: Date.now(),
              blockEvent,
            },
            ...state.activities,
          ].slice(0, 300),
        })),
      setCalibrationComplete: (value) => set({ calibrationComplete: value }),
      setLowPowerAnimations: (value) => set({ lowPowerAnimations: value }),
      setPreferredFiat: (value) => set({ preferredFiat: value }),
      addAddress: ({ label, network, address, provider }) =>
        set((state) => ({
          addresses: [
            {
              id: crypto.randomUUID(),
              label,
              network,
              address,
              provider,
              createdAt: Date.now(),
            },
            ...state.addresses,
          ],
        })),
      updateAddress: (id, patch) =>
        set((state) => ({
          addresses: state.addresses.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  ...patch,
                }
              : entry,
          ),
        })),
      deleteAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((entry) => entry.id !== id),
        })),
      resetLocalData: () =>
        set((state) => ({
          balances: initialBalances,
          activities: [],
          addresses: [],
          calibrationComplete: false,
          lowPowerAnimations: state.lowPowerAnimations,
          preferredFiat: state.preferredFiat,
        })),
    }),
    {
      name: "cryptex-miner-store",
      partialize: (state) => ({
        balances: state.balances,
        activities: state.activities,
        addresses: state.addresses,
        lowPowerAnimations: state.lowPowerAnimations,
        preferredFiat: state.preferredFiat,
        calibrationComplete: state.calibrationComplete,
      }),
    },
  ),
);

