import { NextRequest, NextResponse } from "next/server"
import { getCryptoCatalog, type TwelveDataCrypto } from "@/lib/twelve-data"
import { getEnrichedCryptoAssets } from "@/lib/market-data"

const featuredSymbols = ["BTC/USD", "ETH/USD", "XRP/USD", "DOGE/USD"]

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query")
    if (query) {
      const catalog = await getCryptoCatalog()
      const normalizedQuery = query.trim().toLowerCase()
      const matches = catalog.data
        .filter((crypto: TwelveDataCrypto) =>
          crypto.symbol.toLowerCase().includes(normalizedQuery) ||
          crypto.currency_base.toLowerCase().includes(normalizedQuery),
        )
        .filter((crypto: TwelveDataCrypto) => crypto.currency_quote === "US Dollar")
        .sort((left, right) => {
          const leftBase = left.currency_base.toLowerCase()
          const rightBase = right.currency_base.toLowerCase()
          const leftExact = leftBase === normalizedQuery ? 0 : 1
          const rightExact = rightBase === normalizedQuery ? 0 : 1
          return leftExact - rightExact || leftBase.localeCompare(rightBase)
        })
        .slice(0, 10)
      return NextResponse.json(await getEnrichedCryptoAssets(matches.map((crypto) => crypto.symbol)))
    }
    return NextResponse.json(await getEnrichedCryptoAssets(featuredSymbols), {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    })
  } catch {
    return NextResponse.json({ error: "Unable to reach Twelve Data" }, { status: 503 })
  }
}