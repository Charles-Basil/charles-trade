import { NextResponse } from "next/server";
import { getCoinMarketCapGlobalMetrics } from "@/lib/coinmarketcap";

export async function GET() {
  try {
    const metrics = await getCoinMarketCapGlobalMetrics();
    const quote = metrics.quote?.USD;
    return NextResponse.json({
      totalMarketCap: quote?.total_market_cap ?? null,
      totalVolume24h: quote?.total_volume_24h ?? null,
      btcDominance: metrics.btc_dominance ?? null,
      ethDominance: metrics.eth_dominance ?? null,
      marketCapChange24h: null,
      volumeChange24h: null,
      activeCryptos: metrics.active_cryptocurrencies ?? null,
      markets: metrics.active_market_pairs ?? null,
    }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=900" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "CoinMarketCap global metrics unavailable" }, { status: 503 });
  }
}