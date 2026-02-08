"use client";

import { useSyncExternalStore } from "react";

export interface PaymentSession {
  token: string;
  orderId: string;
  paidAt: number;
  amount: string;
  currency: string;
}

interface PaymentSnapshot {
  isHydrated: boolean;
  session: PaymentSession | null;
  hasPaidAccess: boolean;
}

const STORAGE_KEY = "cryptex:payment:session";
const ACCESS_KEY = "hasPaid";
const UPDATE_EVENT = "cryptex:payment:update";
const IS_DEV = process.env.NODE_ENV === "development";

let snapshot: PaymentSnapshot = {
  isHydrated: false,
  session: null,
  hasPaidAccess: false,
};

let started = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function readStoredSession(): PaymentSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PaymentSession;
    if (!parsed?.token || !parsed?.orderId) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function readPaidAccess() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ACCESS_KEY) === "true";
}

function refreshSnapshot() {
  snapshot = {
    isHydrated: true,
    session: readStoredSession(),
    hasPaidAccess: readPaidAccess(),
  };
  emit();
}

function writeStoredSession(session: PaymentSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } else {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.localStorage.setItem(ACCESS_KEY, "true");
  }

  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  refreshSnapshot();
}

function writePaidAccess(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.localStorage.setItem(ACCESS_KEY, "true");
  } else {
    window.localStorage.removeItem(ACCESS_KEY);
  }

  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  refreshSnapshot();
}

function startStore() {
  if (started || typeof window === "undefined") {
    return;
  }

  started = true;
  refreshSnapshot();

  const sync = () => {
    refreshSnapshot();
  };

  window.addEventListener(UPDATE_EVENT, sync);
  window.addEventListener("storage", sync);
}

function subscribe(listener: () => void) {
  startStore();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function savePaymentSession(session: PaymentSession) {
  writeStoredSession(session);
}

export function clearPaymentSession() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  writePaidAccess(false);
}

export function confirmClientPayment() {
  writePaidAccess(true);
}

export function usePaymentGate() {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => ({
      isHydrated: false,
      session: null,
      hasPaidAccess: false,
    }),
  );

  return {
    isHydrated: state.isHydrated,
    paymentSession: state.session,
    isPaid: IS_DEV || state.hasPaidAccess || Boolean(state.session?.token),
  };
}

export function buildPaymentGatewayBase() {
  return process.env.NEXT_PUBLIC_PAYPAL_GATEWAY_BASE?.replace(/\/$/, "") ?? "http://localhost:8787";
}
