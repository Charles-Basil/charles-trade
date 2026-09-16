"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, Activity, ExternalLink, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { getCryptoIconUrl } from "@/lib/crypto-icons";

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
}

const cryptoIcons: Record<string, string> = {
  BTC: "/placeholder.svg?height=24&width=24&text=BTC",
  ETH: "/placeholder.svg?height=24&width=24&text=ETH",
  XRP: "/placeholder.svg?height=24&width=24&text=XRP",
  DOGE: "/placeholder.svg?height=24&width=24&text=DOGE",
  SOL: "/placeholder.svg?height=24&width=24&text=SOL",
  ADA: "/placeholder.svg?height=24&width=24&text=ADA",
  DOT: "/placeholder.svg?height=24&width=24&text=DOT",
  SHIB: "/placeholder.svg?height=24&width=24&text=SHIB",
  LTC: "/placeholder.svg?height=24&width=24&text=LTC",
  LINK: "/placeholder.svg?height=24&width=24&text=LINK",
  AVAX: "/placeholder.svg?height=24&width=24&text=AVAX",
  MATIC: "/placeholder.svg?height=24&width=24&text=MATIC",
  UNI: "/placeholder.svg?height=24&width=24&text=UNI",
  ATOM: "/placeholder.svg?height=24&width=24&text=ATOM",
  XLM: "/placeholder.svg?height=24&width=24&text=XLM",
};

const mockSearchResults: Cryptocurrency[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "btc", image: cryptoIcons.BTC, current_price: 43892.21, price_change_percentage_24h: 3.15, market_cap_rank: 1 },
  { id: "ethereum", name: "Ethereum", symbol: "eth", image: cryptoIcons.ETH, current_price: 2354.87, price_change_percentage_24h: -4.87, market_cap_rank: 2 },
  { id: "ripple", name: "XRP", symbol: "xrp", image: cryptoIcons.XRP, current_price: 0.58, price_change_percentage_24h: 5.23, market_cap_rank: 3 },
  { id: "dogecoin", name: "Dogecoin", symbol: "doge", image: cryptoIcons.DOGE, current_price: 0.12, price_change_percentage_24h: 9.12, market_cap_rank: 4 },
];

