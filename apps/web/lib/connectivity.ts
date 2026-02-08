"use client";

import { useEffect, useState } from "react";

interface ConnectivitySnapshot {
  isHydrated: boolean;
  isOnline: boolean;
  navigatorOnline: boolean;
}

const HEARTBEAT_INTERVAL_MS = 90000;
const HEARTBEAT_TIMEOUT_MS = 3500;

let snapshot: ConnectivitySnapshot = {
  isHydrated: false,
  isOnline: true,
  navigatorOnline: true,
};

const listeners = new Set<(state: ConnectivitySnapshot) => void>();

let started = false;
let heartbeatInFlight = false;
let heartbeatFailures = 0;

function emit() {
  listeners.forEach((listener) => listener(snapshot));
}

function patchSnapshot(patch: Partial<ConnectivitySnapshot>) {
  snapshot = {
    ...snapshot,
    ...patch,
  };

  emit();
}

async function runHeartbeat() {
  if (heartbeatInFlight || typeof window === "undefined" || !navigator.onLine || document.hidden) {
    return;
  }

  heartbeatInFlight = true;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.binance.com/api/v3/ping", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (response.ok) {
      heartbeatFailures = 0;
      patchSnapshot({
        isOnline: true,
      });
    } else {
      heartbeatFailures += 1;
      if (heartbeatFailures >= 2) {
        patchSnapshot({
          isOnline: false,
        });
      }
    }
  } catch {
    heartbeatFailures += 1;
    if (heartbeatFailures >= 2) {
      patchSnapshot({
        isOnline: false,
      });
    }
  } finally {
    window.clearTimeout(timeoutId);
    heartbeatInFlight = false;
  }
}

function startMonitor() {
  if (started || typeof window === "undefined") {
    return;
  }

  started = true;

  const onOnline = () => {
    heartbeatFailures = 0;
    patchSnapshot({
      navigatorOnline: true,
      isHydrated: true,
      isOnline: true,
    });

    void runHeartbeat();
  };

  const onOffline = () => {
    heartbeatFailures = 0;
    patchSnapshot({
      navigatorOnline: false,
      isHydrated: true,
      isOnline: false,
    });
  };

  const onVisibilityChange = () => {
    if (!document.hidden) {
      void runHeartbeat();
    }
  };

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  document.addEventListener("visibilitychange", onVisibilityChange);

  patchSnapshot({
    navigatorOnline: navigator.onLine,
    isHydrated: true,
    isOnline: navigator.onLine,
  });

  if (navigator.onLine) {
    void runHeartbeat();
  }

  window.setInterval(() => {
    void runHeartbeat();
  }, HEARTBEAT_INTERVAL_MS);
}

function subscribe(listener: (state: ConnectivitySnapshot) => void) {
  listeners.add(listener);
  listener(snapshot);

  return () => {
    listeners.delete(listener);
  };
}

export function useConnectivity() {
  const [state, setState] = useState<ConnectivitySnapshot>(snapshot);

  useEffect(() => {
    startMonitor();
    const unsubscribe = subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}
