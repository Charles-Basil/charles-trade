"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TerminalShell } from "@/components/terminal-shell";
import { useCurrency } from "@/components/currency-provider";

type Asset = { id: string; symbol: string; name: string; current_price: number };

export default function TradingPage() {
  const { format } = useCurrency();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [symbol, setSymbol] = useState("btc");
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [demoMessage, setDemoMessage] = useState("");

  useEffect(() => {
    fetch("/api/markets", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setAssets(Array.isArray(data) ? data.slice(0, 20) : []))
      .catch(() => setAssets([]));
  }, []);

  const selectedAsset = assets.find((asset) => asset.id === symbol) ?? assets[0];
  const price = selectedAsset?.current_price ?? 0;
  const estimatedValue = price * (Number(quantity) || 0);
  const formatValue = (value: number) => value ? format(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A";

  return (
    <TerminalShell>
      <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trading</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Practice the decision.</h1></div>
            <span className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-500"><ShieldCheck className="h-3.5 w-3.5" />Demo Trading</span>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Review an order with live market prices. This interface is for planning only and never submits a real trade.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <Card className="surface-panel-elevated">
            <CardHeader><CardTitle className="font-display">Order ticket</CardTitle></CardHeader>
            <CardContent>
              <Tabs value={side} onValueChange={(value) => setSide(value as "buy" | "sell")}>
                <TabsList className="mb-6 grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
                  <TabsTrigger value="buy" className="rounded-lg"><ArrowUpFromLine className="mr-2 h-4 w-4" />Buy</TabsTrigger>
                  <TabsTrigger value="sell" className="rounded-lg"><ArrowDownToLine className="mr-2 h-4 w-4" />Sell</TabsTrigger>
                </TabsList>
                <TabsContent value={side} className="mt-0 space-y-5">
                  <div className="grid gap-2"><Label>Asset</Label><Select value={selectedAsset?.id ?? symbol} onValueChange={setSymbol}><SelectTrigger><SelectValue placeholder="Select an asset" /></SelectTrigger><SelectContent>{assets.map((asset) => <SelectItem key={asset.id} value={asset.id}>{asset.name} ({asset.symbol.toUpperCase()})</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label>Order type</Label><Select value={orderType} onValueChange={setOrderType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="market">Market</SelectItem><SelectItem value="limit">Limit</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" min="0" step="any" placeholder="0.00" value={quantity} onChange={(event) => { setQuantity(event.target.value); setDemoMessage(""); }} /></div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm"><span className="text-muted-foreground">Current price</span><span className="font-semibold tabular-nums">{formatValue(price)}</span></div>
                  <Button className="w-full rounded-xl" onClick={() => setDemoMessage("Demo only: no order was submitted.")}>{side === "buy" ? "Review demo buy" : "Review demo sell"}</Button>
                  {demoMessage && <p className="flex items-center gap-2 text-sm text-chart-2"><Info className="h-4 w-4" />{demoMessage}</p>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="surface-panel-elevated h-fit">
            <CardHeader><CardTitle className="font-display">Order summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Side</span><span className="font-medium capitalize">{side}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Asset</span><span className="font-medium">{selectedAsset?.symbol.toUpperCase() ?? "--"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{quantity || "--"}</span></div>
              <div className="flex justify-between border-t border-border/40 pt-4"><span className="text-muted-foreground">Estimated value</span><span className="font-display text-lg font-semibold">{formatValue(estimatedValue)}</span></div>
              <p className="border-t border-border/40 pt-4 text-xs leading-5 text-muted-foreground">Prices are read from the existing market feed. Execution, balances, and brokerage connectivity are disabled.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </TerminalShell>
  );
}
