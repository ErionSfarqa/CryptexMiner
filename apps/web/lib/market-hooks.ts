"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchKlinesFromBinance,
  fetchTickerFromBinance,
  type ChartInterval,
} from "@/lib/binance";
import { useConnectivity } from "@/lib/connectivity";

export function useTickerData(symbols: string[], intervalMs = 2500) {
  const { isOnline } = useConnectivity();

  return useQuery({
    queryKey: ["ticker", symbols.join(",")],
    queryFn: () => fetchTickerFromBinance({ symbols }),
    enabled: symbols.length > 0,
    networkMode: "always",
    refetchInterval: isOnline ? intervalMs : false,
    refetchOnReconnect: true,
    staleTime: intervalMs,
  });
}

export function useKlineData(symbol: string, interval: ChartInterval, limit = 200, pollMs = 20000) {
  const { isOnline } = useConnectivity();

  return useQuery({
    queryKey: ["klines", symbol, interval, limit],
    queryFn: () => fetchKlinesFromBinance({ symbol, interval, limit }),
    enabled: Boolean(symbol),
    networkMode: "always",
    refetchInterval: isOnline ? pollMs : false,
    refetchOnReconnect: true,
    staleTime: pollMs,
  });
}
