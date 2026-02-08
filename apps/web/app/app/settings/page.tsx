"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useCryptexStore } from "@/store/app-store";

export default function SettingsPage() {
  const lowPowerAnimations = useCryptexStore((state) => state.lowPowerAnimations);
  const preferredFiat = useCryptexStore((state) => state.preferredFiat);
  const setLowPowerAnimations = useCryptexStore((state) => state.setLowPowerAnimations);
  const setPreferredFiat = useCryptexStore((state) => state.setPreferredFiat);
  const resetLocalData = useCryptexStore((state) => state.resetLocalData);

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Preferences</h1>

        <div className="mt-5 space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-slate-700/70 bg-slate-900/55 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Low power animations</p>
              <p className="text-xs text-slate-400">Reduce core particle load and motion intensity.</p>
            </div>
            <input
              type="checkbox"
              checked={lowPowerAnimations}
              onChange={(event) => setLowPowerAnimations(event.target.checked)}
              className="focus-ring h-5 w-5 rounded border-slate-500 bg-slate-800 text-cyan-400"
              aria-label="Toggle low power animations"
            />
          </label>

          <label className="block rounded-xl border border-slate-700/70 bg-slate-900/55 px-4 py-3">
            <p className="text-sm font-semibold text-white">Preferred fiat</p>
            <p className="text-xs text-slate-400">Used for wallet and portfolio valuation.</p>
            <select
              value={preferredFiat}
              onChange={(event) => setPreferredFiat(event.target.value as "USD" | "EUR")}
              className="focus-ring mt-3 w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>

          <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-rose-100">Reset local data</p>
            <p className="mt-1 text-xs text-rose-100/90">Clears mined balances, activity history, calibration, and watch-only addresses.</p>
            <Button className="mt-3" variant="danger" onClick={() => setConfirmOpen(true)}>
              Reset Data
            </Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl">
        <p className="text-sm text-slate-300">
          Cryptex Miner does not execute blockchain hashing, network validation, or private key generation.
        </p>
      </Card>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset local data?"
        description="This action cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetLocalData();
              setConfirmOpen(false);
            }}
          >
            Confirm Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}


