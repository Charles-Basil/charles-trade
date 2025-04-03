"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useDebounce } from "@/hooks/use-debounce"

interface Cryptocurrency {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_percentage_24h: number
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

// Mock data for search when API fails
const mockSearchResults: Cryptocurrency[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    image: cryptoIcons.BTC,
    current_price: 43892.21,
    price_change_percentage_24h: 3.15,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "eth",
    image: cryptoIcons.ETH,
    current_price: 2354.87,
    price_change_percentage_24h: -4.87,
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "xrp",
    image: cryptoIcons.XRP,
    current_price: 0.58,
    price_change_percentage_24h: 5.23,
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "doge",
    image: cryptoIcons.DOGE,
    current_price: 0.12,
    price_change_percentage_24h: 9.12,
  },
]

export function CryptoSearch() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Cryptocurrency[]>([])
  const [loading, setLoading] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setResults([])
      return
    }

    const fetchCryptos = async () => {
      setLoading(true)
      try {
        // Using CoinAPI to search for assets
        const response = await fetch(
          `https://rest.coinapi.io/v1/assets?filter_asset_id=${debouncedSearchTerm.toUpperCase()}`,
          {
            headers: {
              "X-CoinAPI-Key": "72c94488-200c-4614-8f61-14b80a91ec85",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`)
        }

        const data = await response.json()

        // Format the results
        const formattedResults = data
          .map((asset: any) => {
            // Generate a random 24h change for demo purposes
            const randomChange = Math.random() * 10 - 5 // Random between -5% and +5%

            return {
              id: asset.asset_id.toLowerCase(),
              name: asset.name || asset.asset_id,
              symbol: asset.asset_id.toLowerCase(),
              image: cryptoIcons[asset.asset_id] || `/placeholder.svg?height=24&width=24&text=${asset.asset_id}`,
              current_price: asset.price_usd || 0,
              price_change_percentage_24h: randomChange,
            }
          })
          .slice(0, 5) // Limit to 5 results

        setResults(formattedResults)
        setUsingMockData(false)
      } catch (error) {
        console.error("Error fetching search data:", error)

        // Filter mock data based on search term
        const filteredResults = mockSearchResults.filter(
          (crypto) =>
            crypto.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        )
        setResults(filteredResults)
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCryptos()
  }, [debouncedSearchTerm])

  return (
    <>
      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cryptocurrencies... (Ctrl+K)"
          className="pl-8 bg-background/50"
          onClick={() => setOpen(true)}
        />
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for any cryptocurrency..." value={searchTerm} onValueChange={setSearchTerm} />
        <CommandList>
          {usingMockData && searchTerm && (
            <div className="px-3 py-2 text-xs text-amber-500">Using demo data (API unavailable)</div>
          )}
          <CommandEmpty>{loading ? "Loading..." : "No cryptocurrencies found."}</CommandEmpty>
          <CommandGroup heading="Cryptocurrencies">
            {results.map((crypto) => (
              <CommandItem
                key={crypto.id}
                onSelect={() => {
                  // In a real app, this would navigate to the crypto detail page
                  console.log(`Selected ${crypto.name}`)
                  setOpen(false)
                }}
              >
                <div className="flex items-center gap-2">
                  <img src={crypto.image || "/placeholder.svg"} alt={crypto.name} className="h-6 w-6 rounded-full" />
                  <span>{crypto.name}</span>
                  <span className="text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
                  <span className={crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

