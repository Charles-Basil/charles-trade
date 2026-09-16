"use client";

import { ArrowUpRight, Globe2, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CryptoMarketTable } from "@/components/crypto-market-table";
import { NgxMarketPanel } from "@/components/ngx-market-panel";
import { TopMovers } from "@/components/top-movers";
import { TerminalShell } from "@/components/terminal-shell";

export default function MarketsPage() {
  return (
    <TerminalShell>
      <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Markets</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Explore the market.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Compare live digital assets and Nigerian equities using the same normalized feeds powering your dashboard.</p>
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            [Globe2, "Crypto Markets", "Live spot prices and rank data"],
            [TrendingUp, "Top Gainers", "Strongest 24-hour moves"],
            [TrendingDown, "Top Losers", "Weakest 24-hour moves"],
          ].map(([Icon, title, description]) => <Card key={title as string} className="surface-panel"><CardContent className="flex items-center gap-4 p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><div><p className="font-display font-semibold">{title as string}</p><p className="mt-1 text-xs text-muted-foreground">{description as string}</p></div><ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" /></CardContent></Card>)}
        </div>
        <section><CryptoMarketTable /></section>
        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]"><NgxMarketPanel /><TopMovers /></section>
      </main>
    </TerminalShell>
  );
}
