"use client";

import { useMemo, useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { AddressModal } from "@/components/wallet/address-modal";
import { LogoMark } from "@/components/wallet/logo-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { SUPPORTED_ASSETS, usdtSymbolForCoin, type SupportedCoin } from "@/lib/binance";
import { useTickerData } from "@/lib/market-hooks";
import {
  networkById,
  normalizeWalletNetwork,
  normalizeWalletProvider,
  providerById,
} from "@/lib/wallet-config";
import { formatCrypto, formatCurrency } from "@/lib/utils";
import { useCryptexStore, type SavedAddress } from "@/store/app-store";

const coinMeta: Record<SupportedCoin, { label: string; icon?: string }> = {
  BTC: { label: "Bitcoin", icon: "/coins/btc.svg" },
  ETH: { label: "Ethereum", icon: "/coins/eth.svg" },
  SOL: { label: "Solana", icon: "/coins/sol.svg" },
  BNB: { label: "BNB" },
  XRP: { label: "XRP" },
  DOGE: { label: "Dogecoin" },
  ADA: { label: "Cardano" },
  AVAX: { label: "Avalanche" },
  TON: { label: "Toncoin" },
  DOT: { label: "Polkadot" },
};

function shortenAddress(address: string) {
  if (address.length <= 18) {
    return address;
  }

  return `${address.slice(0, 9)}...${address.slice(-7)}`;
}

export default function WalletPage() {
  const balances = useCryptexStore((state) => state.balances);
  const activities = useCryptexStore((state) => state.activities);
  const addresses = useCryptexStore((state) => state.addresses);
  const preferredFiat = useCryptexStore((state) => state.preferredFiat);
  const addAddress = useCryptexStore((state) => state.addAddress);
  const updateAddress = useCryptexStore((state) => state.updateAddress);
  const deleteAddress = useCryptexStore((state) => state.deleteAddress);

  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [modalRenderKey, setModalRenderKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const symbols = useMemo(
    () => (preferredFiat === "EUR" ? [...SUPPORTED_ASSETS.map(usdtSymbolForCoin), "EURUSDT"] : SUPPORTED_ASSETS.map(usdtSymbolForCoin)),
    [preferredFiat],
  );

  const tickerQuery = useTickerData(symbols, 3000);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();

    tickerQuery.data?.data.forEach((item) => {
      map.set(item.symbol, item.lastPrice);
    });

    return map;
  }, [tickerQuery.data]);

  const eurUsdt = priceMap.get("EURUSDT") ?? 0;

  const assetRows = useMemo(
    () =>
      SUPPORTED_ASSETS.map((coin) => {
        const amount = balances[coin];
        const symbol = usdtSymbolForCoin(coin);
        const usdPrice = priceMap.get(symbol);
        const usdValue = amount * (usdPrice ?? 0);
        const value = preferredFiat === "EUR" && eurUsdt > 0 ? usdValue / eurUsdt : usdValue;

        return {
          coin,
          amount,
          value,
          available: typeof usdPrice === "number",
        };
      }),
    [balances, eurUsdt, preferredFiat, priceMap],
  );

  const someUnavailable = assetRows.some((asset) => !asset.available);
  const totalValue = assetRows.reduce((sum, asset) => (asset.available ? sum + asset.value : sum), 0);

  return (
    <div className="space-y-4">
      <Toast message={toast} />

      <Card className="rounded-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Wallet Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totalValue, preferredFiat)}</h1>
        <p className="mt-2 text-sm text-slate-300">Portfolio value uses live Binance market prices and tracked balances.</p>
        {tickerQuery.data?.stale ? <p className="mt-2 text-xs text-amber-200">Unavailable / Stale</p> : null}
        {someUnavailable ? <p className="mt-1 text-xs text-amber-200">Some assets unavailable</p> : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card className="rounded-2xl">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Assets</p>
          <div className="mt-4 space-y-3">
            {assetRows.map((asset) => (
              <div key={asset.coin} className="flex items-center justify-between rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-3">
                <div className="flex items-center gap-3">
                  <LogoMark
                    src={coinMeta[asset.coin].icon}
                    alt={`${asset.coin} icon`}
                    fallback={asset.coin}
                    size={28}
                    className="rounded-lg"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{coinMeta[asset.coin].label}</p>
                    <p className="text-xs text-slate-400">
                      {formatCrypto(asset.amount)} {asset.coin}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-100">
                  {asset.available ? formatCurrency(asset.value, preferredFiat) : "Unavailable / Stale"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Connected Wallets</p>
            <Button
              size="sm"
              onClick={() => {
                setEditingAddress(null);
                setModalRenderKey((value) => value + 1);
                setAddressModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Connect wallet
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {addresses.length === 0 ? (
              <p className="text-sm text-slate-400">No wallets connected.</p>
            ) : (
              addresses.map((entry) => {
                const provider = providerById(normalizeWalletProvider(entry.provider));
                const network = networkById(normalizeWalletNetwork(entry.network));
                const label = entry.label.trim().length > 0 ? entry.label : `${provider.label} Wallet`;

                return (
                  <div key={entry.id} className="rounded-xl border border-slate-700/65 bg-slate-900/55 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{label}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                            <LogoMark
                              src={provider.logo}
                              alt={`${provider.label} logo`}
                              fallback={provider.label.slice(0, 2).toUpperCase()}
                              size={16}
                            />
                            {provider.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                            <LogoMark
                              src={network.logo}
                              alt={`${network.label} logo`}
                              fallback={network.id === "bitcoin" ? "BTC" : "ETH"}
                              size={16}
                            />
                            {network.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 truncate text-xs text-slate-300">{shortenAddress(entry.address)}</p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await navigator.clipboard.writeText(entry.address);
                          setToast("Copied");
                          setTimeout(() => setToast(null), 1800);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingAddress({
                            ...entry,
                            network: normalizeWalletNetwork(entry.network),
                            provider: normalizeWalletProvider(entry.provider),
                          });
                          setModalRenderKey((value) => value + 1);
                          setAddressModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-300 hover:text-rose-200"
                        onClick={() => deleteAddress(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Mining Activity</p>
        <div className="mt-4 space-y-2">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-400">No rewards yet. Start mining to generate activity.</p>
          ) : (
            activities.slice(0, 14).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2 text-sm">
                <div>
                  <p className="text-slate-100">
                    +{formatCrypto(activity.amount)} {activity.coin}
                  </p>
                  <p className="text-xs text-slate-400">
                    {activity.hashrate.toFixed(2)} TH/s {activity.blockEvent ? "- block pulse" : ""}
                  </p>
                </div>
                <span className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <AddressModal
        key={`${editingAddress?.id ?? "new"}-${modalRenderKey}`}
        isOpen={isAddressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        initial={editingAddress}
        onSubmit={(payload) => {
          if (editingAddress) {
            updateAddress(editingAddress.id, payload);
            setToast("Wallet updated");
          } else {
            addAddress(payload);
            setToast("Wallet connected");
          }

          setTimeout(() => setToast(null), 1800);
        }}
      />
    </div>
  );
}
