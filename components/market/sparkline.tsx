"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { useKlineData } from "@/lib/market-hooks";

interface SparklineProps {
  symbol: string;
}

export function Sparkline({ symbol }: SparklineProps) {
  const { data } = useKlineData(symbol, "15m", 24, 30000);

  if (!data?.data.length) {
    return <div className="h-10 w-24 rounded bg-slate-800/70" aria-hidden="true" />;
  }

  const points = data.data.map((kline) => ({ close: kline.close }));
  const positive = points[points.length - 1].close >= points[0].close;

  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line
            dataKey="close"
            stroke={positive ? "#4ade80" : "#fb7185"}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


