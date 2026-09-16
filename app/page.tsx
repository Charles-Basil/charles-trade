"use client";

import { ArrowUpRight, ShieldCheck, Sparkles, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoChart } from "@/components/crypto-chart";
import { CryptoMarketTable } from "@/components/crypto-market-table";
import { FearGreedIndex } from "@/components/fear-greed-index";
import { MarketOverview } from "@/components/market-overview";
import { NgxMarketPanel } from "@/components/ngx-market-panel";
import { TopMovers } from "@/components/top-movers";
import { TerminalShell } from "@/components/terminal-shell";
import { formatDashboardDate } from "@/lib/date-time";

export default function Page() {
  const dashboardDate = formatDashboardDate(new Date(), { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <TerminalShell>
        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <section className="relative mb-8 overflow-hidden rounded-[28px] border border-border/50 bg-card p-6 shadow-2xl shadow-black/10 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_35%,hsl(var(--primary)/0.2),transparent_58%)]" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-primary/20" />
            <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-chart-2/20" />
            <div className="relative z-10 max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5"><Sparkles className="h-3.5 w-3.5" />Daily intelligence brief</span><span className="flex items-center gap-2 text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-chart-2" />Live feeds connected</span></div>
              <h1 className="font-display max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">See the market before it becomes noise.</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">A sharper view across digital assets and Nigerian equities, built for fast decisions and grounded in live market data.</p>
              <div className="mt-7 flex flex-wrap items-center gap-3"><Button className="rounded-xl px-5 shadow-lg shadow-primary/20">Explore markets <ArrowUpRight className="ml-2 h-4 w-4" /></Button><div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-4 py-2.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-chart-2" />Provider-backed pricing</div></div>
            </div>
            <div className="relative z-10 mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/40 pt-5 text-xs text-muted-foreground lg:absolute lg:bottom-8 lg:right-10 lg:mt-0 lg:border-t-0 lg:pt-0"><span className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" />Updated automatically</span><span>{dashboardDate}</span></div>
          </section>

          <div className="mb-8"><MarketOverview /></div>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
            <div className="min-w-0 space-y-6"><CryptoChart /><CryptoMarketTable /></div>
            <aside className="min-w-0 space-y-6"><FearGreedIndex /><TopMovers /></aside>
          </section>

          <section className="mt-8"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Local market watch</p><h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Nigerian Exchange</h2></div><p className="hidden text-right text-xs text-muted-foreground sm:block">NGN-denominated equities<br />Latest provider update</p></div><NgxMarketPanel /></section>

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 py-6 text-xs text-muted-foreground"><span>Charles Trade terminal</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-chart-2" />Live market data enabled</span><span>Twelve Data · NGN Market</span></footer>
        </main>
    </TerminalShell>
  );
}
