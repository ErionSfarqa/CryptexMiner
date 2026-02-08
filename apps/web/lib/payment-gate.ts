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
}

const STORAGE_KEY = "cryptex:payment:session";
const UPDATE_EVENT = "cryptex:payment:update";

let snapshot: PaymentSnapshot = {
  isHydrated: false,
  session: null,
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

function refreshSnapshot() {
  snapshot = {
    isHydrated: true,
    session: readStoredSession(),
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
  writeStoredSession(null);
}

export function usePaymentGate() {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => ({
      isHydrated: false,
      session: null,
    }),
  );

  return {
    isHydrated: state.isHydrated,
    paymentSession: state.session,
    isPaid: Boolean(state.session?.token),
  };
}

export function buildPaymentGatewayBase() {
  return process.env.NEXT_PUBLIC_PAYPAL_GATEWAY_BASE?.replace(/\/$/, "") ?? "http://localhost:8787";
}
