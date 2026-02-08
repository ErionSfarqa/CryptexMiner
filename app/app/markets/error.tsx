"use client";

import { Button } from "@/components/ui/button";

export default function MarketsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6 text-rose-100">
      <h2 className="text-xl font-semibold">Markets failed to load</h2>
      <p className="mt-2 text-sm text-rose-100/90">{error.message || "Unexpected error"}</p>
      <div className="mt-4">
        <Button variant="secondary" onClick={reset}>
          Retry
        </Button>
      </div>
    </div>
  );
}


