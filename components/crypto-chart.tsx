"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Button } from "@/components/ui/button"

const timeRanges = [
  { label: "24h", value: "1DAY" },
  { label: "7d", value: "7DAY" },
  { label: "30d", value: "1MTH" },
  { label: "90d", value: "3MTH" },
  { label: "1y", value: "1YRS" },
  { label: "YTD", value: "YTD" },
]

interface CryptoData {
  date: string
  bitcoin: number
  ethereum: number
  ripple: number
  dogecoin: number
}

// Mock data for different time ranges
const generateMockData = (range: string): CryptoData[] => {
  const data: CryptoData[] = []
  const dataPoints =
    range === "1DAY"
      ? 24
      : range === "7DAY"
        ? 7
        : range === "1MTH"
          ? 30
          : range === "3MTH"
            ? 30
            : range === "1YRS" || range === "YTD"
              ? 12
              : 30

  const now = new Date()
  const startDate = new Date()

  if (range === "1DAY") {
    startDate.setHours(now.getHours() - 24)
  } else if (range === "7DAY") {
    startDate.setDate(now.getDate() - 7)
  } else if (range === "1MTH") {
    startDate.setDate(now.getDate() - 30)
  } else if (range === "3MTH") {
    startDate.setDate(now.getDate() - 90)
  } else if (range === "1YRS") {
    startDate.setFullYear(now.getFullYear() - 1)
  } else if (range === "YTD") {
    startDate.setMonth(0, 1) // January 1st of current year
  }

  // Base prices
  const basePrices = {
    bitcoin: 43000,
    ethereum: 2300,
    ripple: 0.58,
    dogecoin: 0.12,
  }

  // Volatility factors
  const volatility = {
    bitcoin: 0.05,
    ethereum: 0.07,
    ripple: 0.09,
    dogecoin: 0.11,
  }

  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    const pointDate = new Date(startDate)

    if (range === "1DAY") {
      pointDate.setHours(startDate.getHours() + i)
    } else if (range === "7DAY") {
      pointDate.setDate(startDate.getDate() + i)
    } else if (range === "1MTH" || range === "3MTH") {
      pointDate.setDate(startDate.getDate() + Math.floor((Number.parseInt(range) / dataPoints) * i))
    } else {
      pointDate.setMonth(startDate.getMonth() + i)
    }

    // Create random price movements
    const btcChange = (Math.random() - 0.5) * 2 * volatility.bitcoin
    const ethChange = (Math.random() - 0.5) * 2 * volatility.ethereum
    const xrpChange = (Math.random() - 0.5) * 2 * volatility.ripple
    const dogeChange = (Math.random() - 0.5) * 2 * volatility.dogecoin

    // Apply trend based on position in the range (upward trend for most cryptos)
    const trendFactor = i / dataPoints
    const btcTrend = range === "YTD" ? 0.15 * trendFactor : 0.1 * trendFactor
    const ethTrend = range === "YTD" ? 0.2 * trendFactor : 0.12 * trendFactor
    const xrpTrend = range === "YTD" ? 0.1 * trendFactor : 0.08 * trendFactor
    const dogeTrend = range === "YTD" ? 0.3 * trendFactor : 0.18 * trendFactor

    data.push({
      date: formatDate(pointDate, range),
      bitcoin: basePrices.bitcoin * (1 + btcChange + btcTrend),
      ethereum: basePrices.ethereum * (1 + ethChange + ethTrend),
      ripple: basePrices.ripple * (1 + xrpChange + xrpTrend),
      dogecoin: basePrices.dogecoin * (1 + dogeChange + dogeTrend),
    })
  }

  return data
}

// Format date based on time range
const formatDate = (date: Date, range: string): string => {
  if (range === "1DAY") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (range === "7DAY" || range === "1MTH") {
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  } else {
    return date.toLocaleDateString([], { month: "short", year: "2-digit" })
  }
}

