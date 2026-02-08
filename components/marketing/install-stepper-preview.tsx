"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const guides = {
  ios: ["Open in Safari", "Tap Share", "Select Add to Home Screen"],
  android: ["Open Chrome menu", "Tap Install app", "Confirm install"],
  desktop: ["Open in Chrome/Edge", "Click install icon", "Pin and launch"],
} as const;

type GuideKey = keyof typeof guides;

export function InstallStepperPreview() {
  const [active, setActive] = useState<GuideKey>("ios");

  return (
    <div className="glass-card gradient-border rounded-2xl p-5">
      <div className="flex flex-wrap gap-2">
        {Object.keys(guides).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key as GuideKey)}
            className={cn(
              "focus-ring rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition",
              active === key
                ? "border-cyan-300/70 bg-cyan-300/20 text-cyan-100"
                : "border-slate-700 text-slate-300 hover:border-slate-500",
            )}
          >
            {key}
          </button>
        ))}
      </div>

      <ol className="mt-4 space-y-3">
        {guides[active].map((step, index) => (
          <motion.li
            key={`${active}-${step}`}
            className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/55 px-3 py-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-semibold text-cyan-200">
              {index + 1}
            </span>
            <span className="text-sm text-slate-200">{step}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}


