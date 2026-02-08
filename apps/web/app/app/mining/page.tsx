"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Gauge, Play, Square, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { CoreAnimation } from "@/components/mining/core-animation";
import { useConnectivity } from "@/lib/connectivity";
import { formatCrypto } from "@/lib/utils";
import { MINEABLE_COINS, type MineableCoin } from "@/lib/binance";
import { useCryptexStore } from "@/store/app-store";

const calibrationSteps = [
  { message: "Initializing core...", duration: 2100 },
  { message: "Calibrating power...", duration: 2200 },
  { message: "Syncing network...", duration: 2400 },
] as const;

const baseHashrate: Record<MineableCoin, number> = {
  BTC: 146,
  ETH: 312,
  SOL: 528,
};

const baseReward: Record<MineableCoin, number> = {
  BTC: 0.00000075,
  ETH: 0.000012,
  SOL: 0.00025,
};

interface EventItem {
  id: string;
  text: string;
  time: number;
}

type CalibrationState = "pending" | "running" | "ready";

export default function MiningPage() {
  const addReward = useCryptexStore((state) => state.addReward);
  const calibrationComplete = useCryptexStore((state) => state.calibrationComplete);
  const setCalibrationComplete = useCryptexStore((state) => state.setCalibrationComplete);
  const lowPowerAnimations = useCryptexStore((state) => state.lowPowerAnimations);
  const { isOnline, isHydrated } = useConnectivity();

  const [selectedCoin, setSelectedCoin] = useState<MineableCoin>("BTC");
  const [isRunning, setIsRunning] = useState(false);
  const [warmupRemaining, setWarmupRemaining] = useState(8);
  const [calibrationState, setCalibrationState] = useState<CalibrationState>(
    calibrationComplete ? "ready" : "pending",
  );
  const [calibrationStage, setCalibrationStage] = useState(
    calibrationComplete ? calibrationSteps.length : 0,
  );
  const [stats, setStats] = useState({ hashrate: 0, temperature: 39, efficiency: 82 });
  const [blocksFound, setBlocksFound] = useState(0);
  const [rewardPulse, setRewardPulse] = useState(0);
  const [blockPulse, setBlockPulse] = useState(0);
  const [eventFeed, setEventFeed] = useState<EventItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const warmupRef = useRef(8);
  const calibrationTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const clearCalibrationTimers = useCallback(() => {
    calibrationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    calibrationTimersRef.current = [];
  }, []);

  const pushEvent = useCallback((text: string) => {
    setEventFeed((previous) => [{ id: crypto.randomUUID(), text, time: Date.now() }, ...previous].slice(0, 10));
  }, []);

  const runCalibration = useCallback(() => {
    if (calibrationState === "running") {
      return;
    }

    clearCalibrationTimers();
    setCalibrationState("running");
    setCalibrationStage(0);
    pushEvent("Calibration started.");

    let totalDelay = 0;

    calibrationSteps.forEach((step, index) => {
      totalDelay += step.duration;

      const timerId = setTimeout(() => {
        setCalibrationStage(index + 1);

        if (index === calibrationSteps.length - 1) {
          setCalibrationState("ready");
          setCalibrationComplete(true);
          pushEvent("Calibration complete. Start mining when ready.");
        }
      }, totalDelay);

      calibrationTimersRef.current.push(timerId);
    });
  }, [calibrationState, clearCalibrationTimers, pushEvent, setCalibrationComplete]);

  const stopMining = useCallback(
    (message?: string) => {
      setIsRunning(false);
      setStats((previous) => ({
        ...previous,
        hashrate: 0,
        temperature: Math.max(38, previous.temperature - 6),
        efficiency: 82,
      }));

      if (message) {
        pushEvent(message);
      }
    },
    [pushEvent],
  );

  useEffect(() => {
    if (calibrationState !== "pending") {
      return;
    }

    const timerId = setTimeout(() => {
      runCalibration();
    }, 80);

    return () => clearTimeout(timerId);
  }, [calibrationState, runCalibration]);

  useEffect(() => {
    return () => {
      clearCalibrationTimers();

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [clearCalibrationTimers]);

  useEffect(() => {
    if (!isHydrated || isOnline || !isRunning) {
      return;
    }

    const timerId = window.setTimeout(() => {
      stopMining("Connection lost. Mining paused.");
      showToast("Offline - mining paused");
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [isHydrated, isOnline, isRunning, showToast, stopMining]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timerId = setInterval(() => {
      const hashBase = baseHashrate[selectedCoin];
      const dynamicHashrate = hashBase * (0.9 + Math.random() * 0.22);
      const dynamicTemp = 54 + Math.random() * 14 + (warmupRef.current > 0 ? -5 : 0);
      const dynamicEfficiency = 86 + Math.random() * 9;

      setStats({
        hashrate: dynamicHashrate,
        temperature: dynamicTemp,
        efficiency: dynamicEfficiency,
      });

      if (warmupRef.current > 0) {
        warmupRef.current -= 1;
        setWarmupRemaining(warmupRef.current);

        if (warmupRef.current === 0) {
          pushEvent("Warm-up complete. Reward flow opened.");
        }

        return;
      }

      const reward = baseReward[selectedCoin] * (0.84 + Math.random() * 0.4);
      const blockEvent = Math.random() < 0.18;

      addReward({
        coin: selectedCoin,
        amount: reward,
        hashrate: dynamicHashrate,
        blockEvent,
      });

      setRewardPulse((value) => value + 1);
      pushEvent(`+${formatCrypto(reward)} ${selectedCoin} reward recorded`);

      if (blockEvent) {
        setBlocksFound((value) => value + 1);
        setBlockPulse((value) => value + 1);
        pushEvent(`Block event pulse detected on ${selectedCoin}`);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [addReward, isRunning, pushEvent, selectedCoin]);

  const calibrationText = useMemo(() => {
    if (calibrationState === "ready") {
      return "Calibration complete. Ready to start mining.";
    }

    if (calibrationState === "pending") {
      return "Calibration required before mining.";
    }

    const stageIndex = Math.min(calibrationStage, calibrationSteps.length - 1);
    return calibrationSteps[stageIndex].message;
  }, [calibrationStage, calibrationState]);

  const startButtonLabel =
    calibrationState === "ready"
      ? "Start Mining"
      : calibrationState === "running"
        ? "Calibrating Core"
        : "Start Calibration";

  const handleStart = () => {
    if (!isOnline) {
      showToast("Offline - mining paused");
      pushEvent("Connect to the internet to resume.");
      return;
    }

    if (calibrationState !== "ready") {
      runCalibration();
      return;
    }

    if (isRunning) {
      return;
    }

    setIsRunning(true);
    warmupRef.current = 8;
    setWarmupRemaining(8);
    pushEvent("Mining session started.");
  };

  return (
    <div className="space-y-5">
      <Toast message={toast} />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Mining Engine</p>
            <h1 className="ui-h2 mt-1 text-white">Core Control</h1>
            <p className="mt-2 text-sm text-slate-300">{calibrationText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {MINEABLE_COINS.map((coin) => (
              <button
                key={coin}
                type="button"
                disabled={isRunning}
                onClick={() => setSelectedCoin(coin)}
                className={`focus-ring h-10 rounded-xl border px-3 text-sm font-semibold transition ${
                  selectedCoin === coin
                    ? "border-cyan-300/80 bg-cyan-300/20 text-cyan-100"
                    : "border-white/20 bg-slate-900/60 text-slate-300 hover:border-cyan-300/45 hover:text-white"
                } ${isRunning ? "opacity-70" : ""}`}
              >
                {coin}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={handleStart} disabled={isRunning || calibrationState === "running" || !isOnline}>
            <Play className="h-4 w-4" />
            {startButtonLabel}
          </Button>
          <Button variant="secondary" onClick={() => stopMining("Mining paused.")} disabled={!isRunning}>
            <Square className="h-4 w-4" />
            Stop
          </Button>
          {!isOnline ? (
            <p className="text-xs text-amber-200">Connect to the internet to resume.</p>
          ) : (
            <p className="text-xs text-slate-400">No blockchain hashing or consensus operations are executed.</p>
          )}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800/70">
          <motion.div
            className="h-full bg-[linear-gradient(90deg,#2ad2c9,#74e6ff)]"
            animate={{
              width: `${((Math.min(calibrationStage, calibrationSteps.length) / calibrationSteps.length) * 100).toFixed(2)}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="p-3 sm:p-4">
          <CoreAnimation
            isRunning={isRunning}
            warmupRemaining={warmupRemaining}
            rewardPulse={rewardPulse}
            blockPulse={blockPulse}
            calibrationMessage={calibrationText}
            lowPower={lowPowerAnimations}
          />
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Live Core Metrics</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-xl border border-slate-700/65 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Core Rate</p>
              <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-white">
                <Gauge className="h-4 w-4 text-cyan-300" />
                {stats.hashrate.toFixed(2)} TH/s
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/65 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Core Temperature</p>
              <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-white">
                <Flame className="h-4 w-4 text-orange-300" />
                {stats.temperature.toFixed(1)} deg C
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/65 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Efficiency</p>
              <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-white">
                <Zap className="h-4 w-4 text-emerald-300" />
                {stats.efficiency.toFixed(1)}%
              </p>
            </div>
            <motion.div
              key={blocksFound}
              className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 p-3"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
            >
              <p className="text-xs text-cyan-100">Blocks Found Events</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-50">{blocksFound}</p>
            </motion.div>
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Event Stream</p>
        <div className="mt-4 space-y-2">
          {eventFeed.length === 0 ? (
            <p className="text-sm text-slate-400">No events yet. Start mining to begin reward ticks.</p>
          ) : (
            eventFeed.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2 text-sm"
              >
                <span className="truncate text-slate-200">{event.text}</span>
                <span className="shrink-0 text-xs text-slate-400">{new Date(event.time).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
