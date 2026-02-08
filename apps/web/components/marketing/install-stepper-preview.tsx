"use client";

import { motion } from "framer-motion";

const packages = [
  {
    name: "Step 1",
    artifact: "Secure PayPal Payment",
    note: "Complete one-time checkout",
  },
  {
    name: "Step 2",
    artifact: "Unlock Installer Access",
    note: "Payment token verified",
  },
  {
    name: "Step 3",
    artifact: "Install Cryptex Miner",
    note: "Desktop package or mobile install",
  },
  {
    name: "Step 4",
    artifact: "Connect Wallet and Start",
    note: "Provider + network guided setup",
  },
] as const;

export function InstallStepperPreview() {
  return (
    <div className="glass-card gradient-border rounded-2xl p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Install Packages</p>
      <div className="mt-4 grid gap-3">
        {packages.map((item, index) => (
          <motion.div
            key={item.name}
            className="rounded-xl border border-slate-700/60 bg-slate-900/55 px-3 py-3"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <p className="text-sm font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-xs text-cyan-100">{item.artifact}</p>
            <p className="mt-1 text-xs text-slate-400">{item.note}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
