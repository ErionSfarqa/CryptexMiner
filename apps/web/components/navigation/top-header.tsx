"use client";

import { useMemo } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SUPPORTED_ASSETS, usdtSymbolForCoin } from "@/lib/binance";
import { useConnectivity } from "@/lib/connectivity";
import { useTickerData } from "@/lib/market-hooks";
import { useCryptexStore } from "@/store/app-store";

export function TopHeader() {
  const balances = useCryptexStore((state) => state.balances);
  const preferredFiat = useCryptexStore((state) => state.preferredFiat);
  const { isOnline } = useConnectivity();

  const symbols = useMemo(
    () => (preferredFiat === "EUR" ? [...SUPPORTED_ASSETS.map(usdtSymbolForCoin), "EURUSDT"] : SUPPORTED_ASSETS.map(usdtSymbolForCoin)),
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

  const totalUsd = SUPPORTED_ASSETS.reduce(
    (sum, coin) => sum + balances[coin] * (tickerMap.get(usdtSymbolForCoin(coin)) ?? 0),
    0,
  );

  const eurUsdt = tickerMap.get("EURUSDT") ?? 0;
  const total = preferredFiat === "EUR" && eurUsdt > 0 ? totalUsd / eurUsdt : totalUsd;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <div className="ui-container flex w-full items-center justify-between gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">Portfolio</p>
          <p className="truncate text-base font-semibold text-white sm:text-lg">
            {formatCurrency(total, preferredFiat)}
          </p>
        </div>
        <div
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            isOnline
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-400/40 bg-rose-500/10 text-rose-200"
          }`}
          aria-live="polite"
        >
          {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>
    </header>
  );
}


