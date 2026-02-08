"use client";

import { AnimatePresence, motion } from "framer-motion";

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed right-4 top-4 z-[70] rounded-xl border border-cyan-300/35 bg-slate-900/95 px-4 py-2.5 text-sm text-cyan-100 shadow-[0_16px_30px_rgba(0,0,0,0.35)]"
          role="status"
          aria-live="polite"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


