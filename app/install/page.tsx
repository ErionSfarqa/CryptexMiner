"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";

type PlatformCard = "ios" | "android" | "macos" | "windows";
interface DeferredPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const cardCopy: Record<PlatformCard, { title: string; subtitle: string; route: string }> = {
  ios: {
    title: "iOS",
    subtitle: "Safari Add to Home Screen",
    route: "/install/ios",
  },
  android: {
    title: "Android",
    subtitle: "Chrome one-tap install",
    route: "/install/android",
  },
  macos: {
    title: "macOS",
    subtitle: "Install from Chrome or Edge",
    route: "/install/desktop",
  },
  windows: {
    title: "Windows",
    subtitle: "Install from Chromium desktop",
    route: "/install/desktop",
  },
};

const fallbackSteps: Record<PlatformCard, string[]> = {
  ios: ["Open this site in Safari.", "Tap Share.", "Choose Add to Home Screen."],
  android: ["Open menu (three dots).", "Tap Install app.", "Confirm installation."],
  macos: ["Open in Chrome or Edge.", "Click install icon in address bar.", "Confirm install."],
  windows: ["Open in Chrome or Edge.", "Open menu and click Install app.", "Pin and launch."],
};

function detectRecommendedPlatform(userAgent: string): PlatformCard | null {
  const ua = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }

  if (/android/.test(ua)) {
    return "android";
  }

  if (/macintosh|mac os x/.test(ua)) {
    return "macos";
  }

  if (/windows/.test(ua)) {
    return "windows";
  }

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
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null);
  const [modalTarget, setModalTarget] = useState<PlatformCard | null>(null);
  const userAgent = useSyncExternalStore(
    () => () => undefined,
    () => navigator.userAgent,
    () => "",
  );
  const recommended = detectRecommendedPlatform(userAgent);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      const deferredEvent = event as DeferredPromptEvent;
      event.preventDefault();
      setDeferredPrompt(deferredEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const cards = useMemo(
    () => [
      { id: "ios" as const, logo: <AppleLogo /> },
      { id: "android" as const, logo: <AndroidLogo /> },
      { id: "macos" as const, logo: <MacLogo /> },
      { id: "windows" as const, logo: <WindowsLogo /> },
    ],
    [],
  );

  const recommendationLabel = recommended
    ? `Recommended for ${cardCopy[recommended].title}`
    : "Choose your operating system";

  const handleInstall = async (id: PlatformCard) => {
    if (id === "ios") {
      router.push("/install/ios");
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "dismissed") {
        setModalTarget(id);
      }

      setDeferredPrompt(null);
      return;
    }

    if (id === "android") {
      router.push("/install/android");
      return;
    }

    if (id === "macos" || id === "windows") {
      setModalTarget(id);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-14 sm:px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Install Cryptex Miner</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Install in under 10 seconds</h1>
        <p className="mt-3 text-sm text-slate-300">{recommendationLabel}</p>
      </div>

      <section className="mx-auto mt-8 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const isRecommended = recommended === card.id;

          return (
            <Card
              key={card.id}
              className={`flex flex-col items-center rounded-2xl p-5 text-center ${
                isRecommended ? "border-cyan-300/70 bg-cyan-300/10" : "border-slate-700/65"
              }`}
            >
              <div className="rounded-xl border border-slate-600/70 bg-slate-900/65 p-3">{card.logo}</div>
              <h2 className="mt-3 text-lg font-semibold text-white">{cardCopy[card.id].title}</h2>
              <p className="mt-1 text-xs text-slate-300">{cardCopy[card.id].subtitle}</p>
              <Button className="mt-5 w-full" onClick={() => void handleInstall(card.id)}>
                Install
              </Button>
              <Link className="mt-2 text-xs text-cyan-200 hover:text-cyan-100" href={cardCopy[card.id].route}>
                View guide
              </Link>
            </Card>
          );
        })}
      </section>

      <Modal
        isOpen={modalTarget !== null}
        onClose={() => setModalTarget(null)}
        title="Install Prompt Not Available"
        description="Use the browser menu to install Cryptex Miner as an app."
      >
        {modalTarget ? (
          <div className="space-y-4">
            <ol className="space-y-2">
              {fallbackSteps[modalTarget].map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2 text-sm text-slate-200"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-semibold text-cyan-200">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="flex justify-end">
              <Link href={cardCopy[modalTarget].route}>
                <Button variant="secondary">Open detailed guide</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  );
}


