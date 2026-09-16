import "@/styles/globals.css"
import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { CurrencyProvider } from "@/components/currency-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="dark"><CurrencyProvider>{children}</CurrencyProvider></ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
  generator: "charles-trade",
};
