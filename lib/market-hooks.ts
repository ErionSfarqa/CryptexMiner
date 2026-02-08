"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchKlinesViaApi,
  fetchTickerViaApi,
  type ChartInterval,
} from "@/lib/binance";

export function useTickerData(symbols: string[], intervalMs = 2500) {
  return useQuery({
    queryKey: ["ticker", symbols.join(",")],
    queryFn: () => fetchTickerViaApi({ symbols }),
    refetchInterval: intervalMs,
    staleTime: intervalMs,
  });
}

export function useKlineData(symbol: string, interval: ChartInterval, limit = 200, pollMs = 20000) {
  return useQuery({
    queryKey: ["klines", symbol, interval, limit],
    queryFn: () => fetchKlinesViaApi({ symbol, interval, limit }),
    refetchInterval: pollMs,
    staleTime: pollMs,
  });
}