export function CryptoSearch() {
  const { convert, format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "/") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setResults([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchCryptos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/markets?query=${encodeURIComponent(debouncedSearchTerm)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Search provider returned an invalid response");
        }

        const formattedResults = data
          .map((asset: any) => {
            const symbol = asset.asset_id || asset.symbol || asset.id;
            return {
              id: asset.id || asset.asset_id?.toLowerCase() || symbol.toLowerCase(),
              name: asset.name || asset.asset_id || symbol,
              symbol: symbol.toLowerCase(),
              image: cryptoIcons[symbol.toUpperCase()]?.includes("placeholder") ? getCryptoIconUrl(symbol) : cryptoIcons[symbol.toUpperCase()] || getCryptoIconUrl(symbol),
              current_price: asset.price_usd || asset.current_price || 0,
              price_change_percentage_24h: asset.price_change_percentage_24h || 0,
              market_cap: asset.market_cap,
              market_cap_rank: asset.market_cap_rank,
              total_volume: asset.total_volume,
            };
          })
          .slice(0, 10);

        setResults(formattedResults);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching search data:", error);
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCryptos();
  }, [debouncedSearchTerm]);

  const handleSelect = useCallback((crypto: Cryptocurrency) => {
    if (!recentSearches.includes(crypto.id)) {
      setRecentSearches(prev => [crypto.id, ...prev.slice(0, 4)]);
    }
    setOpen(false);
    setSearchTerm("");
    setResults([]);
  }, [recentSearches]);

  const formatPrice = (price: number) => {
    const converted = convert(price);
    if (converted >= 1) return format(price, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (converted >= 0.01) return format(price, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    return format(price, { minimumFractionDigits: 8, maximumFractionDigits: 8 });
  };

  const formatMarketCap = (cap: number | undefined) => {
    if (!cap) return "N/A";
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const getChangeColor = (change: number) => change >= 0 ? "text-chart-2" : "text-destructive";
  const getChangeBg = (change: number) => change >= 0 ? "bg-chart-2/10" : "bg-destructive/10";

  return (
    <TooltipProvider>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="w-full max-w-2xl" shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder="Search for any cryptocurrency... (⌘K)"
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="bg-background/50 border-border/50 placeholder:text-muted-foreground/50"
          />
          <CommandList className="max-h-[500px]">
            <CommandEmpty className="py-8">
              {loading ? (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span>Searching...</span>
                </div>
              ) : searchTerm ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Search className="h-8 w-8 opacity-50" />
                  <span>No cryptocurrencies found for "{searchTerm}"</span>
                </div>
              ) : recentSearches.length > 0 ? (
                <div className="text-center">
                  <p className="text-sm font-medium mb-3">Recent searches</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {recentSearches.map((id) => (
                      <Button
                        key={id}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => {
                          setSearchTerm(id);
                          inputRef.current?.focus();
                        }}
                      >
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Search className="h-8 w-8 opacity-50" />
                  <span>Type to search 10,000+ cryptocurrencies</span>
                  <p className="text-xs">Press <kbd className="px-1.5 py-0.5 bg-muted rounded">⌘K</kbd> to open</p>
                </div>
              )}
            </CommandEmpty>

            {results.length > 0 && (
              <>
                <CommandGroup heading="Cryptocurrencies">
                  {results.map((crypto, index) => (
                    <CommandItem
                      key={crypto.id}
                      onSelect={() => handleSelect(crypto)}
                      className="relative overflow-hidden group hover:bg-primary/5 transition-colors"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-8 w-8 ring-2 ring-background">
                          <AvatarImage src={crypto.image} alt={crypto.name} />
                          <AvatarFallback className="text-xs font-bold">{crypto.symbol.toUpperCase()[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{crypto.name}</p>
                            {crypto.market_cap_rank && crypto.market_cap_rank <= 10 && (
                              <Badge variant="secondary" className="text-[10px] h-3.5 px-1.5">#{crypto.market_cap_rank}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{crypto.symbol.toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-3 text-right min-w-[160px]">
                          <div className={cn("flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold", getChangeBg(crypto.price_change_percentage_24h), getChangeColor(crypto.price_change_percentage_24h))}>
                            {crypto.price_change_percentage_24h >= 0 ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5 rotate-180" />}
                            {crypto.price_change_percentage_24h.toFixed(2)}%
                          </div>
                          <p className="font-mono tabular-nums font-medium text-sm whitespace-nowrap">{formatPrice(crypto.current_price)}</p>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleSelect(crypto); }}>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{crypto.name} ({crypto.symbol.toUpperCase()})</span>
                                <Badge variant={crypto.price_change_percentage_24h >= 0 ? "secondary" : "destructive"} className="gap-1">
                                  {crypto.price_change_percentage_24h >= 0 ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5 rotate-180" />}
                                  {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/50 pt-2">
                                <div>
                                  <p className="text-muted-foreground">Price</p>
                                  <p className="font-medium">{formatPrice(crypto.current_price)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Market Cap</p>
                                  <p className="font-medium">{formatMarketCap(crypto.market_cap)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Rank</p>
                                  <p className="font-medium">#{crypto.market_cap_rank || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Volume</p>
                                  <p className="font-medium">{crypto.total_volume ? formatMarketCap(crypto.total_volume) : "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                  <CommandItem onSelect={() => { setSearchTerm("bitcoin"); inputRef.current?.focus(); }} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={cryptoIcons.BTC} alt="Bitcoin" /></Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Bitcoin (BTC)</p>
                      <p className="text-xs text-muted-foreground">View Bitcoin details</p>
                    </div>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                  <CommandItem onSelect={() => { setSearchTerm("ethereum"); inputRef.current?.focus(); }} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={cryptoIcons.ETH} alt="Ethereum" /></Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Ethereum (ETH)</p>
                      <p className="text-xs text-muted-foreground">View Ethereum details</p>
                    </div>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                  <CommandItem onSelect={() => { setSearchTerm("solana"); inputRef.current?.focus(); }} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={cryptoIcons.SOL} alt="Solana" /></Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Solana (SOL)</p>
                      <p className="text-xs text-muted-foreground">View Solana details</p>
                    </div>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-full px-2 sm:px-0">
            <Search className="absolute left-5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search cryptocurrencies... (⌘K)"
              className="pl-10 pr-12 sm:pr-10 bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary transition-colors text-sm sm:text-base"
              onClick={() => setOpen(true)}
              readOnly
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">Open search</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘K</kbd> to open search
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}