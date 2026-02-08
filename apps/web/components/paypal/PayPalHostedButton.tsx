"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PayPalHostedButtonProps {
  hostedButtonId: string;
  containerId: string;
  className?: string;
}

const POLL_INTERVAL_MS = 200;
const MAX_WAIT_MS = 5000;

type RenderStatus = "loading" | "ready" | "error";

export function PayPalHostedButton({ hostedButtonId, containerId, className }: PayPalHostedButtonProps) {
  const renderedRef = useRef(false);
  const [renderStatus, setRenderStatus] = useState<RenderStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retrySeed, setRetrySeed] = useState(0);

  const resetRender = useCallback(() => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }

    renderedRef.current = false;
    setErrorMessage(null);
    setRenderStatus("loading");
    setRetrySeed((value) => value + 1);
  }, [containerId]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    const finishAsError = (message: string) => {
      if (cancelled) {
        return;
      }

      setErrorMessage(message);
      setRenderStatus("error");
    };

    const tryRender = async () => {
      if (cancelled || renderedRef.current) {
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) {
        return;
      }

      if (container.childElementCount > 0) {
        renderedRef.current = true;
        setRenderStatus("ready");
        return;
      }

      if (!window.paypal?.HostedButtons) {
        return;
      }

      try {
        renderedRef.current = true;
        const hostedButtons = window.paypal.HostedButtons({ hostedButtonId });
        await Promise.resolve(hostedButtons.render(`#${containerId}`));

        if (!cancelled) {
          setRenderStatus("ready");
        }
      } catch {
        renderedRef.current = false;
        finishAsError("PayPal checkout could not be loaded.");
      }
    };

    pollTimer = setInterval(() => {
      void tryRender();
    }, POLL_INTERVAL_MS);

    void tryRender();

    timeoutTimer = setTimeout(() => {
      if (cancelled || renderedRef.current) {
        return;
      }

      finishAsError("PayPal is taking longer than expected. Please retry.");
    }, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      if (pollTimer) {
        clearInterval(pollTimer);
      }
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    };
  }, [containerId, hostedButtonId, retrySeed]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative min-h-[56px]">
        {renderStatus === "loading" ? <Skeleton className="h-12 w-full rounded-xl" /> : null}
        <div
          id={containerId}
          className={cn(
            "paypal-hosted-root flex min-h-[52px] items-center justify-center",
            renderStatus === "loading" ? "absolute inset-0 opacity-0" : "opacity-100",
          )}
        />
      </div>
      {renderStatus === "loading" ? (
        <p className="text-xs text-slate-400">Loading secure checkout...</p>
      ) : null}
      {renderStatus === "error" ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-amber-200">{errorMessage}</p>
          <Button size="sm" variant="secondary" onClick={resetRender}>
            Retry Checkout
          </Button>
        </div>
      ) : null}
    </div>
  );
}
