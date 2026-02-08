"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ClaimState = "idle" | "verifying" | "success" | "pending" | "error";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ClaimState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orderId = useMemo(
    () => searchParams.get("token") ?? searchParams.get("orderId") ?? searchParams.get("order_id") ?? "",
    [searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    const claim = async () => {
      if (!orderId) {
        setState("pending");
        setErrorMessage("Payment confirmation pending. Contact support if you were charged.");
        return;
      }

      setState("verifying");
      setErrorMessage(null);

      const response = await fetch("/api/entitlement/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: "Payment confirmation pending." }))) as {
          error?: string;
          paid?: boolean;
        };
        setState(payload.paid ? "success" : "pending");
        setErrorMessage(payload.error ?? "Payment confirmation pending. Contact support if you were charged.");
        return;
      }

      setState("success");
    };

    void claim();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <Card className="w-full rounded-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Payment Verification</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Payment status</h1>

        {state === "verifying" || state === "idle" ? (
          <p className="mt-3 text-sm text-slate-300">Verifying your payment with PayPal...</p>
        ) : null}

        {state === "success" ? (
          <div className="mt-4 rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Payment verified. Installation is unlocked.
            </p>
          </div>
        ) : null}

        {state === "pending" ? (
          <div className="mt-4 rounded-xl border border-amber-400/35 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-100 whitespace-normal break-words">
              {errorMessage ?? "Payment confirmation pending. Contact support if you were charged."}
            </p>
          </div>
        ) : null}

        {state === "error" ? (
          <div className="mt-4 rounded-xl border border-amber-400/35 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-100">{errorMessage}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/install">
            <Button>Go to Install</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
          <Card className="w-full rounded-2xl">
            <p className="text-sm text-slate-300">Loading payment status...</p>
          </Card>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
