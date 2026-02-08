"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { PayPalHostedButton } from "@/components/payments/PayPalHostedButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

type Platform = "ios" | "android" | "windows" | "macos";
type EntitlementState = "loading" | "paid" | "unpaid";

interface DeferredPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const PAYPAL_HOSTED_BUTTON_ID = "GVDXTBZQFAVD4";
const PAYPAL_CONTAINER_ID = "paypal-container-GVDXTBZQFAVD4-install";

function detectPlatform(userAgent: string): Platform | null {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/windows/.test(ua)) return "windows";
  if (/macintosh|mac os x/.test(ua)) return "macos";
  return null;
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor" aria-hidden="true">
      <path d="M16.24 12.35c.01 2.66 2.33 3.55 2.35 3.56-.02.07-.37 1.27-1.22 2.52-.73 1.08-1.5 2.16-2.7 2.18-1.18.02-1.56-.7-2.9-.7-1.35 0-1.77.68-2.88.72-1.15.04-2.02-1.15-2.76-2.23-1.49-2.16-2.63-6.09-1.1-8.75.76-1.32 2.13-2.16 3.62-2.18 1.13-.02 2.2.76 2.9.76.7 0 2.02-.94 3.4-.8.58.02 2.22.24 3.27 1.78-.08.05-1.95 1.15-1.93 3.14Zm-2.08-6.72c.61-.74 1.03-1.77.92-2.8-.88.04-1.95.58-2.58 1.32-.57.66-1.07 1.71-.94 2.72.98.08 1.98-.5 2.6-1.24Z" />
    </svg>
  );
}

function AndroidLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor" aria-hidden="true">
      <path d="M6 9h12v8a2 2 0 0 1-2 2h-1v3h-2v-3h-2v3H9v-3H8a2 2 0 0 1-2-2V9Zm-2 2h1v6H4v-6Zm15 0h1v6h-1v-6ZM8.42 6.24l-1.3-2.25.87-.5 1.34 2.33A7.9 7.9 0 0 1 12 5.5c.93 0 1.84.12 2.68.35l1.33-2.33.87.5-1.29 2.25A5.5 5.5 0 0 1 17.5 9h-11a5.5 5.5 0 0 1 1.92-2.76ZM9 7.6a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Zm6 0a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z" />
    </svg>
  );
}

function WindowsLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor" aria-hidden="true">
      <path d="M2.5 4.5 11 3v8H2.5V4.5Zm9.5-1.6L21.5 1.5V11H12V2.9ZM2.5 12.9H11v8.1L2.5 19.5v-6.6Zm9.5 0h9.5v9.6L12 21.1v-8.2Z" />
    </svg>
  );
}

function MacLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 18h19" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 20h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function InstallPage() {
  const [entitlement, setEntitlement] = useState<EntitlementState>("loading");
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null);
  const [showIosOverlay, setShowIosOverlay] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [androidMessage, setAndroidMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null);
  const [checkingUnlock, setCheckingUnlock] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userAgent = useSyncExternalStore(
    () => () => undefined,
    () => navigator.userAgent,
    () => "",
  );
  const recommended = useMemo(() => detectPlatform(userAgent), [userAgent]);
  const canInstall = entitlement === "paid";

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const refreshEntitlement = useCallback(async () => {
    try {
      const response = await fetch("/api/entitlement", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) {
        setEntitlement("unpaid");
        return false;
      }

      const payload = (await response.json()) as { paid?: boolean };
      const paid = Boolean(payload.paid);
      setEntitlement(paid ? "paid" : "unpaid");
      return paid;
    } catch {
      setEntitlement("unpaid");
      return false;
    }
  }, []);

  const startInstallation = useCallback(
    async (platform: Platform) => {
      if (platform === "windows") {
        window.location.href = "/api/installers/windows";
        return;
      }

      if (platform === "macos") {
        window.location.href = "/api/installers/macos";
        return;
      }

      if (platform === "ios") {
        setShowIosOverlay(true);
        return;
      }

      if (deferredPrompt) {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
      } else {
        setAndroidMessage("Install prompt unavailable on this browser session.");
      }
    },
    [deferredPrompt],
  );

  const handleInstallClick = useCallback(
    async (platform: Platform) => {
      const hasEntitlement = canInstall || (await refreshEntitlement());
      if (!hasEntitlement) {
        setPendingPlatform(platform);
        setShowPaywallModal(true);
        return;
      }

      await startInstallation(platform);
    },
    [canInstall, refreshEntitlement, startInstallation],
  );

  const handlePaymentCheck = useCallback(async () => {
    setCheckingUnlock(true);
    try {
      const unlocked = await refreshEntitlement();
      if (!unlocked) {
        showToast("Payment not confirmed yet");
        return;
      }

      setShowPaywallModal(false);
      showToast("Payment verified. Continuing install");

      const platform = pendingPlatform;
      setPendingPlatform(null);
      if (platform) {
        await startInstallation(platform);
      }
    } finally {
      setCheckingUnlock(false);
    }
  }, [pendingPlatform, refreshEntitlement, showToast, startInstallation]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    const refreshTimer = window.setTimeout(() => {
      void refreshEntitlement();
    }, 0);
    const onFocus = () => {
      void refreshEntitlement();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshEntitlement]);

  useEffect(() => {
    if (!showPaywallModal || !pendingPlatform) {
      return;
    }

    let cancelled = false;
    const timer = window.setInterval(() => {
      void (async () => {
        const unlocked = await refreshEntitlement();
        if (!unlocked || cancelled) {
          return;
        }

        setShowPaywallModal(false);
        showToast("Installation unlocked");
        const platform = pendingPlatform;
        setPendingPlatform(null);
        await startInstallation(platform);
      })();
    }, 3500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pendingPlatform, refreshEntitlement, showPaywallModal, showToast, startInstallation]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const cards: Array<{
    id: Platform;
    title: string;
    subtitle: string;
    buttonLabel: string;
    logo: React.ReactNode;
  }> = [
    { id: "ios", title: "iOS", subtitle: "Install to Home Screen", buttonLabel: "Install Miner", logo: <AppleLogo /> },
    { id: "android", title: "Android", subtitle: "Native install", buttonLabel: "Install Miner", logo: <AndroidLogo /> },
    {
      id: "windows",
      title: "Windows",
      subtitle: "Cryptex Installer",
      buttonLabel: "Download Installer",
      logo: <WindowsLogo />,
    },
    {
      id: "macos",
      title: "macOS",
      subtitle: "Cryptex Installer",
      buttonLabel: "Download Installer",
      logo: <MacLogo />,
    },
  ];

  return (
    <main className="ui-container ui-section-marketing flex min-h-screen w-full flex-col justify-center">
      <Toast message={toast} />

      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Cryptex Installer</p>
        <h1 className="ui-h1 mt-3 text-white">Download and install Cryptex Miner</h1>
        <p className="ui-muted mt-3 text-slate-300">
          {recommended ? `Recommended for ${recommended === "macos" ? "macOS" : recommended}` : "Select your platform"}
        </p>
      </div>

      <div
        className={`mx-auto mt-7 w-full max-w-3xl rounded-2xl border px-5 py-4 shadow-[0_20px_60px_-40px_rgba(34,211,238,0.65)] ${
          entitlement === "paid"
            ? "border-emerald-200/20 bg-[linear-gradient(145deg,rgba(16,70,58,0.24),rgba(8,25,22,0.22))]"
            : "border-cyan-200/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(8,37,62,0.28))]"
        }`}
      >
        {entitlement === "loading" ? (
          <Skeleton className="mx-auto h-14 w-full max-w-xl rounded-xl" />
        ) : entitlement === "paid" ? (
          <div className="flex items-start gap-3 text-left">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-400/10 text-emerald-200">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-100">
                Payment verified. Installation is unlocked.
              </p>
              <p className="mt-1 text-xs text-emerald-100/85">
                Select your platform and continue.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 text-left">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-cyan-100">
                Installation unlocks after secure PayPal payment.
              </p>
              <p className="mt-1 text-xs text-cyan-100/85">
                Click any install button to open checkout.
              </p>
            </div>
          </div>
        )}
      </div>

      <section className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const isRecommended = card.id === recommended;
          return (
            <Card
              key={card.id}
              className={`flex flex-col items-center p-5 text-center ${
                isRecommended ? "border-cyan-300/70 bg-cyan-300/10" : "border-white/10"
              }`}
            >
              <div className="rounded-xl border border-slate-600/70 bg-slate-900/65 p-3">{card.logo}</div>
              <h2 className="mt-3 text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-1 text-xs text-slate-300">{card.subtitle}</p>
              <Button className="mt-5 h-11 w-full" onClick={() => void handleInstallClick(card.id)}>
                {card.buttonLabel}
              </Button>
            </Card>
          );
        })}
      </section>

      {androidMessage ? <p className="mt-4 text-center text-sm text-slate-300">{androidMessage}</p> : null}

      <Modal
        isOpen={showPaywallModal}
        onClose={() => {
          setShowPaywallModal(false);
          setPendingPlatform(null);
        }}
        title="Unlock access"
        description="Complete secure checkout to continue installation."
        className="max-w-md text-center"
      >
        <div className="space-y-4 text-center">
          <Card className="border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Payment required</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Secure PayPal checkout</h3>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start justify-center gap-2 text-xs text-slate-200">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span>Encrypted one-time payment</span>
              </li>
              <li className="flex items-start justify-center gap-2 text-xs text-slate-200">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span>No card details stored on our servers</span>
              </li>
              <li className="flex items-start justify-center gap-2 text-xs text-slate-200">
                <Lock className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span>Unlocks automatically after confirmation</span>
              </li>
            </ul>
            <div className="mt-4 rounded-2xl border border-slate-700/65 bg-slate-950/15 p-3">
              <PayPalHostedButton
                hostedButtonId={PAYPAL_HOSTED_BUTTON_ID}
                containerId={PAYPAL_CONTAINER_ID}
                className="mx-auto w-full max-w-[360px]"
              />
            </div>
          </Card>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button className="w-full" onClick={() => void handlePaymentCheck()} disabled={checkingUnlock}>
              {checkingUnlock ? "Checking payment..." : "I completed payment"}
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => {
                setShowPaywallModal(false);
                setPendingPlatform(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showIosOverlay}
        onClose={() => setShowIosOverlay(false)}
        title="Add Cryptex Miner"
        description="Use Safari to add this app to your Home Screen."
      >
        <p className="text-sm text-slate-200">Tap Share, then choose Add to Home Screen.</p>
      </Modal>
    </main>
  );
}
