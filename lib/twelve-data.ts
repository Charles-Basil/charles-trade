import { getCryptoIconUrl } from "@/lib/crypto-icons";

const twelveDataBaseUrl = "https://api.twelvedata.com";
const quoteCache = new Map<string, { expiresAt: number; value: Promise<TwelveDataQuote> }>();
const forexCache = new Map<string, { expiresAt: number; value: Promise<number> }>();
const assetCache = new Map<string, { expiresAt: number; value: Promise<ReturnType<typeof toCryptoAsset>[]> }>();

export type TwelveDataCrypto = {
  symbol: string;
  currency_base: string;
  currency_quote: string;
};

export type TwelveDataQuote = {
  symbol: string;
  name?: string;
  exchange?: string;
  datetime?: string;
  timestamp?: number;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  previous_close?: string;
  change?: string;
  percent_change?: string;
  rolling_7d_change?: string;
  volume?: string;
};

export type CryptoMarketAsset = {
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
  last_updated?: string;
};

function getApiKey() {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) throw new Error("Twelve Data is not configured.");
  return apiKey;
}

async function twelveDataRequest<T>(path: string, params: Record<string, string>, revalidate: number) {
  const searchParams = new URLSearchParams({ ...params, apikey: getApiKey() });
  const response = await fetch(`${twelveDataBaseUrl}${path}?${searchParams}`, { next: { revalidate } });
  const payload = await response.json();
  if (!response.ok || payload.status === "error") {
    throw new Error(payload.message || "Twelve Data request failed");
  }
  return payload as T;
}

export function getCryptoCatalog() {
  return twelveDataRequest<{ data: TwelveDataCrypto[] }>("/cryptocurrencies", {}, 3600);
}

export function getCryptoQuote(symbol: string) {
  const cached = quoteCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value = twelveDataRequest<TwelveDataQuote>("/quote", { symbol }, 60);
  quoteCache.set(symbol, { expiresAt: Date.now() + 60_000, value });
  value.catch(() => quoteCache.delete(symbol));
  return value;
}

export function toCryptoId(symbol: string) {
  return symbol.split("/")[0].toLowerCase();
}

export function toCryptoAsset(quote: TwelveDataQuote, rank: number): CryptoMarketAsset {
  const baseSymbol = quote.symbol.split("/")[0];
  const name = quote.name?.replace(/\s+US Dollar$/i, "") || baseSymbol;
  const price = Number(quote.close || 0);
  return {
    id: toCryptoId(quote.symbol),
    symbol: baseSymbol.toLowerCase(),
    name,
    image: getCryptoIconUrl(baseSymbol),
    current_price: price,
    price_change_24h: Number(quote.change || 0),
    price_change_percentage_24h: Number(quote.percent_change || 0),
    price_change_percentage_7d: Number(quote.rolling_7d_change || 0),
    market_cap_rank: rank,
    total_volume: Number(quote.volume || 0),
    high_24h: Number(quote.high || 0),
    low_24h: Number(quote.low || 0),
    last_updated: quote.datetime,
  };
}

export async function getForexRate(symbol: string) {
  const cached = forexCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value = twelveDataRequest<TwelveDataQuote>("/quote", { symbol }, 900)
    .then((quote) => Number(quote.close || 1));
  forexCache.set(symbol, { expiresAt: Date.now() + 15 * 60_000, value });
  value.catch(() => forexCache.delete(symbol));
  return value;
}

export function getFeaturedCryptoAssets(symbols: string[]) {
  const cacheKey = symbols.join(",");
  const cached = assetCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value = Promise.allSettled(symbols.map((symbol) => getCryptoQuote(symbol)))
    .then((quotes) => quotes
      .filter((result): result is PromiseFulfilledResult<TwelveDataQuote> => result.status === "fulfilled")
      .map((result, index) => toCryptoAsset(result.value, index + 1)));
  assetCache.set(cacheKey, { expiresAt: Date.now() + 60_000, value });
  value.catch(() => assetCache.delete(cacheKey));
  return value;
}