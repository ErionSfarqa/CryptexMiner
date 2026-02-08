import { safeParseNumber } from "@/lib/utils";

export const BINANCE_BASE_URL = "https://api.binance.com";

export type FiatCurrency = "USD" | "EUR";
export type SupportedCoin = "BTC" | "ETH" | "SOL";

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

async function fetchFromBinance<T>(path: string) {
  const response = await fetch(`${BINANCE_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CryptexMiner/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchTicker24hrFromBinance(symbols: string[]) {
  const normalized = normalizeSymbols(symbols);
  const encoded = encodeURIComponent(JSON.stringify(normalized));
  const raw = await fetchFromBinance<Record<string, string>[] | Record<string, string>>(
    `/api/v3/ticker/24hr?symbols=${encoded}`,
  );

  if (Array.isArray(raw)) {
    return raw.map(normalizeTicker);
  }

  return [normalizeTicker(raw)];
}

export async function fetchKlinesFromBinance(symbol: string, interval: string, limit: number) {
  const raw = await fetchFromBinance<(number | string)[][]>(
    `/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`,
  );

  return raw.map(normalizeKline);
}

export interface ClientTickerParams {
  symbols: string[];
}

export interface ClientKlinesParams {
  symbol: string;
  interval: ChartInterval;
  limit?: number;
}

export async function fetchTickerViaApi({ symbols }: ClientTickerParams) {
  const search = new URLSearchParams({ symbols: normalizeSymbols(symbols).join(",") });
  const response = await fetch(`/api/binance/ticker?${search.toString()}`);

  if (!response.ok) {
    throw new Error("Live data unavailable");
  }

  return (await response.json()) as ApiMarketResponse<BinanceTicker24hr[]>;
}

export async function fetchKlinesViaApi({ symbol, interval, limit = 200 }: ClientKlinesParams) {
  const search = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    interval,
    limit: String(limit),
  });
  const response = await fetch(`/api/binance/klines?${search.toString()}`);

  if (!response.ok) {
    throw new Error("Live data unavailable");
  }

  return (await response.json()) as ApiMarketResponse<BinanceKline[]>;
}

export function symbolToCoin(symbol: string): SupportedCoin | null {
  if (symbol.startsWith("BTC")) {
    return "BTC";
  }

  if (symbol.startsWith("ETH")) {
    return "ETH";
  }

  if (symbol.startsWith("SOL")) {
    return "SOL";
  }

  return null;
}


