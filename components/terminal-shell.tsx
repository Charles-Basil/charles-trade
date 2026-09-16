"use client";

import { useState } from "react";
import { Activity, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoSearch } from "@/components/crypto-search";
import { CurrencySelector } from "@/components/currency-selector";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function TerminalShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur-2xl">
          <div className="mx-auto flex h-[72px] max-w-[1480px] items-center gap-4 px-4 sm:px-6 lg:px-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden min-w-[190px] items-center gap-3 lg:flex">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-base font-semibold tracking-tight">Charles Trade</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Market intelligence</p>
              </div>
            </div>
            <div className="min-w-0 flex-1 sm:max-w-lg md:ml-4 lg:ml-6"><CryptoSearch /></div>
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
              <ThemeToggle />
              <CurrencySelector />
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
