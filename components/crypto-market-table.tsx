"use client";

import { useState, useEffect, useMemo } from "react";
import { Activity, ArrowUpDown, ChevronUp, ChevronDown, RefreshCw, ExternalLink, Search, Filter } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { formatDashboardTime } from "@/lib/date-time";

interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  ath?: number;
  ath_change_percentage?: number;
  last_updated: string;
}

const sparklineCache = new Map<string, number[]>();

export function CryptoMarketTable() {
  const { convert, format } = useCurrency();
  const [cryptoData, setCryptoData] = useState<CryptoMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof CryptoMarketData>("market_cap_rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRank, setFilterRank] = useState<"all" | "top10" | "top50" | "top100">("all");
  const [showSparklines, setShowSparklines] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    const fetchCryptoMarketData = async () => {
      setRefreshing(true);
      setError(null);
      try {
        const response = await fetch("/api/markets", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`Market service returned an invalid response (${response.status})`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error(data.error || "Market provider returned an invalid response");

        const enrichedData = data.map((asset: any, index: number) => ({
          ...asset,
          market_cap_rank: asset.market_cap_rank ?? index + 1,
          price_change_percentage_7d: asset.price_change_percentage_7d_in_currency?.usd ?? asset.price_change_percentage_7d,
          price_change_percentage_30d: asset.price_change_percentage_30d_in_currency?.usd ?? asset.price_change_percentage_30d,
          high_24h: typeof asset.high_24h === "number" ? asset.high_24h : asset.high_24h?.usd,
          low_24h: typeof asset.low_24h === "number" ? asset.low_24h : asset.low_24h?.usd,
          ath: typeof asset.ath === "number" ? asset.ath : asset.ath?.usd,
          ath_change_percentage: typeof asset.ath_change_percentage === "number" ? asset.ath_change_percentage : asset.ath_change_percentage?.usd,
        }));

        setCryptoData(enrichedData);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setError("Live market data is temporarily unavailable.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchCryptoMarketData();
    const interval = window.setInterval(fetchCryptoMarketData, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleSort = (column: keyof CryptoMarketData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredData = useMemo(() => {
    let result = [...cryptoData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(term) ||
          asset.symbol.toLowerCase().includes(term) ||
          asset.id.toLowerCase().includes(term)
      );
    }

    if (filterRank !== "all") {
      const limit = parseInt(filterRank.replace("top", ""), 10);
      result = result.filter((asset) => (asset.market_cap_rank ?? Infinity) <= limit);
    }

    return result;
  }, [cryptoData, searchTerm, filterRank]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const formatPrice = (price: number) => {
    const converted = convert(price);
    if (converted >= 1) return format(price, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (converted >= 0.01) return format(price, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    return format(price, { minimumFractionDigits: 8, maximumFractionDigits: 8 });
  };

  const formatLargeNumber = (num?: number) => {
    if (num == null) return "N/A";
    const converted = convert(num);
    if (converted >= 1e12) return `${format(num, { maximumFractionDigits: 2 })}`;
    if (converted >= 1e9) return `${format(num, { maximumFractionDigits: 2 })}`;
    if (converted >= 1e6) return `${format(num, { maximumFractionDigits: 2 })}`;
    return format(num, { maximumFractionDigits: 0 });
  };

  const getChangeColor = (change: number) => change >= 0 ? "text-chart-2" : "text-destructive";
  const getChangeBg = (change: number) => change >= 0 ? "bg-chart-2/10" : "bg-destructive/10";
  const getChangeIcon = (change: number) => change >= 0 ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;

  const SortableHeader = ({ column, label, children, className }: { column: keyof CryptoMarketData; label: string; children?: React.ReactNode; className?: string }) => (
    <TableHead className={cn("cursor-pointer select-none hover:bg-muted/50 transition-colors", className)}>
      <Button variant="ghost" className="p-0 h-auto font-medium text-xs uppercase tracking-wider text-muted-foreground" onClick={() => handleSort(column)}>
        <div className="flex items-center gap-1.5">
          {label}
          {children}
          {sortColumn === column && (
            <span className="flex items-center">
              {sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5 text-primary" /> : <ChevronDown className="h-3.5 w-3.5 text-primary" />}
            </span>
          )}
        </div>
      </Button>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="surface-panel overflow-hidden">
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Crypto Markets</h2>
            <div className="flex items-center gap-2">
              <Input placeholder="Search assets..." className="w-64 bg-background/50" disabled />
              <Button variant="outline" size="icon" disabled><RefreshCw className="h-4 w-4 animate-spin" /></Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 skeleton-premium rounded-xl h-14" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-panel-elevated overflow-hidden">
      <div className="p-6 border-b border-border/30">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Crypto Markets</h2>
            <p className="text-sm text-muted-foreground mt-1">Live spot prices and 24-hour performance • {sortedData.length} assets</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-10 w-64 bg-background/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterRank} onValueChange={(value) => setFilterRank(value as typeof filterRank)}>
              <SelectTrigger className="w-[140px] bg-background/50">
                <SelectValue placeholder="All Ranks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="top10">Top 10</SelectItem>
                <SelectItem value="top50">Top 50</SelectItem>
                <SelectItem value="top100">Top 100</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowSparklines(!showSparklines)} className={cn(showSparklines && "bg-primary/10 text-primary")}>
                    <Activity className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{showSparklines ? "Hide sparklines" : "Show sparklines"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setCompactMode(!compactMode)} className={cn(compactMode && "bg-primary/10 text-primary")}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{compactMode ? "Expanded view" : "Compact view"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="icon" onClick={() => window.location.reload()} disabled={refreshing} className={refreshing ? "animate-spin" : ""}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 bg-destructive/10 border-b border-border/30 flex items-center justify-between">
          <p className="text-sm text-destructive flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error} {refreshing ? "Retrying..." : ""}
          </p>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/30 bg-muted/30">
              <SortableHeader column="market_cap_rank" label="#" />
              <SortableHeader column="name" label="Asset" />
              <SortableHeader column="current_price" label="Price" />
              <TableHead className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">24h</TableHead>
              <TableHead className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">7d</TableHead>
              <TableHead className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">30d</TableHead>
              <SortableHeader column="market_cap" label="Market Cap" className="hidden md:table-cell" />
              <SortableHeader column="total_volume" label="Volume (24h)" className="hidden lg:table-cell" />
              <TableHead className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ATH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((crypto, index) => (
              <TableRow
                key={crypto.id}
                className={cn(
                  "transition-colors hover:bg-muted/30 cursor-pointer group",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}
              >
                <TableCell className="font-mono font-medium text-sm text-muted-foreground">
                  {crypto.market_cap_rank}
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex items-center gap-3">
                    <Avatar className={cn("h-8 w-8 ring-2 ring-background", compactMode && "h-6 w-6")}>
                      <AvatarImage src={crypto.image} alt={crypto.name} />
                      <AvatarFallback className="text-xs font-semibold">{crypto.symbol.toUpperCase()[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("font-medium truncate", compactMode && "text-sm")}>{crypto.name}</p>
                        {crypto.market_cap_rank != null && crypto.market_cap_rank <= 10 && (
                          <Badge variant="secondary" className="text-xs h-4 px-1.5">Top 10</Badge>
                        )}
                      </div>
                      <p className={cn("text-xs text-muted-foreground truncate", compactMode && "hidden")}>{crypto.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-medium">
                  {formatPrice(crypto.current_price)}
                </TableCell>
                <TableCell className="text-right">
                  <div className={cn("flex items-center justify-end gap-1.5", getChangeBg(crypto.price_change_percentage_24h), "rounded-full px-2.5 py-1")}>
                    {getChangeIcon(crypto.price_change_percentage_24h)}
                    <span className={cn("text-sm font-semibold", getChangeColor(crypto.price_change_percentage_24h))}>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  {crypto.price_change_percentage_7d !== undefined && (
                    <span className={cn("text-sm font-semibold", getChangeColor(crypto.price_change_percentage_7d))}>
                      {crypto.price_change_percentage_7d != null ? `${crypto.price_change_percentage_7d >= 0 ? "+" : ""}${crypto.price_change_percentage_7d.toFixed(2)}%` : "N/A"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right hidden lg:table-cell">
                  {crypto.price_change_percentage_30d !== undefined && (
                    <span className={cn("text-sm font-semibold", getChangeColor(crypto.price_change_percentage_30d))}>
                      {crypto.price_change_percentage_30d != null ? `${crypto.price_change_percentage_30d >= 0 ? "+" : ""}${crypto.price_change_percentage_30d.toFixed(2)}%` : "N/A"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell font-mono tabular-nums">
                  {formatLargeNumber(crypto.market_cap)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground hidden lg:table-cell font-mono tabular-nums">
                  {formatLargeNumber(crypto.total_volume)}
                </TableCell>
                <TableCell className="text-right">
                  {crypto.ath_change_percentage !== undefined && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={cn("text-xs font-medium", crypto.ath_change_percentage >= -10 ? "text-destructive" : "text-muted-foreground")}>
                            {crypto.ath_change_percentage.toFixed(1)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="end">
                          <div className="space-y-1">
                            <p className="font-medium">All-Time High</p>
                            <p className="text-sm">{crypto.ath != null ? formatPrice(crypto.ath) : "N/A"}</p>
                            <p className="text-xs text-muted-foreground">Current: {formatPrice(crypto.current_price)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                  No assets found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-border/30 bg-muted/30 flex items-center justify-between text-sm text-muted-foreground">
        <span>Last updated: {formatDashboardTime(new Date())}</span>
        <span>Auto-refresh: 60s</span>
      </div>
    </div>
  );
}