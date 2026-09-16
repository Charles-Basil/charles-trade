"use client";

import { useEffect, useState } from "react";
import { Landmark, RefreshCw, TrendingUp, TrendingDown, ExternalLink, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDashboardDateTime } from "@/lib/date-time";

type Quote = {
  symbol?: string;
  name?: string;
  close?: string;
  percent_change?: string;
  image?: string;
  volume?: string;
  high?: string;
  low?: string;
  market_cap?: string;
};

export function NgxMarketPanel() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ngx", { cache: "no-store" });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`NGX service returned an invalid response (${response.status})`);
      }
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error || "NGN Market provider unavailable");
      setConfigured(result.configured);
      if (result.configured) {
        const quotesArray = Object.values(result.data as Record<string, Quote>).filter((quote) => Boolean(quote && quote.close));
        setQuotes(quotesArray);
        setLastUpdated(result.updatedAt ? formatDashboardDateTime(result.updatedAt) : formatDashboardDateTime(new Date()));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load NGX quotes.");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
    const interval = window.setInterval(loadQuotes, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const formatNgn = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "₦--";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatChange = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0.00%";
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const getChangeColor = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num >= 0 ? "text-chart-2" : "text-destructive";
  };

  const getChangeBg = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num >= 0 ? "bg-chart-2/10" : "bg-destructive/10";
  };

  const getChangeIcon = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />;
  };

  return (
    <section className="surface-panel-elevated overflow-hidden">
      <CardHeader className="border-b border-border/30 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2 bg-chart-2/10">
              <Landmark className="h-5 w-5 text-chart-2" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                Nigerian Exchange
                <Badge variant="secondary" className="ml-2 h-4 px-2 text-xs">NGX</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Local equities in NGN, sourced from your configured feed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadQuotes}
                    aria-label="Refresh Nigerian market"
                    disabled={loading}
                    className={loading ? "animate-spin" : ""}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Refresh quotes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">NGX Website</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">View on NGX</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {lastUpdated && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-chart-2" />
            <span>Last updated: {lastUpdated}</span>
            <span className="h-4 w-px bg-border mx-1" />
            <span>{quotes.length} symbols tracked</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {error ? (
          <div className="p-6 text-center">
            <div className="rounded-full p-3 bg-destructive/10 w-fit mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="font-medium text-lg mb-1">NGX data unavailable</p>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadQuotes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : !configured ? (
          <div className="p-6 text-center">
            <div className="rounded-full p-3 bg-primary/10 w-fit mx-auto mb-4">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium text-lg mb-1">Connect the NGX feed</p>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Add an NGN Market API key to load live Nigerian prices. The app will never display invented quote data.
            </p>
            <Button variant="outline" className="mt-4" onClick={loadQuotes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        ) : loading ? (
          <div className="p-6 text-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading NGX quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-6 text-center">
            <div className="rounded-full p-3 bg-muted/50 w-fit mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-lg mb-1">No configured NGX symbols found</p>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Check <code className="bg-muted px-1.5 rounded">NGX_SYMBOLS</code> in <code className="bg-muted px-1.5 rounded">.env.local</code>, then restart the Next.js server.
            </p>
          </div>
        ) : (
          <div className="grid gap-px bg-border/50 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 p-px">
            {quotes.map((quote) => {
              const change = Number(quote.percent_change || 0);
              const changeColor = getChangeColor(change);
              const changeBg = getChangeBg(change);
              const changeIcon = getChangeIcon(change);

              return (
                <TooltipProvider key={quote.symbol}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "bg-card p-4 sm:p-5 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20",
                        "border-r border-border/50 last:border-r-0",
                        "sm:border-b sm:last:border-b-0"
                      )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={quote.image || `/placeholder.svg?height=40&width=40&text=${quote.symbol}`} alt={quote.name} />
                              <AvatarFallback className="text-xs font-bold">{quote.symbol?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{quote.symbol}</p>
                              <p className="text-xs text-muted-foreground truncate">{quote.name}</p>
                            </div>
                          </div>
                          <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", changeBg, changeColor)}>
                            {changeIcon}
                            {formatChange(change)}
                          </div>
                        </div>
                        <p className="relative font-display text-xl font-bold tabular-nums">{formatNgn(quote.close ?? "")}</p>
                        <div className="relative mt-3 pt-3 border-t border-border/30 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{quote.volume ? `Vol: ${formatNgn(quote.volume)}` : ""}</span>
                          <span>{quote.high && quote.low ? `H/L: ${formatNgn(quote.high)} / ${formatNgn(quote.low)}` : ""}</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{quote.symbol} - {quote.name}</span>
                          <Badge variant={change >= 0 ? "secondary" : "destructive"} className="gap-1">
                            {changeIcon}
                            {formatChange(change)} (24h)
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Current</p>
                            <p className="font-medium">{formatNgn(quote.close ?? "")}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Market Cap</p>
                            <p className="font-medium">{quote.market_cap ? formatNgn(quote.market_cap) : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">24h High</p>
                            <p className="font-medium">{quote.high ? formatNgn(quote.high) : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">24h Low</p>
                            <p className="font-medium">{quote.low ? formatNgn(quote.low) : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Volume</p>
                            <p className="font-medium">{quote.volume ? formatNgn(quote.volume) : "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
      </CardContent>
    </section>
  );
}