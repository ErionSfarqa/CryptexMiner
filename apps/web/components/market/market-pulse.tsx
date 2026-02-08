"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useKlineData, useTickerData } from "@/lib/market-hooks";
import { formatPercent, nowLabel } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const pulseSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];

export function MarketPulsePanel() {
  const tickerQuery = useTickerData(pulseSymbols, 3000);
  const klineQuery = useKlineData("BTCUSDT", "15m", 64, 20000);

  const movers = useMemo(() => {
    if (!tickerQuery.data?.data.length) {
      return [];
    }

    return [...tickerQuery.data.data]
      .sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
      .slice(0, 4);
  }, [tickerQuery.data]);

  if (tickerQuery.isPending || klineQuery.isPending) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!tickerQuery.data || !klineQuery.data) {
    return (
      <div className="rounded-2xl border border-rose-400/35 bg-rose-500/10 p-4 text-sm text-rose-100">
        Live data unavailable.
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
      <div className="glass-card card-hover gradient-border rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Market Pulse</p>
            <h3 className="text-lg font-semibold text-white">BTC/USDT Micro Trend</h3>
          </div>
          <p className="text-xs text-slate-400">Updated {nowLabel(klineQuery.data.updatedAt)}</p>
        </div>
        <div className="mt-4 h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={klineQuery.data.data.map((point) => ({
                time: point.closeTime,
                close: point.close,
              }))}
            >
              <XAxis
                dataKey="time"
                tickFormatter={(value: number) => new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                stroke="#8ea1c0"
                minTickGap={26}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={["dataMin", "dataMax"]}
                stroke="#8ea1c0"
                tick={{ fontSize: 11 }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "#0b1626",
                  border: "1px solid rgba(118,150,198,0.3)",
                  borderRadius: "12px",
                  color: "#e2ecff",
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
              <Line
                type="monotone"
                dataKey="close"
                stroke="#2ad2c9"
                strokeWidth={2.2}
                dot={false}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card card-hover gradient-border rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Top Movers</p>
        <div className="mt-3 space-y-3">
          {movers.map((asset) => {
            const positive = asset.priceChangePercent >= 0;

            return (
              <div
                key={asset.symbol}
                className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/45 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{asset.symbol.replace("USDT", "")}</p>
                  <p className="text-xs text-slate-400">{asset.lastPrice.toFixed(asset.lastPrice >= 10 ? 2 : 4)}</p>
                </div>
                <p className={`text-sm font-semibold ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatPercent(asset.priceChangePercent)}
                </p>
              </div>
            );
          })}
        </div>
        {tickerQuery.data.stale ? (
          <p className="mt-3 text-xs text-amber-200">Unavailable / Stale</p>
        ) : null}
      </div>
    </div>
  );
}


