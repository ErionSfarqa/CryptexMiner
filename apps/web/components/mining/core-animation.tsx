"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface CoreAnimationProps {
  isRunning: boolean;
  warmupRemaining: number;
  rewardPulse: number;
  blockPulse: number;
  calibrationMessage: string;
  lowPower: boolean;
}

interface ParticleSpec {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function CoreAnimation({
  isRunning,
  warmupRemaining,
  rewardPulse,
  blockPulse,
  calibrationMessage,
  lowPower,
}: CoreAnimationProps) {
  const [isSmallViewport, setIsSmallViewport] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsSmallViewport(window.innerWidth < 760);
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const particleCount = lowPower ? 8 : isSmallViewport ? 14 : 24;

  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: particleCount }, (_, index) => ({
        id: index,
        x: (index * 17) % 100,
        y: (index * 33) % 100,
        size: 2 + (index % 3),
        duration: 5 + (index % 5),
        delay: (index % 6) * 0.4,
      })),
    [particleCount],
  );

  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-slate-700/70 bg-[radial-gradient(circle_at_40%_35%,rgba(42,210,201,0.22),transparent_50%),radial-gradient(circle_at_70%_65%,rgba(95,160,255,0.14),transparent_42%),#071120]">
      <div className="pointer-events-none absolute inset-0 select-none">
        <motion.div
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/35"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/20"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/10"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/25 blur-[2px]"
          animate={{
            scale: isRunning ? [1, 1.08, 1] : [1, 1.02, 1],
            opacity: isRunning ? [0.62, 0.86, 0.62] : [0.35, 0.45, 0.35],
          }}
          transition={{ duration: isRunning ? 1.4 : 2.6, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100"
          animate={{
            boxShadow: isRunning ? "0 0 34px 10px rgba(80,237,227,0.68)" : "0 0 18px 6px rgba(80,237,227,0.3)",
          }}
          transition={{ duration: 0.6 }}
        />

        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute rounded-full bg-cyan-200/70"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -18, 0],
              x: [0, 8, 0],
              opacity: isRunning ? [0.3, 0.9, 0.3] : [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="scanline absolute inset-0 bg-gradient-to-b from-transparent via-cyan-300/15 to-transparent" />

        <motion.div
          key={rewardPulse}
          className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/70"
          initial={{ scale: 0.8, opacity: 0.9 }}
          animate={{ scale: 2.1, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        <motion.div
          key={blockPulse}
          className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/80"
          initial={{ scale: 0.7, opacity: 0.95 }}
          animate={{ scale: 2.7, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-slate-700/60 bg-slate-950/55 px-4 py-2 text-xs text-slate-300">
        {isRunning
          ? warmupRemaining > 0
            ? `Warm-up in progress: ${warmupRemaining}s`
            : "Core synchronized: reward pulses active"
          : calibrationMessage}
      </div>
    </div>
  );
}
