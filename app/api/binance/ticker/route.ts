import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_MARKET_SYMBOLS,
  fetchTicker24hrFromBinance,
  normalizeSymbols,
  type ApiMarketResponse,
  type BinanceTicker24hr,
} from "@/lib/binance";

const TICKER_TTL_MS = 2_500;

type CacheEntry = {
  updatedAt: number;
  data: BinanceTicker24hr[];
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
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const symbols = normalizeSymbols(
    symbolsParam ? symbolsParam.split(",") : [...DEFAULT_MARKET_SYMBOLS],
  );

  if (symbols.length === 0) {
    return withNoStoreHeaders(
      {
        data: [],
        stale: true,
        updatedAt: Date.now(),
        source: "cache",
        error: "At least one symbol is required",
      },
      400,
    );
  }

  const key = symbols.join(",");
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.updatedAt < TICKER_TTL_MS) {
    return withNoStoreHeaders({
      data: cached.data,
      stale: false,
      updatedAt: cached.updatedAt,
      source: "cache",
    });
  }

  try {
    const data = await fetchTicker24hrFromBinance(symbols);
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


