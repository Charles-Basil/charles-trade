import { NextResponse } from "next/server"

const symbols = (process.env.NGX_SYMBOLS || "DANGCEM,MTNN,BUACEMENT,GTCO,ZENITHBANK").split(",")
const apiBaseUrl = "https://api.ngnmarket.com/v1"

export const dynamic = "force-dynamic"

export async function GET() {
  const apiKey = process.env.NGNMARKET_API_KEY

  if (!apiKey) {
    return NextResponse.json({ configured: false, message: "Add NGNMARKET_API_KEY to connect the NGX feed." })
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/companies?limit=200&sort=market_cap&order=desc`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 300 },
      },
    )

    if (!response.ok) {
      return NextResponse.json({ error: "NGN Market provider unavailable" }, { status: response.status })
    }

    const payload = await response.json()
    if (!payload.success) {
      return NextResponse.json({ error: payload.error?.message || "NGN Market provider returned an error" }, { status: 502 })
    }

    const requestedSymbols = new Set(symbols.map((symbol) => symbol.trim().toUpperCase()))
    const companies = (payload.data?.data || []).filter((company: { symbol?: string }) => requestedSymbols.has(company.symbol?.toUpperCase() || ""))
    const data = Object.fromEntries(
      companies.map((company: { symbol: string; name: string; price: number; price_change_percent: number; logo_url?: string }) => [
        company.symbol,
        {
          symbol: company.symbol,
          name: company.name,
          close: String(company.price),
          percent_change: String(company.price_change_percent ?? 0),
          image: company.logo_url,
        },
      ]),
    )

    return NextResponse.json({ configured: true, data, updatedAt: payload.meta?.updated_at }, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=900" },
    })
  } catch {
    return NextResponse.json({ error: "Unable to reach NGN Market provider" }, { status: 503 })
  }
}