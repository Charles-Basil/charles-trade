"use client";

import { Activity, BarChart3, Brain, ChartNoAxesCombined, Database, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoChart } from "@/components/crypto-chart";
import { FearGreedIndex } from "@/components/fear-greed-index";
import { MarketOverview } from "@/components/market-overview";
import { TerminalShell } from "@/components/terminal-shell";

export default function AnalyticsPage() {
  return (
    <TerminalShell>
      <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Analytics</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Understand market behaviour.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Live performance, sentiment, volume, and volatility signals from the market feeds. Personal performance appears after you add portfolio assets.</p>
        </div>
        <section className="mb-8"><MarketOverview /></section>
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
          <CryptoChart />
          <FearGreedIndex />
        </section>
        <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            [BarChart3, "Market performance", "Compare live asset movement across selected periods."],
            [Activity, "Volatility", "Use the chart range and asset controls to inspect movement."],
            [Brain, "Market sentiment", "Fear & Greed is sourced from the existing sentiment feed."],
            [ChartNoAxesCombined, "Portfolio analytics", "Add assets to unlock personal return and allocation analysis."],
          ].map(([Icon, title, description]) => <Card key={title as string} className="surface-panel"><CardHeader className="pb-3"><Icon className="h-5 w-5 text-primary" /><CardTitle className="font-display text-base">{title as string}</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">{description as string}</p></CardContent></Card>)}
        </section>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Database className="h-3.5 w-3.5" />Analytics use live market data; unavailable provider values remain unavailable.</div>
      </main>
    </TerminalShell>
  );
}
