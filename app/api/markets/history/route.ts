import { NextRequest, NextResponse } from "next/server";

const assetSymbols: Record<string, string> = {
  bitcoin: "BTC/USD",
  ethereum: "ETH/USD",
  ripple: "XRP/USD",
  dogecoin: "DOGE/USD",
  solana: "SOL/USD",
  cardano: "ADA/USD",
};

const rangeConfig: Record<string, { interval: string; outputsize: number }> = {
  "1H": { interval: "1min", outputsize: 60 },
  "1": { interval: "1h", outputsize: 24 },
  "7": { interval: "1h", outputsize: 168 },
  "30": { interval: "1day", outputsize: 30 },
  "90": { interval: "1day", outputsize: 90 },
  "365": { interval: "1day", outputsize: 365 },
  max: { interval: "1week", outputsize: 520 },
};

export const dynamic = "force-dynamic";

type HistoryPoint = Record<string, number | string>;
const historyCache = new Map<string, { expiresAt: number; value: Promise<HistoryPoint[]> }>();
const lastSuccessfulHistory = new Map<string, HistoryPoint[]>();

export async function GET(request: NextRequest) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  const days = request.nextUrl.searchParams.get("days") || "30";
  const assetsParam = request.nextUrl.searchParams.get("assets");
  const requestedAssets = (assetsParam ? assetsParam.split(",") : Object.keys(assetSymbols).slice(0, 4)).filter(
    (asset) => asset in assetSymbols,
  );
  const config = rangeConfig[days] || rangeConfig["30"];
  const cacheKey = `${days}:${requestedAssets.join(",")}`;

  if (!apiKey) {
    return NextResponse.json({ error: "Twelve Data is not configured." }, { status: 503 });
  }

  const cached = historyCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(await cached.value, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
  }

  const value = (async () => {
    const results = await Promise.allSettled(
      requestedAssets.map(async (asset) => {
        const params = new URLSearchParams({
          symbol: assetSymbols[asset],
          interval: config.interval,
          outputsize: String(config.outputsize),
          order: "asc",
          timezone: "UTC",
          apikey: apiKey,
        });
        const response = await fetch(`https://api.twelvedata.com/time_series?${params}`, { next: { revalidate: 60 } });
        const payload = await response.json();
        if (!response.ok || payload.status === "error") {
          throw new Error(payload.message || `Unable to fetch ${asset} history`);
        }
        return { asset, values: payload.values || [] };
      }),
    );

    const pointsByTimestamp = new Map<number, HistoryPoint>();
    results
      .filter((result): result is PromiseFulfilledResult<{ asset: string; values: { datetime: string; close: string }[] }> => result.status === "fulfilled")
      .forEach(({ value: { asset, values } }) => {
        values.forEach((point: { datetime: string; close: string }) => {
          if (!point.datetime || !Number.isFinite(Number(point.close))) return;
          const timestamp = new Date(point.datetime).getTime();
          const historyPoint = pointsByTimestamp.get(timestamp) || { timestamp, date: new Date(timestamp).toISOString() };
          historyPoint[asset] = Number(point.close);
          pointsByTimestamp.set(timestamp, historyPoint);
        });
      });

    const points = [...pointsByTimestamp.values()].sort((left, right) => Number(left.timestamp) - Number(right.timestamp));
    if (!points.length) throw new Error("Twelve Data returned no historical points");
    lastSuccessfulHistory.set(cacheKey, points);
    return points;
  })();
  historyCache.set(cacheKey, { expiresAt: Date.now() + 60_000, value });

  try {
    const points = await value;
    return NextResponse.json(points, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    historyCache.delete(cacheKey);
    const stalePoints = lastSuccessfulHistory.get(cacheKey);
    if (stalePoints) {
      return NextResponse.json(stalePoints, { headers: { "X-Market-Data": "stale" } });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Twelve Data history is temporarily unavailable" },
      { status: 503 },
    );
  }
}
