"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { currencies, useCurrency } from "@/components/currency-provider"

export function CurrencySelector() {
  const { currency: selectedCurrency, setCurrency } = useCurrency()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1 px-2 sm:gap-2 sm:px-3">
          {selectedCurrency.symbol} {selectedCurrency.code}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            className="cursor-pointer"
            onClick={() => setCurrency(currency)}
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

