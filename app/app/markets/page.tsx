"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/market/sparkline";
import { useKlineData, useTickerData } from "@/lib/market-hooks";
import { formatCurrency, formatPercent, nowLabel } from "@/lib/utils";
import type { BinanceTicker24hr, ChartInterval } from "@/lib/binance";

const watchlist = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];

const intervals: ChartInterval[] = ["15m", "1h", "4h", "1d"];

export default function MarketsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState<ChartInterval>("1h");

  const tickerQuery = useTickerData(watchlist, 2500);
  const chartQuery = useKlineData(selectedSymbol, selectedInterval, 200, 20000);

  const tickerMap = useMemo(() => {
    const map = new Map<string, BinanceTicker24hr>();

    tickerQuery.data?.data.forEach((item) => {
      map.set(item.symbol, item);
    });

    return map;
  }, [tickerQuery.data]);

  const chartData = useMemo(
    () =>
      chartQuery.data?.data.map((point) => ({
        time: point.closeTime,
        close: point.close,
        high: point.high,
        low: point.low,
        volume: point.volume,
      })) ?? [],
    [chartQuery.data],
  );

  const selectedTicker = tickerMap.get(selectedSymbol);
  const lastUpdated = Math.max(tickerQuery.data?.updatedAt ?? 0, chartQuery.data?.updatedAt ?? 0);
  const hasUnavailable = tickerQuery.data?.stale || chartQuery.data?.stale;

  return (
    <div className="grid gap-4">
      {hasUnavailable ? (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Live data unavailable. Displaying last known real Binance values.
        </div>
      ) : null}

      <Card className="rounded-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Markets</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">{selectedSymbol}</h1>
            <p className="mt-1 text-sm text-slate-300">
              {selectedTicker ? formatCurrency(selectedTicker.lastPrice, "USD") : "Unavailable / Stale"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {intervals.map((interval) => (
              <button
                key={interval}
                type="button"
                onClick={() => setSelectedInterval(interval)}
                className={`focus-ring rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  selectedInterval === interval
                    ? "border-cyan-300/70 bg-cyan-300/20 text-cyan-100"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"
                }`}
              >
                {interval}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 h-[19rem] sm:h-[23rem]">
          {chartQuery.isPending ? (
            <Skeleton className="h-full w-full rounded-2xl" />
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-rose-400/40 bg-rose-500/10 text-sm text-rose-100">
              Live data unavailable
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="marketGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2ad2c9" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#2ad2c9" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(120,140,180,0.18)" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(value: number) =>
                    new Date(value).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: selectedInterval === "1d" ? undefined : "2-digit",
                    })
                  }
                  stroke="#8ea1c0"
                  minTickGap={28}
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#8ea1c0" tick={{ fontSize: 11 }} domain={["dataMin", "dataMax"]} width={70} />
                <Tooltip
                  contentStyle={{
                    background: "#091423",
                    border: "1px solid rgba(120,160,210,0.35)",
                    borderRadius: "12px",
                    color: "#eaf1ff",
                  }}
                  labelFormatter={(value) =>
                    new Date(Number(value)).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  formatter={(value) => [Number(value).toFixed(2), "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#2ad2c9"
                  fill="url(#marketGradient)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-400">Last updated: {lastUpdated ? nowLabel(lastUpdated) : "Unavailable"}</p>
      </Card>

      <Card className="rounded-2xl overflow-hidden p-0">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700/70 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">24h</th>
                <th className="px-4 py-3 font-medium">Range</th>
                <th className="px-4 py-3 font-medium">Sparkline</th>
              </tr>
            </thead>
            <tbody>
              {tickerQuery.isPending
                ? watchlist.map((symbol) => (
                    <tr key={symbol} className="border-b border-slate-800/60">
                      <td className="px-4 py-3" colSpan={5}>
                        <Skeleton className="h-8 w-full rounded-lg" />
                      </td>
                    </tr>
                  ))
                : watchlist.map((symbol) => {
                    const row = tickerMap.get(symbol);
                    const positive = (row?.priceChangePercent ?? 0) >= 0;

                    return (
                      <tr
                        key={symbol}
                        className={`cursor-pointer border-b border-slate-800/60 transition hover:bg-slate-900/45 ${
                          selectedSymbol === symbol ? "bg-slate-900/40" : ""
                        }`}
                        onClick={() => setSelectedSymbol(symbol)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedSymbol(symbol);
                          }
                        }}
                        tabIndex={0}
                        aria-label={`Open ${symbol} chart`}
                      >
                        <td className="px-4 py-3 font-semibold text-white">{symbol.replace("USDT", "")}</td>
                        <td className="px-4 py-3 text-slate-100">
                          {row ? formatCurrency(row.lastPrice, "USD") : "Unavailable / Stale"}
                        </td>
                        <td className={`px-4 py-3 font-semibold ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                          {row ? formatPercent(row.priceChangePercent) : "--"}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {row ? `${row.lowPrice.toFixed(2)} - ${row.highPrice.toFixed(2)}` : "--"}
                        </td>
                        <td className="px-4 py-3">
                          <Sparkline symbol={symbol} />
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


