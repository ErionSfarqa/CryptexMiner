"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Gauge, Play, Square, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoreAnimation } from "@/components/mining/core-animation";
import { formatCrypto } from "@/lib/utils";
import type { SupportedCoin } from "@/lib/binance";
import { useCryptexStore } from "@/store/app-store";

const calibrationSteps = ["Initializing core...", "Calibrating power...", "Syncing network..."];

const baseHashrate: Record<SupportedCoin, number> = {
  BTC: 146,
  ETH: 312,
  SOL: 528,
};

const baseReward: Record<SupportedCoin, number> = {
  BTC: 0.00000075,
  ETH: 0.000012,
  SOL: 0.00025,
};

interface EventItem {
  id: string;
  text: string;
  time: number;
}

export default function MiningPage() {
  const addReward = useCryptexStore((state) => state.addReward);
  const calibrationComplete = useCryptexStore((state) => state.calibrationComplete);
  const setCalibrationComplete = useCryptexStore((state) => state.setCalibrationComplete);
  const lowPowerAnimations = useCryptexStore((state) => state.lowPowerAnimations);

  const [selectedCoin, setSelectedCoin] = useState<SupportedCoin>("BTC");
  const [isRunning, setIsRunning] = useState(false);
  const [warmupRemaining, setWarmupRemaining] = useState(8);
  const [calibrationStage, setCalibrationStage] = useState(calibrationComplete ? calibrationSteps.length : 0);
  const [stats, setStats] = useState({ hashrate: 0, temperature: 39, efficiency: 82 });
  const [blocksFound, setBlocksFound] = useState(0);
  const [rewardPulse, setRewardPulse] = useState(0);
  const [eventFeed, setEventFeed] = useState<EventItem[]>([]);

  const warmupRef = useRef(8);

  const pushEvent = (text: string) => {
    setEventFeed((previous) => [{ id: crypto.randomUUID(), text, time: Date.now() }, ...previous].slice(0, 8));
  };

  useEffect(() => {
    if (calibrationComplete) {
      return;
    }

    const delays = [2400, 2200, 2600];
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => {
        setCalibrationStage(0);
      }, 0),
    ];

    delays.forEach((delay, index) => {
      const totalDelay = delays.slice(0, index + 1).reduce((sum, item) => sum + item, 0);
      const timer = setTimeout(() => {
        setCalibrationStage(index + 1);

        if (index === delays.length - 1) {
          setCalibrationComplete(true);
        }
      }, totalDelay);

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [calibrationComplete, setCalibrationComplete]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
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
      pushEvent(`+${formatCrypto(reward)} ${selectedCoin} simulated reward`);

      if (blockEvent) {
        setBlocksFound((value) => value + 1);
        pushEvent(`Block event pulse detected on ${selectedCoin}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [addReward, isRunning, selectedCoin]);

  const calibrationText = useMemo(() => {
    if (calibrationStage >= calibrationSteps.length) {
      return "Calibration complete. Ready to start.";
    }

    return calibrationSteps[calibrationStage] ?? calibrationSteps[calibrationSteps.length - 1];
  }, [calibrationStage]);

  const startSimulation = () => {
    if (calibrationStage < calibrationSteps.length) {
      return;
    }

    setIsRunning(true);
    warmupRef.current = 8;
    setWarmupRemaining(8);
    pushEvent("Simulation started.");
  };

  const stopSimulation = () => {
    setIsRunning(false);
    setStats((previous) => ({
      ...previous,
      hashrate: 0,
      temperature: Math.max(38, previous.temperature - 6),
      efficiency: 82,
    }));
    pushEvent("Simulation paused.");
  };

  return (
    <div className="grid gap-4">
      <Card className="rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Mining Simulator</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Core Control</h1>
            <p className="mt-2 text-sm text-slate-300">{calibrationText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["BTC", "ETH", "SOL"] as SupportedCoin[]).map((coin) => (
              <button
                key={coin}
                type="button"
                disabled={isRunning}
                onClick={() => setSelectedCoin(coin)}
                className={`focus-ring rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  selectedCoin === coin
                    ? "border-cyan-300/80 bg-cyan-300/20 text-cyan-100"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"
                } ${isRunning ? "opacity-70" : ""}`}
              >
                {coin}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={startSimulation} disabled={isRunning || calibrationStage < calibrationSteps.length}>
            <Play className="h-4 w-4" />
            Start
          </Button>
          <Button variant="secondary" onClick={stopSimulation} disabled={!isRunning}>
            <Square className="h-4 w-4" />
            Stop
          </Button>
          <p className="text-xs text-slate-400">Simulation only. No real hashing or blockchain operations.</p>
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

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="rounded-2xl p-3 sm:p-4">
          <CoreAnimation
            isRunning={isRunning}
            warmupRemaining={warmupRemaining}
            rewardPulse={rewardPulse}
            lowPower={lowPowerAnimations}
          />
        </Card>

        <Card className="rounded-2xl">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Live Simulation Metrics</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-slate-700/65 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Simulated Hashrate</p>
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

      <Card className="rounded-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Event Stream</p>
        <div className="mt-4 space-y-2">
          {eventFeed.length === 0 ? (
            <p className="text-sm text-slate-400">No events yet. Start simulation to begin reward ticks.</p>
          ) : (
            eventFeed.map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2 text-sm">
                <span className="text-slate-200">{event.text}</span>
                <span className="text-xs text-slate-400">{new Date(event.time).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}


