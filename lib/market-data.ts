import { getCoinMarketCapQuotes, type CoinMarketCapQuote, type CoinMarketCapQuoteValue } from "@/lib/coinmarketcap";
import { getFeaturedCryptoAssets, toCryptoId, type CryptoMarketAsset } from "@/lib/twelve-data";
import { getCryptoIconUrl } from "@/lib/crypto-icons";

export type NormalizedCryptoAsset = CryptoMarketAsset;

export async function getEnrichedCryptoAssets(symbols: string[]) {
  const assets = await getFeaturedCryptoAssets(symbols);
  if (assets.length === 0) return getCoinMarketCapFallback(symbols);
  try {
    const metadata = await getCoinMarketCapQuotes(assets.map((asset) => asset.symbol));
    return assets.map((asset) => mergeCoinMarketCapMetadata(asset, selectQuote(metadata[asset.symbol.toUpperCase()], asset.symbol)));
  } catch {
    return assets;
  }
}

function mergeCoinMarketCapMetadata(asset: CryptoMarketAsset, metadata?: CoinMarketCapQuote): CryptoMarketAsset {
  const quote = metadata?.quote?.USD;
  if (!quote) return asset;
  return {
    ...asset,
    name: metadata.name || asset.name,
    market_cap_rank: metadata.cmc_rank ?? asset.market_cap_rank,
    market_cap: quote.market_cap,
    total_volume: quote.volume_24h ?? asset.total_volume,
    price_change_percentage_24h: quote.percent_change_24h ?? asset.price_change_percentage_24h,
    price_change_percentage_7d: quote.percent_change_7d ?? asset.price_change_percentage_7d,
    price_change_percentage_30d: quote.percent_change_30d ?? asset.price_change_percentage_30d,
    ath: quote.ath,
    ath_change_percentage: quote.percent_change_from_ath,
    last_updated: quote.last_updated ?? asset.last_updated,
  };
}

function selectQuote(value: CoinMarketCapQuoteValue | undefined, symbol: string) {
  if (!Array.isArray(value)) return value;
  return value.find((quote) => quote.symbol?.toUpperCase() === symbol.toUpperCase()) || value[0];
}

async function getCoinMarketCapFallback(symbols: string[]): Promise<CryptoMarketAsset[]> {
  try {
    const metadata = await getCoinMarketCapQuotes(symbols);
    return symbols.map((symbol, index) => {
      const baseSymbol = symbol.split("/")[0].toUpperCase();
      const quote = selectQuote(metadata[baseSymbol], baseSymbol);
      const usd = quote?.quote?.USD;
      if (!quote || !usd || typeof usd.price !== "number") return null;
      return {
        id: toCryptoId(symbol),
        symbol: baseSymbol.toLowerCase(),
        name: quote.name || baseSymbol,
        image: getCryptoIconUrl(baseSymbol),
        current_price: usd.price,
        price_change_24h: 0,
        price_change_percentage_24h: usd.percent_change_24h ?? 0,
        price_change_percentage_7d: usd.percent_change_7d,
        price_change_percentage_30d: usd.percent_change_30d,
        market_cap: usd.market_cap,
        market_cap_rank: quote.cmc_rank ?? index + 1,
        total_volume: usd.volume_24h,
        ath: usd.ath,
        ath_change_percentage: usd.percent_change_from_ath,
        last_updated: usd.last_updated,
      } as CryptoMarketAsset;
    }).filter((asset): asset is CryptoMarketAsset => asset !== null);
  } catch {
    return [];
  }
}