import { safeParseNumber } from "@/lib/utils";

export const BINANCE_BASE_URL = "https://api.binance.com";

export type FiatCurrency = "USD" | "EUR";
export const SUPPORTED_ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX", "TON", "DOT"] as const;
export type SupportedCoin = (typeof SUPPORTED_ASSETS)[number];
export type MineableCoin = "BTC" | "ETH" | "SOL";
export const MINEABLE_COINS: MineableCoin[] = ["BTC", "ETH", "SOL"];

export const DEFAULT_MARKET_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"] as const;

export type ChartInterval = "15m" | "1h" | "4h" | "1d";

export interface BinanceTicker24hr {
  symbol: string;
  priceChange: number;
  priceChangePercent: number;
  weightedAvgPrice: number;
  prevClosePrice: number;
  lastPrice: number;
  lastQty: number;
  bidPrice: number;
  askPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface BinanceKline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteAssetVolume: number;
  trades: number;
}

export interface ApiMarketResponse<T> {
  data: T;
  stale: boolean;
  updatedAt: number;
  source: "binance" | "cache";
  error?: string;
}

export interface ClientTickerParams {
  symbols: string[];
}

export interface ClientKlinesParams {
  symbol: string;
  interval: ChartInterval;
  limit?: number;
}

interface CachedPayload<T> {
  data: T;
  updatedAt: number;
}

function normalizeTicker(raw: Record<string, string>): BinanceTicker24hr {
  return {
    symbol: raw.symbol,
    priceChange: safeParseNumber(raw.priceChange),
    priceChangePercent: safeParseNumber(raw.priceChangePercent),
    weightedAvgPrice: safeParseNumber(raw.weightedAvgPrice),
    prevClosePrice: safeParseNumber(raw.prevClosePrice),
    lastPrice: safeParseNumber(raw.lastPrice),
    lastQty: safeParseNumber(raw.lastQty),
    bidPrice: safeParseNumber(raw.bidPrice),
    askPrice: safeParseNumber(raw.askPrice),
    openPrice: safeParseNumber(raw.openPrice),
    highPrice: safeParseNumber(raw.highPrice),
    lowPrice: safeParseNumber(raw.lowPrice),
    volume: safeParseNumber(raw.volume),
    quoteVolume: safeParseNumber(raw.quoteVolume),
    openTime: safeParseNumber(raw.openTime),
    closeTime: safeParseNumber(raw.closeTime),
    firstId: safeParseNumber(raw.firstId),
    lastId: safeParseNumber(raw.lastId),
    count: safeParseNumber(raw.count),
  };
}

function normalizeKline(raw: (number | string)[]): BinanceKline {
  return {
    openTime: Number(raw[0]),
    open: safeParseNumber(String(raw[1])),
    high: safeParseNumber(String(raw[2])),
    low: safeParseNumber(String(raw[3])),
    close: safeParseNumber(String(raw[4])),
    volume: safeParseNumber(String(raw[5])),
    closeTime: Number(raw[6]),
    quoteAssetVolume: safeParseNumber(String(raw[7])),
    trades: Number(raw[8]),
  };
}

export function normalizeSymbols(symbols: string[]) {
  return [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))];
}

export function symbolForCoin(coin: SupportedCoin, fiat: FiatCurrency) {
  if (fiat === "EUR") {
    return `${coin}EUR`;
  }

  return `${coin}USDT`;
}

export function usdtSymbolForCoin(coin: SupportedCoin) {
  return `${coin}USDT`;
}

function getCacheKey(kind: "ticker" | "klines", key: string) {
  return `cryptex:${kind}:${key}`;
}

function readLocalCache<T>(storageKey: string): CachedPayload<T> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as CachedPayload<T>;
  } catch {
    return null;
  }
}

function writeLocalCache<T>(storageKey: string, payload: CachedPayload<T>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // ignore cache write failures
  }
}

async function fetchFromBinance<T>(path: string) {
  const response = await fetch(`${BINANCE_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchTickerFromBinance({ symbols }: ClientTickerParams): Promise<ApiMarketResponse<BinanceTicker24hr[]>> {
  const normalized = normalizeSymbols(symbols);
  const cacheKey = getCacheKey("ticker", normalized.join(","));

  try {
    const encoded = encodeURIComponent(JSON.stringify(normalized));
    const raw = await fetchFromBinance<Record<string, string>[] | Record<string, string>>(
      `/api/v3/ticker/24hr?symbols=${encoded}`,
    );

    const data = Array.isArray(raw) ? raw.map(normalizeTicker) : [normalizeTicker(raw)];
    const updatedAt = Date.now();
    writeLocalCache(cacheKey, { data, updatedAt });

    return {
      data,
      stale: false,
      updatedAt,
      source: "binance",
    };
  } catch (error) {
    const cached = readLocalCache<BinanceTicker24hr[]>(cacheKey);

    if (cached) {
      return {
        data: cached.data,
        stale: true,
        updatedAt: cached.updatedAt,
        source: "cache",
        error: "Unavailable / Stale",
      };
    }

    return {
      data: [],
      stale: true,
      updatedAt: Date.now(),
      source: "cache",
      error: error instanceof Error ? error.message : "Unavailable / Stale",
    };
  }
}

export async function fetchKlinesFromBinance({
  symbol,
  interval,
  limit = 200,
}: ClientKlinesParams): Promise<ApiMarketResponse<BinanceKline[]>> {
  const symbolKey = symbol.toUpperCase();
  const boundedLimit = Math.min(Math.max(limit, 20), 1000);
  const cacheKey = getCacheKey("klines", `${symbolKey}:${interval}:${boundedLimit}`);

  try {
    const raw = await fetchFromBinance<(number | string)[][]>(
      `/api/v3/klines?symbol=${symbolKey}&interval=${interval}&limit=${boundedLimit}`,
    );

    const data = raw.map(normalizeKline);
    const updatedAt = Date.now();
    writeLocalCache(cacheKey, { data, updatedAt });

    return {
      data,
      stale: false,
      updatedAt,
      source: "binance",
    };
  } catch (error) {
    const cached = readLocalCache<BinanceKline[]>(cacheKey);

    if (cached) {
      return {
        data: cached.data,
        stale: true,
        updatedAt: cached.updatedAt,
        source: "cache",
        error: "Unavailable / Stale",
      };
    }

    return {
      data: [],
      stale: true,
      updatedAt: Date.now(),
      source: "cache",
      error: error instanceof Error ? error.message : "Unavailable / Stale",
    };
  }
}

export function symbolToCoin(symbol: string): SupportedCoin | null {
  const normalized = symbol.toUpperCase();
  const match = SUPPORTED_ASSETS.find((coin) => normalized.startsWith(coin));
  return match ?? null;
}
