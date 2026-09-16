import { NextRequest, NextResponse } from "next/server"
import { getForexRate } from "@/lib/twelve-data"

export async function GET(request: NextRequest) {
  const currency = request.nextUrl.searchParams.get("currency")?.toUpperCase()
  if (!currency || !["EUR", "GBP", "JPY"].includes(currency)) {
    return NextResponse.json({ rate: 1 })
  }

  try {
    return NextResponse.json({ rate: await getForexRate(`USD/${currency}`) }, {
      headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" },
    })
  } catch {
    return NextResponse.json({ error: "Exchange rate unavailable" }, { status: 503 })
  }
}