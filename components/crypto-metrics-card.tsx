import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import type React from "react"

interface CryptoMetricsCardProps {
  name: string
  symbol: string
  icon: string
  price: string
  change: {
    value: string
    percentage: string
    isPositive: boolean
  }
  chart?: React.ReactNode
}

export function CryptoMetricsCard({ name, symbol, icon, price, change, chart }: CryptoMetricsCardProps) {
  return (
    <Card className="p-4 bg-background/50 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={icon || "/placeholder.svg"} alt={name} className="h-6 w-6 rounded-full" />
          <h3 className="text-sm font-medium">
            {name} <span className="text-muted-foreground">({symbol})</span>
          </h3>
        </div>
        {chart ? (
          change.isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )
        ) : null}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{price}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm">{change.value}</span>
            <span className={`text-sm ${change.isPositive ? "text-green-500" : "text-red-500"}`}>
              {change.percentage}
            </span>
          </div>
        </div>
        {chart}
      </div>
    </Card>
  )
}

