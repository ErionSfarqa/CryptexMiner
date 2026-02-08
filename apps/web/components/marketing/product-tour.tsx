"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "mining",
    title: "Mining",
    copy: "Run guided calibration, then launch a premium mining loop with dynamic core visuals and reward pulses.",
    image: "/tour/mining.svg",
  },
  {
    id: "wallet",
    title: "Wallet",
    copy: "Track mined balances, local watch-only addresses, and live valuation in one clean performance dashboard.",
    image: "/tour/wallet.svg",
  },
  {
    id: "markets",
    title: "Markets",
    copy: "Observe Binance price action with frequent polling, interval charts, movers, and stale-data protection.",
    image: "/tour/markets.svg",
  },
] as const;

export function ProductTour() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("mining");
  const selected = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <section className="glass-card gradient-border rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cn(
              "focus-ring rounded-xl border px-4 py-2 text-sm font-semibold transition",
              tab.id === active
                ? "border-cyan-300/70 bg-cyan-300/20 text-cyan-100"
                : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500",
            )}
            onClick={() => setActive(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1.2fr] lg:items-center">
        <div>
          <h3 className="text-2xl font-semibold text-white">{selected.title} Experience</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{selected.copy}</p>
        </div>

        <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/55 sm:h-72">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              className="absolute inset-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28 }}
            >
              <Image src={selected.image} alt={`${selected.title} panel`} fill className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}


