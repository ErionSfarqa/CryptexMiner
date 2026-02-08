"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, CircleSlash, Loader2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type QaCheckStatus = "pass" | "fail";

interface QaCheckResult {
  id: string;
  label: string;
  status: QaCheckStatus;
  details: string;
}

interface LiveStatus {
  paid: boolean;
  standalone: boolean;
  online: boolean;
  offlineSimulation: boolean;
}

const QA_OFFLINE_KEY = "cryptex:qa:offline-simulated";

function getStandaloneState() {
  if (typeof window === "undefined") {
    return false;
  }

  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const displayStandalone = window.matchMedia("(display-mode: standalone)").matches;
  return iosStandalone || displayStandalone;
}

async function waitForPayPalSdk(timeoutMs = 6000) {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.paypal) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (window.paypal) {
        window.clearInterval(timer);
        resolve(true);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(timer);
        resolve(false);
      }
    }, 200);
  });
}

async function clearIndexedDbDatabases() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return;
  }

  const indexedDbWithDatabases = window.indexedDB as IDBFactory & {
    databases?: () => Promise<Array<{ name?: string }>>;
  };

  if (typeof indexedDbWithDatabases.databases !== "function") {
    return;
  }

  const entries = await indexedDbWithDatabases.databases();
  await Promise.all(
    entries.map(
      (entry) =>
        new Promise<void>((resolve) => {
          if (!entry.name) {
            resolve();
            return;
          }

          const request = window.indexedDB.deleteDatabase(entry.name);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
          request.onblocked = () => resolve();
        }),
    ),
  );
}

