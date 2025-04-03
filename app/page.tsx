import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CryptoMetricsCard } from "@/components/crypto-metrics-card"
import { CryptoChart } from "@/components/crypto-chart"
import { CryptoMarketTable } from "@/components/crypto-market-table"
import { MarketNews } from "@/components/market-news"
import { CryptoSearch } from "@/components/crypto-search"
import { ThemeToggle } from "../components/theme-toggle"
import { CurrencySelector } from "@/components/currency-selector"
import { BarChart3, Globe, LayoutDashboard, Newspaper, Settings } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="border-r bg-background/50 backdrop-blur">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-bold">Charles Trade</span>
          </div>
          <div className="px-4 py-4">
            <CryptoSearch />
          </div>
          <nav className="space-y-2 px-2">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Globe className="h-4 w-4" />
              Market
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Newspaper className="h-4 w-4" />
              Market News
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </nav>
        </aside>
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Overview</h1>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <CurrencySelector />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CryptoMetricsCard
              name="Bitcoin"
              symbol="BTC"
              icon="https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
              price="$43,892"
              change={{ value: "+$1,340", percentage: "+3.1%", isPositive: true }}
            />
            <CryptoMetricsCard
              name="Ethereum"
              symbol="ETH"
              icon="https://assets.coingecko.com/coins/images/279/small/ethereum.png"
              price="$2,354"
              change={{ value: "-$120", percentage: "-4.8%", isPositive: false }}
            />
            <CryptoMetricsCard
              name="Ripple"
              symbol="XRP"
              icon="https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png"
              price="$0.58"
              change={{ value: "+$0.03", percentage: "+5.2%", isPositive: true }}
            />
            <CryptoMetricsCard
              name="Dogecoin"
              symbol="DOGE"
              icon="https://assets.coingecko.com/coins/images/5/small/dogecoin.png"
              price="$0.12"
              change={{ value: "+$0.01", percentage: "+9.1%", isPositive: true }}
            />
          </div>
          <Card className="mt-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Price Comparison</h2>
            </div>
            <CryptoChart />
          </Card>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Market Overview</h2>
            <CryptoMarketTable />
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Market News</h2>
            <MarketNews />
          </div>
        </main>
      </div>
    </div>
  )
}

