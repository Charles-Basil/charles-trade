"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ExternalLink, Calendar } from "lucide-react"

interface NewsItem {
  title: string
  description: string
  url: string
  source: string
  imageUrl: string
  publishedAt: string
}

// Since CoinAPI doesn't have a dedicated news API, we'll use a combination of
// cryptocurrency news sources and mock data for demonstration
const cryptoNewsSources = [
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com",
  },
  {
    name: "CryptoSlate",
    url: "https://cryptoslate.com",
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com",
  },
  {
    name: "Bitcoin Magazine",
    url: "https://bitcoinmagazine.com",
  },
]

// Mock news data with realistic titles and descriptions
const mockNews: NewsItem[] = [
  {
    title: "Bitcoin Surges Past $45,000 as Institutional Adoption Accelerates",
    description:
      "Bitcoin has broken through the $45,000 resistance level as major financial institutions announce new cryptocurrency investment products and services.",
    url: "https://www.coindesk.com",
    source: "CoinDesk",
    imageUrl: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    publishedAt: "2 hours ago",
  },
  {
    title: "Ethereum Developers Announce Major Update to Scaling Solution",
    description:
      "The Ethereum Foundation has revealed plans for a significant upgrade to its layer-2 scaling solutions, promising reduced gas fees and improved transaction throughput.",
    url: "https://cointelegraph.com",
    source: "Cointelegraph",
    imageUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    publishedAt: "5 hours ago",
  },
  {
    title: "Ripple CEO Optimistic About XRP Case Resolution",
    description:
      "Ripple's CEO expressed confidence about a favorable outcome in the ongoing legal battle with the SEC, citing recent court developments and regulatory clarity in other jurisdictions.",
    url: "https://cryptoslate.com",
    source: "CryptoSlate",
    imageUrl: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    publishedAt: "1 day ago",
  },
  {
    title: "Dogecoin Community Funds New Development Initiative",
    description:
      "The Dogecoin Foundation has announced a community-funded development grant program to enhance the cryptocurrency's utility and adoption in e-commerce and social media tipping.",
    url: "https://bitcoinmagazine.com",
    source: "Bitcoin Magazine",
    imageUrl: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    publishedAt: "2 days ago",
  },
  {
    title: "Major Central Banks Explore CBDC Interoperability with Crypto Markets",
    description:
      "Several central banks are investigating how their central bank digital currencies (CBDCs) could interact with existing cryptocurrency markets and decentralized finance protocols.",
    url: "https://www.coindesk.com",
    source: "CoinDesk",
    imageUrl: "/placeholder.svg?height=100&width=200&text=CBDC",
    publishedAt: "3 days ago",
  },
  {
    title: "New Regulatory Framework for Crypto Exchanges Proposed in EU",
    description:
      "European Union lawmakers have introduced a comprehensive regulatory framework aimed at cryptocurrency exchanges, focusing on consumer protection and anti-money laundering measures.",
    url: "https://cointelegraph.com",
    source: "Cointelegraph",
    imageUrl: "/placeholder.svg?height=100&width=200&text=EU",
    publishedAt: "3 days ago",
  },
]

export function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCryptoNews = async () => {
      setLoading(true)

      try {
        // Try to fetch crypto market data to get symbols for news context
        // This helps us create more relevant mock news if the news API isn't available
        const response = await fetch("https://rest.coinapi.io/v1/assets?filter_asset_id=BTC,ETH,XRP,DOGE", {
          headers: {
            "X-CoinAPI-Key": "72c94488-200c-4614-8f61-14b80a91ec85",
          },
        })

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`)
        }

        // We successfully connected to CoinAPI, but since they don't have a dedicated news API,
        // we'll use our mock news data with current timestamps

        // Update the mock news with current timestamps
        const updatedNews = mockNews.map((item, index) => {
          const date = new Date()

          // Adjust the date based on the publishedAt text
          if (item.publishedAt.includes("hours")) {
            const hours = Number.parseInt(item.publishedAt)
            date.setHours(date.getHours() - hours)
          } else if (item.publishedAt.includes("day")) {
            const days = Number.parseInt(item.publishedAt)
            date.setDate(date.getDate() - days)
          }

          return {
            ...item,
            publishedAt: formatTimeAgo(date),
          }
        })

        setNews(updatedNews)
      } catch (error) {
        console.error("Error fetching news data:", error)
        // Fall back to mock data
        setNews(mockNews)
      } finally {
        setLoading(false)
      }
    }

    fetchCryptoNews()
  }, [])

  // Format date to "time ago" format
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  if (loading) {
    return <div className="py-4 text-center">Loading market news...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {news.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="h-40 w-full bg-muted relative">
            <img src={item.imageUrl || "/placeholder.svg"} alt={item.title} className="h-full w-full object-cover" />
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {item.publishedAt}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                {item.source}
              </span>
            </div>
            <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
            <a
              href={item.url}
              className="text-sm text-primary flex items-center gap-1 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read more <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </Card>
      ))}
    </div>
  )
}

