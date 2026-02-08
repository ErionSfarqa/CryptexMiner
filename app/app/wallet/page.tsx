"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { AddressModal } from "@/components/wallet/address-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { useTickerData } from "@/lib/market-hooks";
import { formatCrypto, formatCurrency } from "@/lib/utils";
import { symbolForCoin } from "@/lib/binance";
import { useCryptexStore, type SavedAddress } from "@/store/app-store";

const coinMeta = {
  BTC: { label: "Bitcoin", icon: "/coins/btc.svg" },
  ETH: { label: "Ethereum", icon: "/coins/eth.svg" },
  SOL: { label: "Solana", icon: "/coins/sol.svg" },
};

const providerLogo: Record<string, string> = {
  exodus: "/wallet-logos/exodus.png",
  metamask: "/wallet-logos/metamask.png",
  phantom: "/wallet-logos/phantom.png",
  trustwallet: "/wallet-logos/trustwallet.png",
  coinbase: "/wallet-logos/coinbase.png",
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
    () => [symbolForCoin("BTC", preferredFiat), symbolForCoin("ETH", preferredFiat), symbolForCoin("SOL", preferredFiat)],
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

  const assetRows = useMemo(
    () =>
      ["BTC", "ETH", "SOL"].map((coin) => {
        const symbol = symbolForCoin(coin as "BTC" | "ETH" | "SOL", preferredFiat);
        const amount = balances[coin as "BTC" | "ETH" | "SOL"];
        const value = amount * (priceMap.get(symbol) ?? 0);

        return {
          coin,
          amount,
          value,
        };
      }),
    [balances, preferredFiat, priceMap],
  );

  const totalValue = assetRows.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="space-y-4">
      <Toast message={toast} />

      <Card className="rounded-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Wallet Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totalValue, preferredFiat)}</h1>
        <p className="mt-2 text-sm text-slate-300">Portfolio value from real Binance prices and local simulation balances.</p>
        {tickerQuery.data?.stale ? <p className="mt-2 text-xs text-amber-200">Unavailable / Stale</p> : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card className="rounded-2xl">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Assets</p>
          <div className="mt-4 space-y-3">
            {assetRows.map((asset) => (
              <div key={asset.coin} className="flex items-center justify-between rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-3">
                <div className="flex items-center gap-3">
                  <Image src={coinMeta[asset.coin as keyof typeof coinMeta].icon} alt={`${asset.coin} icon`} width={28} height={28} />
                  <div>
                    <p className="text-sm font-semibold text-white">{coinMeta[asset.coin as keyof typeof coinMeta].label}</p>
                    <p className="text-xs text-slate-400">{formatCrypto(asset.amount)} {asset.coin}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-100">{formatCurrency(asset.value, preferredFiat)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Watch-only Addresses</p>
            <Button
              size="sm"
              onClick={() => {
                setEditingAddress(null);
                setModalRenderKey((value) => value + 1);
                setAddressModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {addresses.length === 0 ? (
              <p className="text-sm text-slate-400">No addresses saved.</p>
            ) : (
              addresses.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-700/65 bg-slate-900/55 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{entry.label}</p>
                      <p className="text-xs text-slate-400">{entry.network}</p>
                    </div>
                    <Image
                      src={providerLogo[entry.provider]}
                      alt={`${entry.provider} logo`}
                      width={20}
                      height={20}
                      className="rounded-sm"
                    />
                  </div>
                  <p className="mt-2 truncate text-xs text-slate-300">{shortenAddress(entry.address)}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(entry.address);
                        setToast("Address copied");
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
                        setEditingAddress(entry);
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
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Mining Activity</p>
        <div className="mt-4 space-y-2">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-400">No rewards yet. Start mining simulation to generate activity.</p>
          ) : (
            activities.slice(0, 14).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2 text-sm">
                <div>
                  <p className="text-slate-100">+{formatCrypto(activity.amount)} {activity.coin}</p>
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
            setToast("Address updated");
          } else {
            addAddress(payload);
            setToast("Address saved");
          }

          setTimeout(() => setToast(null), 1800);
        }}
      />
    </div>
  );
}


