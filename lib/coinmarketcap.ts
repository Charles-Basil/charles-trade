const coinMarketCapBaseUrl = "https://pro-api.coinmarketcap.com";
const responseCache = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

export type CoinMarketCapQuote = {
  symbol: string;
  name?: string;
  slug?: string;
  cmc_rank?: number;
  quote?: {
    USD?: {
      price?: number;
      volume_24h?: number;
      percent_change_24h?: number;
      percent_change_7d?: number;
      percent_change_30d?: number;
      market_cap?: number;
      market_cap_dominance?: number;
      ath?: number;
      percent_change_from_ath?: number;
      last_updated?: string;
    };
  };
};

export type CoinMarketCapQuoteValue = CoinMarketCapQuote | CoinMarketCapQuote[];

type CoinMarketCapResponse<T> = {
  data: T;
  status?: { error_code?: number; error_message?: string };
};

function getApiKey() {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) throw new Error("CoinMarketCap is not configured.");
  return apiKey;
}

async function coinMarketCapRequest<T>(path: string, params: Record<string, string>, ttl: number) {
  const cacheKey = `${path}?${new URLSearchParams(params)}`;
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value as Promise<T>;

  const value = fetch(`${coinMarketCapBaseUrl}${path}?${new URLSearchParams(params)}`, {
    headers: { "X-CMC_PRO_API_KEY": getApiKey(), Accept: "application/json" },
    next: { revalidate: ttl },
  }).then(async (response) => {
    const payload = await response.json() as CoinMarketCapResponse<T>;
    if (!response.ok || payload.status?.error_code) {
      throw new Error(payload.status?.error_message || "CoinMarketCap request failed");
    }
    return payload.data;
  });

  responseCache.set(cacheKey, { expiresAt: Date.now() + ttl * 1000, value });
  value.catch(() => responseCache.delete(cacheKey));
  return value;
}

export function getCoinMarketCapQuotes(symbols: string[]) {
  return coinMarketCapRequest<Record<string, CoinMarketCapQuoteValue>>("/v2/cryptocurrency/quotes/latest", {
    symbol: [...new Set(symbols.map((symbol) => symbol.toUpperCase()))].join(","),
    convert: "USD",
  }, 60);
}

export function getCoinMarketCapGlobalMetrics() {
  return coinMarketCapRequest<{
    quote?: { USD?: { total_market_cap?: number; total_volume_24h?: number; last_updated?: string } };
    btc_dominance?: number;
    eth_dominance?: number;
    active_cryptocurrencies?: number;
    active_market_pairs?: number;
  }>("/v1/global-metrics/quotes/latest", { convert: "USD" }, 300);
}