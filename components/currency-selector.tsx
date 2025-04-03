"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Currency {
  code: string
  name: string
  symbol: string
}

const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ" },
  { code: "XRP", name: "Ripple", symbol: "XRP" },
  { code: "DOGE", name: "Dogecoin", symbol: "Ð" },
]

export function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {selectedCurrency.symbol} {selectedCurrency.code}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            className="cursor-pointer"
            onClick={() => setSelectedCurrency(currency)}
          >
            <div className="flex items-center justify-between w-full">
              <span>{currency.name}</span>
              <span className="text-muted-foreground">
                {currency.symbol} {currency.code}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

