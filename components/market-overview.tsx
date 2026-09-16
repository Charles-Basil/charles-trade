"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Zap, Globe, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

interface MarketOverviewData {
  totalMarketCap: number | null;
  totalVolume24h: number | null;
  btcDominance: number | null;
  ethDominance: number | null;
  marketCapChange24h: number | null;
  volumeChange24h: number | null;
  activeCryptos: number | null;
  markets: number | null;
}

export function MarketOverview() {
  const { currency, convert } = useCurrency();
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCompactCurrency = (value: number | null) => value == null
    ? "N/A"
    : new Intl.NumberFormat(undefined, { style: "currency", currency: currency.code, notation: "compact", maximumFractionDigits: 2 }).format(convert(value));

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const response = await fetch("/api/markets/global", { cache: "no-store" });
        if (!response.ok) throw new Error("Global data unavailable");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching global data:", err);
        setError("Global market data temporarily unavailable");
        setData({
          totalMarketCap: null,
          totalVolume24h: null,
          btcDominance: null,
          ethDominance: null,
          marketCapChange24h: null,
          volumeChange24h: null,
          activeCryptos: null,
          markets: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
    const interval = setInterval(fetchGlobalData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: "Total Market Cap",
      value: formatCompactCurrency(data?.totalMarketCap ?? null),
      change: data?.marketCapChange24h ?? 0,
      icon: DollarSign,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      trend: "up" as const,
    },
    {
      label: "24h Volume",
      value: formatCompactCurrency(data?.totalVolume24h ?? null),
      change: data?.volumeChange24h ?? 0,
      icon: Zap,
      iconColor: "text-chart-4",
      bgColor: "bg-chart-4/10",
      trend: data?.volumeChange24h && data.volumeChange24h >= 0 ? "up" : "down" as const,
    },
    {
      label: "BTC Dominance",
      value: data?.btcDominance != null ? `${data.btcDominance.toFixed(1)}%` : "N/A",
      change: 0,
      icon: Target,
      iconColor: "text-chart-2",
      bgColor: "bg-chart-2/10",
      trend: "up" as const,
    },
    {
      label: "Active Assets",
      value: data?.activeCryptos != null ? data.activeCryptos.toLocaleString() : "N/A",
      change: 0,
      icon: Globe,
      iconColor: "text-chart-3",
      bgColor: "bg-chart-3/10",
      trend: "up" as const,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((_, i) => (
          <Card key={i} className="surface-panel skeleton-premium h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card
          key={metric.label}
          className={cn(
            "surface-panel relative overflow-hidden transition-all duration-300",
            "hover:border-primary/20 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.1)]"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className={cn("rounded-xl p-3", metric.bgColor)}>
                  <metric.icon className={cn("h-5 w-5", metric.iconColor)} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold tracking-tight">{metric.value}</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                metric.trend === "up"
                  ? "bg-chart-2/10 text-chart-2"
                  : "bg-destructive/10 text-destructive"
              )}>
                {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(metric.change).toFixed(1)}%</span>
                <span className="text-muted-foreground">24h</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <span>Updated just now</span>
              <ArrowUpRight className="h-3 w-3 opacity-50" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}