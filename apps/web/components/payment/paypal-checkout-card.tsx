"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import {
  buildPaymentGatewayBase,
  savePaymentSession,
  usePaymentGate,
  type PaymentSession,
} from "@/lib/payment-gate";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (error: unknown) => void;
        onCancel?: () => void;
      }) => {
        render: (target: HTMLElement) => Promise<void>;
        close?: () => void;
      };
    };
  }
}

interface PayPalButtonsInstance {
  render: (target: HTMLElement) => Promise<void>;
  close?: () => void;
}

interface PaypalCheckoutCardProps {
  amount: string;
  currency: string;
  onPaid?: (session: PaymentSession) => void;
}

async function ensurePayPalScript(clientId: string, currency: string) {
  if (window.paypal) {
    return;
  }

  const scriptId = "paypal-sdk-js";
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (existing) {
    await new Promise<void>((resolve, reject) => {
      if (window.paypal) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load PayPal SDK.")), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load PayPal SDK."));
    document.head.appendChild(script);
  });
}

export function PaypalCheckoutCard({ amount, currency, onPaid }: PaypalCheckoutCardProps) {
  const { isPaid, paymentSession } = usePaymentGate();
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const [isRendering, setIsRendering] = useState(Boolean(clientId));
  const [errorMessage, setErrorMessage] = useState<string | null>(
    clientId ? null : "PayPal client ID is not configured.",
  );
  const [toast, setToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gatewayBase = useMemo(() => buildPaymentGatewayBase(), []);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;
    let buttonsController: PayPalButtonsInstance | null = null;

    const renderButtons = async () => {
      try {
        await ensurePayPalScript(clientId, currency);

        if (cancelled || !window.paypal || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = "";

        buttonsController = window.paypal.Buttons({
          createOrder: async () => {
            const response = await fetch(`${gatewayBase}/api/paypal/create-order`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount,
                currency,
              }),
            });

            if (!response.ok) {
              throw new Error("Unable to create PayPal order.");
            }

            const payload = (await response.json()) as { orderId: string };
            return payload.orderId;
          },
          onApprove: async ({ orderID }) => {
            const response = await fetch(`${gatewayBase}/api/paypal/capture-order`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: orderID,
              }),
            });

            if (!response.ok) {
              throw new Error("Unable to capture PayPal order.");
            }

            const session = (await response.json()) as PaymentSession;
            savePaymentSession(session);
            onPaid?.(session);
            setToast("Payment confirmed");
            setTimeout(() => setToast(null), 1800);
          },
          onError: () => {
            setErrorMessage("Payment could not be completed. Please try again.");
          },
        });

        await buttonsController.render(containerRef.current);
        setIsRendering(false);
      } catch (error) {
        setIsRendering(false);
        setErrorMessage(error instanceof Error ? error.message : "Payment service unavailable.");
      }
    };

    void renderButtons();

    return () => {
      cancelled = true;
      buttonsController?.close?.();
    };
  }, [amount, clientId, currency, gatewayBase, onPaid]);

  return (
    <Card className="rounded-2xl">
      <Toast message={toast} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Secure PayPal Payment</p>
          <h3 className="mt-2 text-xl font-semibold text-white">One-time access payment</h3>
          <p className="mt-2 text-sm text-slate-300">
            Complete payment to unlock installer access.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          SSL secured
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-700/65 bg-slate-900/50 p-4">
        <p className="text-sm text-slate-200">
          Amount: <span className="font-semibold text-white">{amount} {currency}</span>
        </p>
        {isPaid ? (
          <p className="mt-2 text-sm font-medium text-emerald-200">
            Payment confirmed. Order {paymentSession?.orderId}
          </p>
        ) : (
          <div className="mt-3">
            <div ref={containerRef} />
            {isRendering ? <p className="mt-2 text-xs text-slate-400">Loading PayPal checkout...</p> : null}
            {errorMessage ? <p className="mt-2 text-xs text-rose-300">{errorMessage}</p> : null}
          </div>
        )}
      </div>
    </Card>
  );
}
