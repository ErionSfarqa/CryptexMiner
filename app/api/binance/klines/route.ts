import { NextRequest, NextResponse } from "next/server";
import {
  fetchKlinesFromBinance,
  type ApiMarketResponse,
  type BinanceKline,
  type ChartInterval,
} from "@/lib/binance";

const KLINE_TTL_MS = 18_000;
const ALLOWED_INTERVALS: ChartInterval[] = ["15m", "1h", "4h", "1d"];

type CacheEntry = {
  updatedAt: number;
  data: BinanceKline[];
};

const cache = new Map<string, CacheEntry>();

function withNoStoreHeaders<T>(payload: ApiMarketResponse<T>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase() ?? "BTCUSDT";
  const interval = (request.nextUrl.searchParams.get("interval") ?? "1h") as ChartInterval;
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "200");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 20), 1000) : 200;

  if (!ALLOWED_INTERVALS.includes(interval)) {
    return withNoStoreHeaders(
      {
        data: [],
        stale: true,
        updatedAt: Date.now(),
        source: "cache",
        error: "Invalid interval",
      },
      400,
    );
  }

  const key = `${symbol}:${interval}:${limit}`;
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.updatedAt < KLINE_TTL_MS) {
    return withNoStoreHeaders({
      data: cached.data,
      stale: false,
      updatedAt: cached.updatedAt,
      source: "cache",
    });
  }

  try {
    const data = await fetchKlinesFromBinance(symbol, interval, limit);
    const updatedAt = Date.now();
    cache.set(key, { data, updatedAt });

    return withNoStoreHeaders({
      data,
      stale: false,
      updatedAt,
      source: "binance",
    });
  } catch (error) {
    if (cached) {
      return withNoStoreHeaders({
        data: cached.data,
        stale: true,
        updatedAt: cached.updatedAt,
        source: "cache",
        error: "Live data unavailable",
      });
    }

    return withNoStoreHeaders(
      {
        data: [],
        stale: true,
        updatedAt: now,
        source: "cache",
        error: error instanceof Error ? error.message : "Live data unavailable",
      },
      503,
    );
  }
}