export function CryptoChart() {
  const [data, setData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("1MTH")
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true)
      setError(null)

      try {
        // CoinAPI endpoints for historical data
        const symbols = [
          "BITSTAMP_SPOT_BTC_USD", // Bitcoin
          "BITSTAMP_SPOT_ETH_USD", // Ethereum
          "BITSTAMP_SPOT_XRP_USD", // Ripple
          "KRAKEN_SPOT_DOGE_USD", // Dogecoin
        ]

        // Get period end (now)
        const endDate = new Date().toISOString()

        // Calculate period start based on timeRange
        const startDate = new Date()
        if (timeRange === "1DAY") {
          startDate.setDate(startDate.getDate() - 1)
        } else if (timeRange === "7DAY") {
          startDate.setDate(startDate.getDate() - 7)
        } else if (timeRange === "1MTH") {
          startDate.setMonth(startDate.getMonth() - 1)
        } else if (timeRange === "3MTH") {
          startDate.setMonth(startDate.getMonth() - 3)
        } else if (timeRange === "1YRS") {
          startDate.setFullYear(startDate.getFullYear() - 1)
        } else if (timeRange === "YTD") {
          startDate.setMonth(0, 1) // January 1st of current year
          startDate.setHours(0, 0, 0, 0)
        }

        // Determine appropriate period based on time range
        let period
        if (timeRange === "1DAY") {
          period = "1HRS" // 1 hour intervals for 1 day
        } else if (timeRange === "7DAY") {
          period = "6HRS" // 6 hour intervals for 7 days
        } else if (timeRange === "1MTH") {
          period = "1DAY" // 1 day intervals for 1 month
        } else {
          period = "1DAY" // 1 day intervals for longer periods
        }

        // Fetch data for each cryptocurrency
        const promises = symbols.map((symbol) =>
          fetch(
            `https://rest.coinapi.io/v1/ohlcv/${symbol}/history?period_id=${period}&time_start=${startDate.toISOString()}&time_end=${endDate}`,
            {
              headers: {
                "X-CoinAPI-Key": "9e036089-2dac-4d33-bbd9-129b9e200870",
              },
            },
          ).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${symbol} data: ${res.status}`)
            return res.json()
          }),
        )

        const results = await Promise.all(promises)

        // Process and combine the data
        const combinedData: CryptoData[] = []

        // Get the shortest result length to ensure we have data for all cryptos
        const minLength = Math.min(...results.map((r) => r.length))

        // Limit the number of data points to avoid overcrowding
        const maxDataPoints = 30
        const interval = Math.max(1, Math.floor(minLength / maxDataPoints))

        for (let i = 0; i < minLength; i += interval) {
          if (i < results[0].length) {
            const timestamp = new Date(results[0][i].time_period_start)
            const formattedDate = formatDate(timestamp, timeRange)

            combinedData.push({
              date: formattedDate,
              bitcoin: results[0][i].price_close,
              ethereum: results[1][i].price_close,
              ripple: results[2][i].price_close,
              dogecoin: results[3][i].price_close,
            })
          }
        }

        setData(combinedData)
        setUsingMockData(false)
      } catch (err) {
        console.error("Error fetching crypto data:", err)

        // Fall back to mock data
        const mockData = generateMockData(timeRange)
        setData(mockData)
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCryptoData()
  }, [timeRange])

  if (loading) {
    return <div className="h-[300px] w-full flex items-center justify-center">Loading chart data...</div>
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>{usingMockData && <div className="text-sm text-amber-500">Using demo data (API unavailable)</div>}</div>
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              size="sm"
              variant={timeRange === range.value ? "default" : "ghost"}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="mb-2 font-medium">{label}</div>
                      <div className="grid gap-2">
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="capitalize">{entry.name}</span>
                            <span className="font-medium">
                              $
                              {Number(entry.value).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="bitcoin" stroke="#F7931A" strokeWidth={2} dot={false} name="Bitcoin" />
            <Line type="monotone" dataKey="ethereum" stroke="#627EEA" strokeWidth={2} dot={false} name="Ethereum" />
            <Line type="monotone" dataKey="ripple" stroke="#23292F" strokeWidth={2} dot={false} name="Ripple" />
            <Line type="monotone" dataKey="dogecoin" stroke="#C2A633" strokeWidth={2} dot={false} name="Dogecoin" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

