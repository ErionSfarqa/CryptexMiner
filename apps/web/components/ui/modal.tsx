"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  scrollContent?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  scrollContent = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusFirstElement = () => {
      const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        panelRef.current?.focus();
      }
    };

    const frame = window.requestAnimationFrame(focusFirstElement);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? "modal-description" : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={panelRef}
            className={cn(
              "glass-card gradient-border relative flex w-full max-w-lg flex-col rounded-2xl border border-white/10 p-5 shadow-2xl sm:p-6",
              "max-h-[80vh]",
              className,
            )}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              className="focus-ring absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 id="modal-title" className="pr-8 text-xl font-semibold text-white">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-1 text-sm text-slate-300">
                {description}
              </p>
            ) : null}
            <div className={cn("mt-4 min-h-0", scrollContent ? "overflow-y-auto pr-1" : "")}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


