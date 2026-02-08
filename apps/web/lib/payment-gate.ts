"use client";

import { useSyncExternalStore } from "react";

interface PaymentSnapshot {
  isHydrated: boolean;
  isPaid: boolean;
  isChecking: boolean;
}

const UPDATE_EVENT = "cryptex:entitlement:update";

let snapshot: PaymentSnapshot = {
  isHydrated: false,
  isPaid: false,
  isChecking: true,
};
const SERVER_SNAPSHOT: PaymentSnapshot = Object.freeze({
  isHydrated: false,
  isPaid: false,
  isChecking: true,
});

let started = false;
const listeners = new Set<() => void>();
let refreshInFlight: Promise<boolean> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: Partial<PaymentSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

async function refreshPaidFromServer() {
  if (typeof window === "undefined") {
    return false;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  setSnapshot({ isChecking: true });

  refreshInFlight = (async () => {
    try {
      const response = await fetch("/api/entitlement", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) {
        setSnapshot({ isPaid: false, isChecking: false });
        return false;
      }

      const payload = (await response.json()) as { paid?: boolean };
      const paid = Boolean(payload.paid);
      setSnapshot({ isPaid: paid, isChecking: false });
      return paid;
    } catch {
      setSnapshot({ isPaid: false, isChecking: false });
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function startStore() {
  if (started || typeof window === "undefined") {
    return;
  }

  started = true;
  setSnapshot({ isHydrated: true });
  void refreshPaidFromServer();

  const sync = () => {
    void refreshPaidFromServer();
  };

  window.addEventListener(UPDATE_EVENT, sync);
  window.addEventListener("focus", sync);
}

function subscribe(listener: () => void) {
  startStore();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePaymentGate() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);

  return {
    isHydrated: state.isHydrated,
    isPaid: state.isPaid,
    isChecking: state.isChecking,
  };
}

export function triggerEntitlementRefresh() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}
