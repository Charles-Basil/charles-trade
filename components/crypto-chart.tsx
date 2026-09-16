"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { formatDashboardDate, formatDashboardTime } from "@/lib/date-time";

const timeRanges = [
  { label: "1H", value: "1H", days: "1/24" },
  { label: "24H", value: "1DAY", days: "1" },
  { label: "7D", value: "7DAY", days: "7" },
  { label: "30D", value: "1MTH", days: "30" },
  { label: "90D", value: "3MTH", days: "90" },
  { label: "1Y", value: "1YRS", days: "365" },
  { label: "ALL", value: "MAX", days: "max" },
] as const;

interface ChartDataPoint {
  date: string;
  timestamp: number;
  bitcoin: number;
  ethereum: number;
  ripple: number;
  dogecoin: number;
  solana?: number;
  cardano?: number;
}

const assetConfig = {
  bitcoin: { name: "Bitcoin", color: "#F7931A", key: "bitcoin" },
  ethereum: { name: "Ethereum", color: "#627EEA", key: "ethereum" },
  ripple: { name: "XRP", color: "#23292F", key: "ripple" },
  dogecoin: { name: "Dogecoin", color: "#C2A633", key: "dogecoin" },
  solana: { name: "Solana", color: "#9945FF", key: "solana" },
  cardano: { name: "Cardano", color: "#0033AD", key: "cardano" },
} as const;

type AssetKey = keyof typeof assetConfig;

