"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTickerData } from "@/lib/market-hooks";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];

export function LiveTickerStrip() {
  const { data, isPending } = useTickerData(symbols, 2500);

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {symbols.map((symbol) => (
          <Skeleton key={symbol} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
        Live data unavailable.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.data.map((ticker, index) => {
        const isPositive = ticker.priceChangePercent >= 0;
        const price = formatCurrency(ticker.lastPrice, "USD");

        return (
          <motion.article
            key={ticker.symbol}
            className="glass-card card-hover gradient-border rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">{ticker.symbol.replace("USDT", "")}</p>
            <p className="mt-2 text-xl font-semibold text-white">{price}</p>
            <p className={`mt-1 inline-flex items-center gap-1 text-sm ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {formatPercent(ticker.priceChangePercent)}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
}