export default function DevQaPage() {
  const [status, setStatus] = useState<LiveStatus>({
    paid: false,
    standalone: false,
    online: true,
    offlineSimulation: false,
  });
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checks, setChecks] = useState<QaCheckResult[]>([]);
  const [isRunningChecks, setIsRunningChecks] = useState(false);

  const qaEndpointEnabled = useMemo(
    () => process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_QA_MODE === "true",
    [],
  );

  const refreshStatus = useCallback(async () => {
    let paid = false;
    try {
      const response = await fetch("/api/entitlement", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (response.ok) {
        const payload = (await response.json()) as { paid?: boolean };
        paid = Boolean(payload.paid);
      }
    } catch {
      paid = false;
    }

    setStatus({
      paid,
      standalone: getStandaloneState(),
      online: navigator.onLine,
      offlineSimulation: window.localStorage.getItem(QA_OFFLINE_KEY) === "true",
    });
  }, []);

  const runAction = useCallback(
    async (label: string, action: () => Promise<void>) => {
      if (isBusy) {
        return;
      }

      setIsBusy(true);
      setMessage(null);
      try {
        await action();
        await refreshStatus();
        setMessage(label);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Action failed.");
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, refreshStatus],
  );

  const handleResetState = useCallback(() => {
    return runAction("App state reset.", async () => {
      const keysToRemove: string[] = [];
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (!key) {
          continue;
        }

        if (key === "cryptex-miner-store" || key.startsWith("cryptex:") || key.startsWith("qa:")) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      window.sessionStorage.clear();
      await clearIndexedDbDatabases();
    });
  }, [runAction]);

  const handleSetEntitlement = useCallback(() => {
    return runAction("QA entitlement set.", async () => {
      const response = await fetch("/api/dev/entitlement/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paid: true }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: "Unable to set entitlement." }))) as {
          error?: string;
        };
        throw new Error(payload.error ?? "Unable to set entitlement.");
      }
    });
  }, [runAction]);

  const handleClearEntitlement = useCallback(() => {
    return runAction("QA entitlement cleared.", async () => {
      const response = await fetch("/api/dev/entitlement/clear", { method: "POST" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: "Unable to clear entitlement." }))) as {
          error?: string;
        };
        throw new Error(payload.error ?? "Unable to clear entitlement.");
      }
    });
  }, [runAction]);

  const toggleOfflineSimulation = useCallback(() => {
    return runAction("Offline simulation toggled.", async () => {
      const next = !(window.localStorage.getItem(QA_OFFLINE_KEY) === "true");
      window.localStorage.setItem(QA_OFFLINE_KEY, next ? "true" : "false");
    });
  }, [runAction]);

  const runQaChecks = useCallback(async () => {
    if (isRunningChecks) {
      return;
    }

    setIsRunningChecks(true);
    const results: QaCheckResult[] = [];

    const pushResult = (label: string, passed: boolean, details: string) => {
      results.push({
        id: `${Date.now()}-${results.length}`,
        label,
        status: passed ? "pass" : "fail",
        details,
      });
      setChecks([...results]);
    };

    try {
      const landingResponse = await fetch("/", { cache: "no-store" });
      pushResult("Landing route renders", landingResponse.ok, landingResponse.ok ? "Route available" : "Route failed");

      let landingHtml = "";
      if (landingResponse.ok) {
        landingHtml = await landingResponse.text();
      }
      const centeredUnlockCard =
        landingHtml.includes("Unlock Access") &&
        (landingHtml.includes("max-w-md") || landingHtml.includes("max-w-lg"));
      pushResult(
        "Unlock Access card center styles",
        centeredUnlockCard,
        centeredUnlockCard ? "Centered classes present" : "Centered classes missing",
      );

      const imageResponse = await fetch("/secure-pay/secure-pay.png", { cache: "no-store" });
      pushResult("Pay Securely image loads", imageResponse.ok, imageResponse.ok ? "Image reachable" : "Image missing");

      const sdkReady = await waitForPayPalSdk();
      pushResult("PayPal SDK available", sdkReady, sdkReady ? "window.paypal exists" : "SDK not loaded in time");

      const installResponse = await fetch("/install", { cache: "no-store" });
      pushResult("Install route renders", installResponse.ok, installResponse.ok ? "Route available" : "Route failed");

      const miningResponse = await fetch("/app/mining", { cache: "no-store" });
      pushResult("Mining route renders", miningResponse.ok, miningResponse.ok ? "Route available" : "Route failed");
    } finally {
      setIsRunningChecks(false);
    }
  }, [isRunningChecks]);

  useEffect(() => {
    void refreshStatus();

    const update = () => {
      void refreshStatus();
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.removeEventListener("focus", update);
    };
  }, [refreshStatus]);

  return (
    <main className="ui-container ui-section-app min-h-screen w-full">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Dev QA</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Cryptex QA Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">
            Hidden developer route for validating landing, install, and miner flows end-to-end.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Dev entitlement endpoints: {qaEndpointEnabled ? "enabled" : "disabled"}.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Live Status</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700/65 bg-slate-900/45 px-3 py-2 text-sm text-slate-200">
              paid: <span className="font-semibold text-white">{String(status.paid)}</span>
            </div>
            <div className="rounded-xl border border-slate-700/65 bg-slate-900/45 px-3 py-2 text-sm text-slate-200">
              standalone: <span className="font-semibold text-white">{String(status.standalone)}</span>
            </div>
            <div className="rounded-xl border border-slate-700/65 bg-slate-900/45 px-3 py-2 text-sm text-slate-200">
              online: <span className="font-semibold text-white">{String(status.online)}</span>
            </div>
            <div className="rounded-xl border border-slate-700/65 bg-slate-900/45 px-3 py-2 text-sm text-slate-200">
              offline simulation: <span className="font-semibold text-white">{String(status.offlineSimulation)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Actions</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button disabled={isBusy} onClick={() => void handleResetState()}>
              Reset app state
            </Button>
            <Button disabled={!qaEndpointEnabled || isBusy} onClick={() => void handleSetEntitlement()}>
              Simulate Paid Entitlement (DEV ONLY)
            </Button>
            <Button variant="secondary" disabled={!qaEndpointEnabled || isBusy} onClick={() => void handleClearEntitlement()}>
              Clear Entitlement (DEV ONLY)
            </Button>
            <Button variant="secondary" disabled={isBusy} onClick={() => void toggleOfflineSimulation()}>
              Toggle Offline Simulation
            </Button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Link href="/" className="w-full">
              <Button className="w-full" variant="secondary">
                Open Landing
              </Button>
            </Link>
            <Link href="/install" className="w-full">
              <Button className="w-full" variant="secondary">
                Open Install
              </Button>
            </Link>
            <Link href="/app/mining" className="w-full">
              <Button className="w-full" variant="secondary">
                Open Miner
              </Button>
            </Link>
          </div>
          {message ? <p className="mt-3 text-xs text-cyan-200">{message}</p> : null}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">QA Checks</h2>
            <Button variant="secondary" disabled={isRunningChecks} onClick={() => void runQaChecks()}>
              {isRunningChecks ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Run QA Checks"
              )}
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {checks.length === 0 ? <p className="text-xs text-slate-400">No checks run yet.</p> : null}
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-2 rounded-xl border border-slate-700/65 bg-slate-900/45 px-3 py-2"
              >
                {check.status === "pass" ? (
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                ) : (
                  <CircleSlash className="mt-0.5 h-4 w-4 text-rose-300" />
                )}
                <div className="min-w-0">
                  <p className="text-sm text-white">{check.label}</p>
                  <p className="text-xs text-slate-400">{check.details}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {status.online ? <Wifi className="h-3.5 w-3.5 text-emerald-300" /> : <WifiOff className="h-3.5 w-3.5 text-rose-300" />}
            QA mode does not alter real navigator connectivity.
          </div>
        </Card>
      </div>
    </main>
  );
}
