import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, fiat: "USD" | "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: fiat,
    maximumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value);
}

export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatCrypto(value: number) {
  if (value >= 1) {
    return value.toFixed(4);
  }

  if (value >= 0.01) {
    return value.toFixed(6);
  }

  return value.toFixed(8);
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function safeParseNumber(value: string) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function nowLabel(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}


