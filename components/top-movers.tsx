"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  market_cap?: number;
  total_volume: number;
  market_cap_rank: number;
}

interface TopMoversData {
  gainers: CryptoAsset[];
  losers: CryptoAsset[];
  trending: CryptoAsset[];
  mostVolatile: CryptoAsset[];
}

export function TopMovers() {
  const { convert, format } = useCurrency();
  const [data, setData] = useState<TopMoversData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gainers" | "losers" | "trending" | "volatile">("gainers");

  useEffect(() => {
    const fetchTopMovers = async () => {
      try {
        const response = await fetch("/api/markets/top-movers", { cache: "no-store" });
        if (!response.ok) throw new Error("Top movers data unavailable");
        const result = await response.json();
        if (!result || !Array.isArray(result.gainers) || !Array.isArray(result.losers) || !Array.isArray(result.trending) || !Array.isArray(result.mostVolatile)) {
          throw new Error("Invalid top movers response");
        }
        setData(result);
        const firstAvailableTab = (["gainers", "losers", "trending", "volatile"] as const)
          .find((tab) => (tab === "volatile" ? result.mostVolatile : result[tab])?.length > 0);
        if (firstAvailableTab) setActiveTab(firstAvailableTab);
      } catch (err) {
        console.error("Error fetching top movers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovers();
    const interval = setInterval(fetchTopMovers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAssets = () => {
    switch (activeTab) {
      case "gainers": return data?.gainers ?? [];
      case "losers": return data?.losers ?? [];
      case "trending": return data?.trending ?? [];
      case "volatile": return data?.mostVolatile ?? [];
    }
  };

  const assets = getAssets();

  const formatPrice = (price: number) => {
    const converted = convert(price);
    if (converted >= 1) return format(price, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (converted >= 0.01) return format(price, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    return format(price, { minimumFractionDigits: 8, maximumFractionDigits: 8 });
  };

  const formatMarketCap = (cap?: number) => {
    if (!cap) return "N/A";
    return format(cap, { maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <Card className="surface-panel">
        <CardHeader className="border-b border-border/30">
          <CardTitle className="font-display">Top Movers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 skeleton-premium rounded-xl h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-panel-elevated overflow-hidden">
      <CardHeader className="border-b border-border/30 px-4 py-4 sm:px-6">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-display">Top Movers</CardTitle>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="relative z-10">
            <TabsList className="max-w-full overflow-x-auto bg-muted/50 rounded-xl p-1 gap-1">
              <TabsTrigger value="gainers" className="px-3 py-1.5 text-xs rounded-lg">Gainers</TabsTrigger>
              <TabsTrigger value="losers" className="px-3 py-1.5 text-xs rounded-lg">Losers</TabsTrigger>
              <TabsTrigger value="trending" className="px-3 py-1.5 text-xs rounded-lg">Trending</TabsTrigger>
              <TabsTrigger value="volatile" className="px-3 py-1.5 text-xs rounded-lg">Volatile</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]" role="table">
            <thead>
              <tr className="border-b border-border/30 bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asset</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {activeTab === "trending" ? "Score" : activeTab === "volatile" ? "Volatility" : "24h Change"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Market Cap</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {assets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No assets currently match this category.
                  </td>
                </tr>
              )}
              {assets.slice(0, 10).map((asset, index) => (
                <tr
                  key={asset.id}
                  className="transition-colors hover:bg-muted/30 cursor-pointer group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                    {asset.market_cap_rank || index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={asset.image} alt={asset.name} />
                        <AvatarFallback className="text-xs">{asset.symbol.toUpperCase()[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium hidden sm:table-cell">
                    {formatPrice(asset.current_price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {activeTab === "trending" ? (
                        <>
                          <Badge className={cn("text-xs", asset.price_change_percentage_24h >= 0 ? "bg-chart-2/10 text-chart-2" : "bg-destructive/10 text-destructive")}>
                            {asset.price_change_percentage_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(asset.price_change_percentage_24h).toFixed(1)}%
                          </Badge>
                        </>
                      ) : activeTab === "volatile" ? (
                        <Badge className="bg-primary/10 text-primary text-xs">
                          {asset.price_change_percentage_7d ? `${asset.price_change_percentage_7d.toFixed(1)}%` : "--"} 7d
                        </Badge>
                      ) : (
                        <span className={cn("font-semibold text-sm flex items-center justify-end gap-1", asset.price_change_percentage_24h >= 0 ? "text-chart-2" : "text-destructive")}>
                          {asset.price_change_percentage_24h >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {asset.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground hidden md:table-cell">
                    {formatMarketCap(asset.market_cap)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                    {formatMarketCap(asset.total_volume)}
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}