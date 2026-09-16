"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Landmark, Radio, Brain, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

type CryptoQuote = {
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
};

type NgxQuote = {
  symbol?: string;
  close?: string;
  percent_change?: string;
};

type GlobalData = {
  totalMarketCap: number | null;
  totalVolume24h: number | null;
  btcDominance: number | null;
  ethDominance: number | null;
  marketCapChange24h: number | null;
  volumeChange24h: number | null;
  activeCryptos: number | null;
  markets: number | null;
};

type FearGreedData = {
  value: number;
  classification: string;
  timestamp: string;
  previousClose: number;
  previous1Week: number;
  previous1Month: number;
};

function Change({ value }: { value: number | null | undefined }) {
  if (value == null || !Number.isFinite(value)) return <span className="text-[10px] text-muted-foreground">—</span>;
  const positive = value >= 0;
  return <span className={cn("flex items-center gap-0.5 text-[11px] font-semibold tabular-nums", positive ? "text-chart-2" : "text-destructive")}>
    {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {Math.abs(value).toFixed(2)}%
  </span>;
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-xl px-2 py-2">
      <div className="h-3 w-10 animate-pulse rounded bg-muted-foreground/30" />
      <div className="h-3 w-8 animate-pulse rounded bg-muted-foreground/30" />
    </div>
  );
}

function SentimentDot({ value }: { value: number }) {
  const label = value <= 25 ? "Extreme Fear" : value <= 45 ? "Fear" : value <= 55 ? "Neutral" : value <= 75 ? "Greed" : "Extreme Greed";
  const color = value <= 25 ? "bg-rose-400" : value <= 45 ? "bg-orange-400" : value <= 55 ? "bg-amber-400" : value <= 75 ? "bg-lime-400" : "bg-emerald-400";
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Sentiment: ${label}`}>
      <span className={cn("h-2 w-2 rounded-full", color, "shadow-[0_0_6px_hsl(var(--chart-2)/0.5)]")} />
      <span className="text-[10px] font-medium tabular-nums">{label} {value}</span>
    </span>
  );
}

export function SidebarMarketBrief() {
  const { format } = useCurrency();
  const [crypto, setCrypto] = useState<CryptoQuote[]>([]);
  const [ngx, setNgx] = useState<NgxQuote[]>([]);
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [cryptoResponse, ngxResponse, globalResponse, fearGreedResponse] = await Promise.all([
          fetch("/api/markets", { cache: "no-store" }),
          fetch("/api/ngx", { cache: "no-store" }),
          fetch("/api/markets/global", { cache: "no-store" }),
          fetch("/api/markets/fear-greed", { cache: "no-store" }),
        ]);

        const parseSafe = async (res: Response) => {
          try {
            return await res.json();
          } catch {
            return null;
          }
        };

        const [cryptoData, ngxData, globalData, fearGreedData] = await Promise.all([
          parseSafe(cryptoResponse),
          parseSafe(ngxResponse),
          parseSafe(globalResponse),
          parseSafe(fearGreedResponse),
        ]);

        if (!active) return;

        setCrypto(Array.isArray(cryptoData) ? cryptoData.filter((quote: CryptoQuote) => ["btc", "eth"].includes(quote.symbol)).slice(0, 2) : []);
        setNgx(ngxData && ngxData.configured ? Object.values(ngxData.data as Record<string, NgxQuote>).slice(0, 2) : []);
        if (globalResponse.ok && !Array.isArray(globalData) && globalData && globalData.totalMarketCap !== undefined) {
          setGlobal(globalData);
        } else {
          setGlobal(null);
        }
        if (fearGreedResponse.ok && !Array.isArray(fearGreedData) && fearGreedData && fearGreedData.value !== undefined) {
          setFearGreed(fearGreedData);
        } else {
          setFearGreed(null);
        }
        setHasError(
          !cryptoResponse.ok ||
          (!ngxResponse.ok && ngxResponse.status !== 503) ||
          (!globalResponse.ok && globalResponse.status !== 503) ||
          (!fearGreedResponse.ok && fearGreedResponse.status !== 503)
        );
      } catch {
        if (active) setHasError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="mx-1 my-4 rounded-2xl border border-sidebar-border/60 bg-background/40 p-3 shadow-inner">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="grid h-6 w-6 place-items-center rounded-lg bg-primary/15"><Activity className="h-3.5 w-3.5 text-primary" /></div><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/80">Market brief</span></div>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Radio className={cn("h-3 w-3", !loading && "text-chart-2")} />{loading ? "Syncing" : hasError ? "Partial" : "Live"}</span>
      </div>

      <div className="space-y-1">
        {crypto.map((quote) => <div key={quote.symbol} className="flex items-center justify-between rounded-xl px-2 py-2 transition-colors hover:bg-muted/40"><div><p className="text-xs font-semibold">{quote.symbol.toUpperCase()}</p><p className="text-[10px] text-muted-foreground">{format(quote.current_price, { maximumFractionDigits: quote.current_price < 1 ? 6 : 2 })}</p></div><Change value={quote.price_change_percentage_24h} /></div>)}
        {ngx.map((quote) => <div key={quote.symbol} className="flex items-center justify-between rounded-xl px-2 py-2 transition-colors hover:bg-muted/40"><div className="flex items-center gap-2"><Landmark className="h-3 w-3 text-chart-2" /><div><p className="text-xs font-semibold">{quote.symbol}</p><p className="text-[10px] text-muted-foreground">₦{Number(quote.close).toLocaleString()}</p></div></div><Change value={Number(quote.percent_change || 0)} /></div>)}
      </div>

      {loading && (
        <div className="py-1 space-y-1">
          {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {!loading && (
        <>
          <div className="my-2 border-t border-sidebar-border/50" />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-xl px-2 py-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Brain className="h-3 w-3 text-chart-3" />
                Sentiment
              </span>
              {fearGreed ? <SentimentDot value={fearGreed.value} /> : <span className="text-[10px] text-muted-foreground">—</span>}
            </div>
            <div className="flex items-center justify-between rounded-xl px-2 py-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Globe className="h-3 w-3 text-primary" />
                BTC.D
              </span>
              <span className="text-[11px] font-semibold tabular-nums">{global?.btcDominance != null ? `${global.btcDominance.toFixed(1)}%` : "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl px-2 py-1.5">
              <span className="text-[10px] text-muted-foreground">Market cap</span>
              <div className="text-right">
                <p className="text-[10px] font-semibold leading-tight">{global?.totalMarketCap != null ? `$${(global.totalMarketCap / 1e12).toFixed(2)}T` : "—"}</p>
                <Change value={global?.marketCapChange24h} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl px-2 py-1.5">
              <span className="text-[10px] text-muted-foreground">24h Volume</span>
              <div className="text-right">
                <p className="text-[10px] font-semibold leading-tight">{global?.totalVolume24h != null ? `$${(global.totalVolume24h / 1e9).toFixed(1)}B` : "—"}</p>
                <Change value={global?.volumeChange24h} />
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && crypto.length === 0 && ngx.length === 0 && !global && !fearGreed && (
        <p className="px-2 py-3 text-[11px] text-muted-foreground">Market feeds are unavailable.</p>
      )}
      <div className="mt-2 border-t border-sidebar-border/50 pt-2 text-[10px] text-muted-foreground">Auto-refreshes every minute</div>
    </section>
  );
}
