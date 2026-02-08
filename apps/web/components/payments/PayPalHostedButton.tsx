"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PayPalHostedButtonProps {
  hostedButtonId: string;
  containerId: string;
  className?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

type RenderState = "loading" | "ready" | "error";

const SDK_POLL_INTERVAL_MS = 200;
const SDK_WAIT_TIMEOUT_MS = 15000;

let sdkWaitPromise: Promise<void> | null = null;

function waitForPayPalSdk() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal SDK can only load in the browser."));
  }

  if (window.paypal?.HostedButtons) {
    return Promise.resolve();
  }

  if (sdkWaitPromise) {
    return sdkWaitPromise;
  }

  sdkWaitPromise = new Promise<void>((resolve, reject) => {
    const startedAt = Date.now();
    const pollTimer = window.setInterval(() => {
      if (window.paypal?.HostedButtons) {
        window.clearInterval(pollTimer);
        sdkWaitPromise = null;
        resolve();
        return;
      }

      if (Date.now() - startedAt >= SDK_WAIT_TIMEOUT_MS) {
        window.clearInterval(pollTimer);
        sdkWaitPromise = null;
        reject(new Error("PayPal SDK is taking longer than expected."));
      }
    }, SDK_POLL_INTERVAL_MS);
  });

  return sdkWaitPromise;
}

export function PayPalHostedButton({
  hostedButtonId,
  containerId,
  className,
  onReady,
  onError,
}: PayPalHostedButtonProps) {
  const renderedRef = useRef(false);
  const [renderState, setRenderState] = useState<RenderState>("loading");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [retrySeed, setRetrySeed] = useState(0);

  const resetRender = useCallback(() => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }

    renderedRef.current = false;
    setErrorText(null);
    setRenderState("loading");
    setRetrySeed((value) => value + 1);
  }, [containerId]);

  useEffect(() => {
    let cancelled = false;

    const renderHostedButton = async () => {
      const container = document.getElementById(containerId);
      if (!container) {
        return;
      }

      if (container.querySelector("iframe") || container.childElementCount > 0) {
        renderedRef.current = true;
        setRenderState("ready");
        onReady?.();
        return;
      }

      if (renderedRef.current) {
        return;
      }

      try {
        await waitForPayPalSdk();
        if (cancelled) {
          return;
        }

        const host = window.paypal?.HostedButtons;
        if (!host) {
          throw new Error("PayPal Hosted Buttons is unavailable.");
        }

        renderedRef.current = true;
        const buttons = host({ hostedButtonId });
        await Promise.resolve(buttons.render(`#${containerId}`));

        if (!cancelled) {
          setRenderState("ready");
          onReady?.();
        }
      } catch (error) {
        renderedRef.current = false;
        if (cancelled) {
          return;
        }

        const normalizedError = error instanceof Error ? error : new Error("Unable to load PayPal checkout.");
        setErrorText(normalizedError.message);
        setRenderState("error");
        onError?.(normalizedError);
      }
    };

    void renderHostedButton();

    return () => {
      cancelled = true;
    };
  }, [containerId, hostedButtonId, onError, onReady, retrySeed]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="mt-4 flex justify-center">
        <div className="w-full max-w-[360px]">
          <div
            id={containerId}
            aria-busy={renderState === "loading"}
            className="paypal-hosted-root min-h-[56px] w-full whitespace-normal break-words"
          />
          {renderState === "loading" ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-28 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : null}
        </div>
      </div>

      {renderState === "error" ? (
        <div className="flex flex-wrap items-center justify-center gap-2 text-center">
          <p className="text-xs text-amber-200 whitespace-normal break-words">{errorText}</p>
          <Button size="sm" variant="secondary" onClick={resetRender}>
            Retry Checkout
          </Button>
        </div>
      ) : null}
    </div>
  );
}

