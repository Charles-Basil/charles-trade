import { NextRequest, NextResponse } from "next/server";
import { getEnrichedCryptoAssets } from "@/lib/market-data";

const featuredSymbols = ["BTC/USD", "ETH/USD", "XRP/USD", "DOGE/USD"];

export async function GET(request: NextRequest) {
  try {
    const data = await getEnrichedCryptoAssets(featuredSymbols);

    const sortedByGain = [...data].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
    const sortedByLoss = [...data].sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0));

    const gainers = sortedByGain.filter((c: any) => (c.price_change_percentage_24h ?? 0) > 0).slice(0, 10);
    const losers = sortedByLoss.filter((c: any) => (c.price_change_percentage_24h ?? 0) < 0).slice(0, 10);

    const trending = [...data]
      .sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))
      .slice(0, 10);

    const mostVolatile = [...data]
      .filter((c: any) => Math.abs(c.price_change_percentage_7d ?? 0) > 10)
      .sort((a, b) => Math.abs(b.price_change_percentage_7d ?? 0) - Math.abs(a.price_change_percentage_7d ?? 0))
      .slice(0, 10);

    return NextResponse.json({
      gainers,
      losers,
      trending,
      mostVolatile,
    }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "Unable to reach Twelve Data" }, { status: 503 });
  }
}