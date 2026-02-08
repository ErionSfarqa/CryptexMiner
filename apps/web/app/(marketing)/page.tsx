"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { LiveTickerStrip } from "@/components/market/live-ticker-strip";
import { ProductTour } from "@/components/marketing/product-tour";
import { MarketPulsePanel } from "@/components/market/market-pulse";
import { InstallStepperPreview } from "@/components/marketing/install-stepper-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const featureStats = [
  { label: "App install completion", value: "92%" },
  { label: "Average first-session time", value: "11m" },
  { label: "User satisfaction score", value: "4.8/5" },
];

export default function MarketingPage() {
  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute left-[12%] top-[20%] h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute right-[6%] top-[24%] h-52 w-52 rounded-full bg-sky-400/15 blur-3xl" />
        {Array.from({ length: 22 }).map((_, index) => (
          <motion.span
            key={index}
            className="absolute block rounded-full bg-cyan-200/30"
            style={{
              width: `${(index % 4) + 2}px`,
              height: `${(index % 4) + 2}px`,
              left: `${(index * 37) % 100}%`,
              top: `${(index * 19) % 100}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 5 + (index % 5), repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="focus-ring rounded-lg px-2 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">
          Cryptex Miner
        </Link>
        <Link href="/install" className="focus-ring rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300/60">
          Install
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-14 px-4 pb-20 sm:px-6">
        <section className="grid gap-10 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <motion.p
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Premium Desktop + Mobile Experience
            </motion.p>
            <motion.h1
              className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              Install in seconds. Mining made easy
            </motion.h1>
            <motion.p
              className="mt-4 max-w-xl text-base leading-7 text-slate-300"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
            >
              Cryptex Miner pairs a high-fidelity mining simulation with live Binance markets, clean wallet tracking,
              and a frictionless install path across iOS, Android, macOS, and Windows.
            </motion.p>
            <motion.div
              className="mt-7 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/install">
                <Button size="lg" className="min-w-[12rem]">
                  Install App
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/markets">
                <Button variant="secondary" size="lg" className="min-w-[12rem]">
                  View Live Markets
                </Button>
              </Link>
            </motion.div>
          </div>

          <Card className="relative overflow-hidden rounded-3xl border border-slate-700/55 p-6">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(35,211,200,0.2),transparent_44%),radial-gradient(circle_at_90%_70%,rgba(74,161,255,0.18),transparent_36%)]" />
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Why teams choose Cryptex</p>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-200">Simulation-only mining, transparent by design.</span>
              </li>
              <li className="flex gap-3">
                <Smartphone className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-200">Installable as a full-screen app with native-feel navigation.</span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-200">Live Binance market streams with stale-data safeguards.</span>
              </li>
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {featureStats.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-700/65 bg-slate-900/55 p-3">
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Live Markets</h2>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Binance public API</p>
          </div>
          <LiveTickerStrip />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">Product Tour</h2>
          <ProductTour />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Market Pulse</h2>
            <MarketPulsePanel />
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Install in 10 seconds</h2>
            <InstallStepperPreview />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Institutional UI", body: "Built for focus: no noisy clutter, no gimmick dashboards." },
            { title: "Transparent Data", body: "Real market numbers only. Unavailable states are clearly flagged." },
            { title: "Privacy First", body: "Watch-only address storage stays local to your device." },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-700/50 px-4 py-6 text-center text-xs text-slate-400">
        <p>Cryptex Miner (c) {new Date().getFullYear()} - Terms - Privacy</p>
        <p className="mt-1">Mining is a simulation. No real blockchain mining is performed.</p>
      </footer>
    </div>
  );
}


