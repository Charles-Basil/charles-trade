import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.alternative.me/fng/?limit=31&format=json",
      { next: { revalidate: 600 } }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Fear & Greed provider unavailable" }, { status: response.status });
    }

    const data = await response.json();
    const current = data.data[0];
    const previous = data.data[1];

    const timestamp = Number(current?.timestamp);
    return NextResponse.json({
      value: parseInt(current.value, 10),
      classification: current.value_classification,
      timestamp: Number.isFinite(timestamp) ? new Date(timestamp * 1000).toISOString() : null,
      previousClose: parseInt(previous.value, 10),
      previous1Week: parseInt(data.data[7]?.value ?? previous.value, 10),
      previous1Month: parseInt(data.data[30]?.value ?? previous.value, 10),
    }, {
      headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=1800" },
    });
  } catch {
    return NextResponse.json({ error: "Unable to reach Fear & Greed provider" }, { status: 503 });
  }
}