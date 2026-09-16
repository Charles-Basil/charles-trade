"use client";

import { useState, useEffect } from "react";
import { Gauge, Flame, Snowflake, Brain, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDashboardTime } from "@/lib/date-time";

interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string | null;
  previousClose: number;
  previous1Week: number;
  previous1Month: number;
}

const classifications = [
  { max: 25, label: "Extreme Fear", color: "text-rose-400", bg: "bg-rose-400", icon: Snowflake, desc: "Investors are too worried" },
  { max: 45, label: "Fear", color: "text-orange-400", bg: "bg-orange-400", icon: Snowflake, desc: "Cautious sentiment prevails" },
  { max: 55, label: "Neutral", color: "text-amber-400", bg: "bg-amber-400", icon: Brain, desc: "Balanced market sentiment" },
  { max: 75, label: "Greed", color: "text-lime-400", bg: "bg-lime-400", icon: Flame, desc: "Growing optimism" },
  { max: 100, label: "Extreme Greed", color: "text-emerald-400", bg: "bg-emerald-400", icon: Flame, desc: "Market may be overbought" },
];

export function FearGreedIndex() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFearGreed = async () => {
      try {
        const response = await fetch("/api/markets/fear-greed", { cache: "no-store" });
        if (!response.ok) throw new Error("Fear & Greed data unavailable");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching Fear & Greed:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFearGreed();
    const interval = setInterval(fetchFearGreed, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const current = data ? classifications.find(c => data.value <= c.max) || classifications[classifications.length - 1] : classifications[3];
  const previous = data ? classifications.find(c => (data.previousClose ?? 0) <= c.max) || classifications[classifications.length - 1] : classifications[3];

  const getGradientStops = (value: number) => {
    const stops = [
      { stop: 0, color: "hsl(0, 84%, 60%)" },
      { stop: 25, color: "hsl(15, 84%, 60%)" },
      { stop: 45, color: "hsl(43, 96%, 56%)" },
      { stop: 55, color: "hsl(70, 90%, 55%)" },
      { stop: 75, color: "hsl(142, 76%, 36%)" },
      { stop: 100, color: "hsl(142, 76%, 36%)" },
    ];
    return stops;
  };

  if (loading) {
    return (
      <Card className="surface-panel skeleton-premium h-64 animate-pulse" />
    );
  }

  return (
    <Card className="surface-panel-elevated overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2 bg-primary/10">
              <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Fear & Greed Index</p>
              <p className="text-xs text-muted-foreground">Market sentiment indicator</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last updated</p>
            <p className="font-mono text-sm">{data?.timestamp ? formatDashboardTime(data.timestamp) : "--:--"}</p>
          </div>
        </div>

        <div className="relative mb-8">
          <svg viewBox="0 0 200 100" className="w-full h-40" aria-label={`Fear and Greed meter showing ${data?.value ?? 67}`}>
            <defs>
              <linearGradient id="fearGreedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(0, 84%, 60%)" />
                <stop offset="25%" stopColor="hsl(15, 84%, 60%)" />
                <stop offset="45%" stopColor="hsl(43, 96%, 56%)" />
                <stop offset="55%" stopColor="hsl(70, 90%, 55%)" />
                <stop offset="75%" stopColor="hsl(142, 76%, 36%)" />
                <stop offset="100%" stopColor="hsl(142, 76%, 36%)" />
              </linearGradient>
            </defs>
            <path
              d="M10,90 A80,80 0 0,1 190,90"
              stroke="url(#fearGreedGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            />
            {classifications.map((c, i) => (
              <text
                key={i}
                x={`${(c.max / 100) * 180 + 10}`}
                y="110"
                textAnchor="middle"
                className="text-[9px] font-medium text-muted-foreground"
              >
                {c.label.split(" ")[0]}
              </text>
            ))}
            <circle
              cx={10 + (data?.value ?? 67) / 100 * 180}
              cy="90"
              r="16"
              fill="hsl(var(--background))"
              stroke={current.bg}
              strokeWidth="3"
              className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-500"
            />
          </svg>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <p className={cn("font-display text-5xl font-bold", current.color)}>{data?.value ?? 67}</p>
            <p className={cn("font-display text-xl font-semibold mt-1", current.color)}>{current.label}</p>
          </div>
          <div className="h-20 w-px bg-gradient-to-t from-border to-transparent" />
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">{data?.previousClose ?? 65}</p>
            <p className="text-xs text-muted-foreground mt-1">Previous Close</p>
          </div>
          <div className="h-20 w-px bg-gradient-to-t from-border to-transparent" />
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">{data?.previous1Week ?? 62}</p>
            <p className="text-xs text-muted-foreground mt-1">1 Week Ago</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={cn("rounded-xl p-4 text-center", current.bg + "/10 border", current.bg + "/20")}>
            <current.icon className={cn("h-6 w-6 mx-auto mb-2", current.color)} aria-hidden="true" />
            <p className="font-medium text-sm">{current.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{current.desc}</p>
          </div>
          <div className="rounded-xl p-4 bg-muted/50">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Weekly Change</span>
              <span className={cn("font-semibold", (data?.value ?? 67) > (data?.previous1Week ?? 62) ? "text-chart-2" : "text-destructive")}>
                {(data?.value ?? 67) > (data?.previous1Week ?? 62) ? "+" : ""}{(data?.value ?? 67) - (data?.previous1Week ?? 62)}
              </span>
            </div>
            <Progress value={Math.min(100, Math.max(0, ((data?.value ?? 67) / 100) * 100))} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Source: Alternative.me API • Updates every 10 minutes • Based on volatility, momentum, social media, surveys, dominance, trends
          </p>
        </div>
      </CardContent>
    </Card>
  );
}