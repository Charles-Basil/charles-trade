"use client";

import { BriefcaseBusiness, ChartNoAxesCombined, Plus, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalShell } from "@/components/terminal-shell";

const metrics = [
  { label: "Total Portfolio Value", value: "Not connected", icon: WalletCards },
  { label: "Today's P&L", value: "Awaiting assets", icon: ChartNoAxesCombined },
  { label: "Total P&L", value: "Awaiting assets", icon: BriefcaseBusiness },
];

export default function PortfolioPage() {
  return (
    <TerminalShell>
      <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Portfolio</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Track what you own.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Connect your holdings or add assets manually to monitor allocation and performance in one place.</p>
          </div>
          <Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Add Asset</Button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="surface-panel">
              <CardContent className="p-5">
                <div className="mb-6 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="surface-panel-elevated">
            <CardHeader><CardTitle className="font-display">Holdings</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
                <WalletCards className="mx-auto h-8 w-8 text-primary" />
                <h2 className="mt-4 font-display text-xl font-semibold">Your portfolio is ready</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Add assets to start tracking your performance. No brokerage balances are connected yet.</p>
                <Button variant="outline" className="mt-5 rounded-xl"><Plus className="mr-2 h-4 w-4" />Add Asset</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="surface-panel-elevated">
            <CardHeader><CardTitle className="font-display">Asset Allocation</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-6 text-muted-foreground">Allocation insights will appear after you add your first asset.</p></CardContent>
          </Card>
        </section>

        <Card className="surface-panel-elevated mt-6">
          <CardHeader><CardTitle className="font-display">Recent Activity</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-6 text-muted-foreground">Your portfolio activity will appear here. Charles Trade does not execute or import transactions yet.</p></CardContent>
        </Card>
      </main>
    </TerminalShell>
  );
}
