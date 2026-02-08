"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type Platform = "ios" | "android" | "windows" | "macos";

interface DeferredPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

function detectPlatform(userAgent: string): Platform | null {
  const ua = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }

  if (/android/.test(ua)) {
    return "android";
  }

  if (/windows/.test(ua)) {
    return "windows";
  }

  if (/macintosh|mac os x/.test(ua)) {
    return "macos";
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
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null);
  const [showIosOverlay, setShowIosOverlay] = useState(false);
  const [androidMessage, setAndroidMessage] = useState<string | null>(null);

  const userAgent = useSyncExternalStore(
    () => () => undefined,
    () => navigator.userAgent,
    () => "",
  );

  const recommended = useMemo(() => detectPlatform(userAgent), [userAgent]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const cards: Array<{
    id: Platform;
    title: string;
    subtitle: string;
    buttonLabel: string;
    href?: string;
    logo: React.ReactNode;
  }> = [
    {
      id: "ios",
      title: "iOS",
      subtitle: "Install to Home Screen",
      buttonLabel: "Install",
      logo: <AppleLogo />,
    },
    {
      id: "android",
      title: "Android",
      subtitle: "Native install",
      buttonLabel: "Install",
      logo: <AndroidLogo />,
    },
    {
      id: "windows",
      title: "Windows",
      subtitle: "Cryptex Installer",
      buttonLabel: "Download Installer",
      href: "/downloads/Cryptex-Installer-Windows.exe",
      logo: <WindowsLogo />,
    },
    {
      id: "macos",
      title: "macOS",
      subtitle: "Cryptex Installer",
      buttonLabel: "Download Installer",
      href: "/downloads/Cryptex-Installer-macOS.dmg",
      logo: <MacLogo />,
    },
  ];

  const handleMobileInstall = async (platform: Platform) => {
    if (platform === "ios") {
      setShowIosOverlay(true);
      return;
    }

    if (platform === "android") {
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        return;
      }

      setAndroidMessage("Install prompt unavailable on this browser session.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-14 sm:px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Cryptex Installer</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Download and install Cryptex Miner</h1>
        <p className="mt-3 text-sm text-slate-300">
          {recommended ? `Recommended for ${recommended === "macos" ? "macOS" : recommended}` : "Select your platform"}
        </p>
      </div>

      <section className="mx-auto mt-8 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const isRecommended = card.id === recommended;

          return (
            <Card
              key={card.id}
              className={`flex flex-col items-center rounded-2xl p-5 text-center ${
                isRecommended ? "border-cyan-300/70 bg-cyan-300/10" : "border-slate-700/65"
              }`}
            >
              <div className="rounded-xl border border-slate-600/70 bg-slate-900/65 p-3">{card.logo}</div>
              <h2 className="mt-3 text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-1 text-xs text-slate-300">{card.subtitle}</p>

              {card.href ? (
                <a
                  href={card.href}
                  download
                  className="focus-ring mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[linear-gradient(130deg,#2ad2c9,#14b8a6)] px-4 text-sm font-semibold text-slate-950 shadow-[0_14px_32px_rgba(31,206,193,0.25)] transition hover:brightness-105"
                >
                  {card.buttonLabel}
                </a>
              ) : (
                <Button className="mt-5 w-full" onClick={() => void handleMobileInstall(card.id)}>
                  {card.buttonLabel}
                </Button>
              )}
            </Card>
          );
        })}
      </section>

      {androidMessage ? <p className="mt-4 text-center text-sm text-slate-300">{androidMessage}</p> : null}

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
