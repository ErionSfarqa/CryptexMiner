"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchKlinesFromBinance,
  fetchTickerFromBinance,
  type ChartInterval,
} from "@/lib/binance";

export function useTickerData(symbols: string[], intervalMs = 2500) {
  return useQuery({
    queryKey: ["ticker", symbols.join(",")],
    queryFn: () => fetchTickerFromBinance({ symbols }),
    refetchInterval: intervalMs,
    staleTime: intervalMs,
  });
}

export function useKlineData(symbol: string, interval: ChartInterval, limit = 200, pollMs = 20000) {
  return useQuery({
    queryKey: ["klines", symbol, interval, limit],
    queryFn: () => fetchKlinesFromBinance({ symbol, interval, limit }),
    refetchInterval: pollMs,
    staleTime: pollMs,
  });
}