export function CryptoChart() {
  const { currency, convert } = useCurrency();
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<typeof timeRanges[number]["value"]>("1MTH");
  const [selectedAssets, setSelectedAssets] = useState<AssetKey[]>(["bitcoin", "ethereum", "ripple", "dogecoin"]);
  const [chartType, setChartType] = useState<"area" | "line">("area");
  const [error, setError] = useState<string | null>(null);
  const [priceScale, setPriceScale] = useState<"linear" | "log">("linear");

  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true);
      setError(null);

      try {
        const daysParam = timeRange === "1H" ? "1" : timeRange === "MAX" ? "max" : timeRanges.find(r => r.value === timeRange)?.days || "30";
        const interval = timeRange === "1H" ? "hourly" : timeRange === "1DAY" ? "hourly" : "daily";

        const response = await fetch(
          `/api/markets/history?days=${daysParam}&interval=${interval}&assets=${selectedAssets.join(",")}`,
          { cache: "no-store" }
        );

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || `History unavailable (${response.status})`);
        }
        if (!Array.isArray(payload)) throw new Error("History provider returned an invalid response");
        const points: ChartDataPoint[] = payload;

        setData(points.map((point) => ({
          ...point,
          date: timeRange === "1H"
            ? formatDashboardTime(point.timestamp)
            : formatDashboardDate(point.timestamp, { month: "short", day: "numeric" }),
        })));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Historical data is temporarily unavailable.";
        console.warn("Crypto history unavailable:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [timeRange, selectedAssets]);

  const formattedData = useMemo(() => data.map((point) => {
    const convertedPoint = { ...point };
    (Object.keys(assetConfig) as AssetKey[]).forEach((asset) => {
      if (typeof point[asset] === "number") convertedPoint[asset] = convert(point[asset]);
    });
    return convertedPoint;
  }), [data, convert, currency.code]);

  const currentPrices = useMemo(() => {
    if (!formattedData.length) return {};
    const last = formattedData[formattedData.length - 1];
    const first = formattedData[0];
    const result: Record<string, { price: number; change: number; changePct: number }> = {};
    selectedAssets.forEach(asset => {
      const current = last[asset];
      const previous = first[asset];
      if (typeof current !== "number" || typeof previous !== "number" || !Number.isFinite(current) || !Number.isFinite(previous)) return;
      result[asset] = {
        price: current,
        change: current - previous,
        changePct: previous ? ((current - previous) / previous) * 100 : 0,
      };
    });
    return result;
  }, [formattedData, selectedAssets]);

  const yAxisFormatter = (value: number) => {
    if (value >= 1e9) return `${currency.symbol}${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${currency.symbol}${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${currency.symbol}${(value / 1e3).toFixed(1)}K`;
    return `${currency.symbol}${value.toFixed(value < 1 ? 4 : 2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const asset = payload[0].payload;
      return (
        <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-4 shadow-2xl min-w-[200px] animate-fade-in">
          <div className="font-display font-semibold text-sm mb-3 text-center">{label}</div>
          <div className="grid gap-2">
            {payload.map((entry: any, index: number) => {
              const assetKey = entry.dataKey as AssetKey;
              const config = assetConfig[assetKey];
              const priceData = currentPrices[assetKey];
              if (!config || priceData === undefined) return null;
              return (
                <div key={assetKey} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="font-medium capitalize">{config.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{new Intl.NumberFormat(undefined, { style: "currency", currency: currency.code, maximumFractionDigits: priceData.price < 1 ? 6 : 2 }).format(priceData.price)}</p>
                    <p className={cn("text-xs", priceData.changePct >= 0 ? "text-chart-2" : "text-destructive")}>
                      {priceData.changePct >= 0 ? "+" : ""}{priceData.changePct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const LegendItem = ({ asset }: { asset: AssetKey }) => {
    const config = assetConfig[asset];
    const priceData = currentPrices[asset];
    const isSelected = selectedAssets.includes(asset);
    return (
      <button
        onClick={() => setSelectedAssets(prev => prev.includes(asset) ? prev.filter(a => a !== asset) : [...prev, asset])}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all",
          isSelected
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
        )}
        disabled={selectedAssets.length === 1 && isSelected}
      >
        <div className={cn("h-2.5 w-2.5 rounded-full", isSelected ? "" : "opacity-50")} style={{ backgroundColor: config.color }} />
        <span className="text-xs font-medium capitalize">{config.name}</span>
        {priceData && (
          <span className={cn("text-xs font-semibold tabular-nums", priceData.changePct >= 0 ? "text-chart-2" : "text-destructive")}>
            {priceData.changePct >= 0 ? "+" : ""}{priceData.changePct.toFixed(1)}%
          </span>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="surface-panel h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-panel-elevated overflow-hidden">
      <div className="border-b border-border/30 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold">Market Pulse</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {selectedAssets.length} Assets
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1" role="radiogroup" aria-label="Chart type">
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg px-3"
                onClick={() => setChartType("area")}
                aria-pressed={chartType === "area"}
              >
                Area
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg px-3"
                onClick={() => setChartType("line")}
                aria-pressed={chartType === "line"}
              >
                Line
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={cn("rounded-lg", priceScale === "log" && "bg-primary/10 text-primary")}
              onClick={() => setPriceScale(prev => prev === "linear" ? "log" : "linear")}
            >
              {priceScale === "linear" ? "Log" : "Linear"}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-border/30 flex flex-wrap gap-2">
        {timeRanges.map((range) => (
          <Button
            key={range.value}
            size="sm"
            variant={timeRange === range.value ? "default" : "ghost"}
            className="rounded-xl px-4 transition-all"
            onClick={() => setTimeRange(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </div>

      <div className="px-6 py-3 border-b border-border/30 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-2">Assets:</span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(assetConfig) as AssetKey[]).map((asset) => (
            <LegendItem key={asset} asset={asset} />
          ))}
        </div>
      </div>

      <div className="p-3 h-[320px] sm:p-6 sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={formattedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                {selectedAssets.map((asset) => {
                  const config = assetConfig[asset];
                  return (
                    <linearGradient key={asset} id={`color-${asset}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={config.color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                type="number"
                scale={priceScale}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisFormatter}
                dx={-10}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none" }} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(name: string) => assetConfig[name as AssetKey]?.name ?? name}
              />
              {selectedAssets.map((asset) => {
                const config = assetConfig[asset];
                return (
                  <Area
                    key={asset}
                    type="monotone"
                    dataKey={asset}
                    stroke={config.color}
                    strokeWidth={2}
                    fill={`url(#color-${asset})`}
                    opacity={1}
                    name={config.name}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                );
              })}
            </AreaChart>
          ) : (
            <LineChart data={formattedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                type="number"
                scale={priceScale}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisFormatter}
                dx={-10}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none" }} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(name: string) => assetConfig[name as AssetKey]?.name ?? name}
              />
              {selectedAssets.map((asset) => {
                const config = assetConfig[asset];
                return (
                  <Line
                    key={asset}
                    type="monotone"
                    dataKey={asset}
                    stroke={config.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name={config.name}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                );
              })}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {error && (
        <div className="px-6 py-4 bg-destructive/10 border-t border-border/30">
          <p className="text-sm text-destructive flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </p>
        </div>
      )}

      <div className="px-6 py-4 bg-muted/30 border-t border-border/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedAssets.map((asset) => {
            const config = assetConfig[asset];
            const priceData = currentPrices[asset];
            return (
              <div
                key={asset}
                className={cn(
                  "rounded-xl p-4 text-center transition-all",
                  "bg-card border border-border/50",
                  selectedAssets.length === 1 ? "ring-2 ring-primary/20" : ""
                )}
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{config.name}</span>
                </div>
                {priceData && (
                  <>
                    <p className="font-display text-lg font-bold tabular-nums">{new Intl.NumberFormat(undefined, { style: "currency", currency: currency.code, maximumFractionDigits: priceData.price < 1 ? 6 : 2 }).format(priceData.price)}</p>
                    <p className={cn("text-xs font-semibold mt-1", priceData.changePct >= 0 ? "text-chart-2" : "text-destructive")}>
                      {priceData.changePct >= 0 ? "+" : ""}{priceData.changePct.toFixed(2)}%
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}