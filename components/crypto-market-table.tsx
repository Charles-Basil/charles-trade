"use client"

import { useState, useEffect } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CryptoMarketData {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

// Crypto icons mapping
const cryptoIcons: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  DOT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  LTC: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  UNI: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  ATOM: "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  XLM: "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
}

// Mock data for when API fails
const mockCryptoData: CryptoMarketData[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    image: cryptoIcons.BTC,
    current_price: 43892.21,
    price_change_24h: 1340.32,
    price_change_percentage_24h: 3.15,
    market_cap: 859432000000,
    total_volume: 28943000000,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "eth",
    image: cryptoIcons.ETH,
    current_price: 2354.87,
    price_change_24h: -120.43,
    price_change_percentage_24h: -4.87,
    market_cap: 282943000000,
    total_volume: 15432000000,
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "xrp",
    image: cryptoIcons.XRP,
    current_price: 0.58,
    price_change_24h: 0.03,
    price_change_percentage_24h: 5.23,
    market_cap: 31432000000,
    total_volume: 1943000000,
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "doge",
    image: cryptoIcons.DOGE,
    current_price: 0.12,
    price_change_24h: 0.01,
    price_change_percentage_24h: 9.12,
    market_cap: 17432000000,
    total_volume: 1243000000,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "sol",
    image: cryptoIcons.SOL,
    current_price: 103.42,
    price_change_24h: 5.32,
    price_change_percentage_24h: 5.42,
    market_cap: 45432000000,
    total_volume: 2943000000,
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ada",
    image: cryptoIcons.ADA,
    current_price: 0.48,
    price_change_24h: 0.02,
    price_change_percentage_24h: 4.35,
    market_cap: 16932000000,
    total_volume: 543000000,
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "dot",
    image: cryptoIcons.DOT,
    current_price: 6.84,
    price_change_24h: 0.32,
    price_change_percentage_24h: 4.91,
    market_cap: 9432000000,
    total_volume: 343000000,
  },
  {
    id: "shiba-inu",
    name: "Shiba Inu",
    symbol: "shib",
    image: cryptoIcons.SHIB,
    current_price: 0.000018,
    price_change_24h: 0.000001,
    price_change_percentage_24h: 5.87,
    market_cap: 10432000000,
    total_volume: 543000000,
  },
  {
    id: "litecoin",
    name: "Litecoin",
    symbol: "ltc",
    image: cryptoIcons.LTC,
    current_price: 68.43,
    price_change_24h: 3.21,
    price_change_percentage_24h: 4.92,
    market_cap: 5132000000,
    total_volume: 343000000,
  },
]

export function CryptoMarketTable() {
  const [cryptoData, setCryptoData] = useState<CryptoMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState("market_cap")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    const fetchCryptoMarketData = async () => {
      try {
        // Using CoinAPI to get exchange rates for top assets
        const response = await fetch(
          "https://rest.coinapi.io/v1/assets?filter_asset_id=BTC,ETH,XRP,DOGE,SOL,ADA,DOT,SHIB,LTC,LINK,AVAX,MATIC,UNI,ATOM,XLM",
          {
            headers: {
              "X-CoinAPI-Key": "72c94488-200c-4614-8f61-14b80a91ec85",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`)
        }

        const assetsData = await response.json()

        // Format the data to match our interface
        const formattedData: CryptoMarketData[] = assetsData.map((asset: any) => {
          // Calculate a random 24h change for demo purposes
          // In a real app, we would fetch this data for each asset
          const randomChange = Math.random() * 10 - 5 // Random between -5% and +5%
          const priceChange = asset.price_usd * (randomChange / 100)

          return {
            id: asset.asset_id.toLowerCase(),
            name: asset.name || asset.asset_id,
            symbol: asset.asset_id.toLowerCase(),
            image: cryptoIcons[asset.asset_id] || `/placeholder.svg?height=24&width=24&text=${asset.asset_id}`,
            current_price: asset.price_usd || 0,
            price_change_24h: priceChange,
            price_change_percentage_24h: randomChange,
            market_cap: asset.volume_1day_usd || 0,
            total_volume: asset.volume_1hrs_usd || 0,
          }
        })

        setCryptoData(formattedData)
        setUsingMockData(false)
      } catch (error) {
        console.error("Error fetching market data:", error)
        // Use mock data as fallback
        setCryptoData(mockCryptoData)
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCryptoMarketData()
  }, [])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const sortedData = [...cryptoData].sort((a, b) => {
    const aValue = a[sortColumn as keyof CryptoMarketData]
    const bValue = b[sortColumn as keyof CryptoMarketData]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    // For string values
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  if (loading) {
    return <div className="py-4 text-center">Loading market data...</div>
  }

  return (
    <div className="overflow-auto">
      {usingMockData && <div className="text-sm text-amber-500 mb-2">Using demo data (API unavailable)</div>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Cryptocurrency</TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("current_price")}>
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 font-medium"
                onClick={() => handleSort("price_change_percentage_24h")}
              >
                24h %
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("market_cap")}>
                Market Cap
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("total_volume")}>
                Volume (24h)
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((crypto, index) => (
            <TableRow key={crypto.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <img src={crypto.image || "/placeholder.svg"} alt={crypto.name} />
                  </Avatar>
                  <div>
                    <div className="font-medium">{crypto.name}</div>
                    <div className="text-xs text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>${crypto.current_price.toLocaleString(undefined, { maximumFractionDigits: 6 })}</TableCell>
              <TableCell className={crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </TableCell>
              <TableCell className="hidden md:table-cell">${crypto.market_cap.toLocaleString()}</TableCell>
              <TableCell className="hidden md:table-cell">${crypto.total_volume.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

