"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { symbolForCoin } from "@/lib/binance";
import { useTickerData } from "@/lib/market-hooks";
import { useCryptexStore } from "@/store/app-store";

export function TopHeader() {
  const balances = useCryptexStore((state) => state.balances);
  const preferredFiat = useCryptexStore((state) => state.preferredFiat);

  const online = useSyncExternalStore(
    (notify) => {
      window.addEventListener("online", notify);
      window.addEventListener("offline", notify);

      return () => {
        window.removeEventListener("online", notify);
        window.removeEventListener("offline", notify);
      };
    },
    () => navigator.onLine,
    () => true,
  );

  const symbols = useMemo(
    () => [symbolForCoin("BTC", preferredFiat), symbolForCoin("ETH", preferredFiat), symbolForCoin("SOL", preferredFiat)],
    [preferredFiat],
  );

  const { data } = useTickerData(symbols, 3000);

  const tickerMap = useMemo(() => {
    const map = new Map<string, number>();

    data?.data.forEach((item) => {
      map.set(item.symbol, item.lastPrice);
    });

    return map;
  }, [data]);

  const total =
    balances.BTC * (tickerMap.get(symbolForCoin("BTC", preferredFiat)) ?? 0) +
    balances.ETH * (tickerMap.get(symbolForCoin("ETH", preferredFiat)) ?? 0) +
    balances.SOL * (tickerMap.get(symbolForCoin("SOL", preferredFiat)) ?? 0);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/45 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">Portfolio</p>
          <p className="truncate text-base font-semibold text-white sm:text-lg">
            {formatCurrency(total, preferredFiat)}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            online
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-400/40 bg-rose-500/10 text-rose-200"
          }`}
          aria-live="polite"
        >
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? "Online" : "Offline"}
        </div>
      </div>
    </header>
  );
}


