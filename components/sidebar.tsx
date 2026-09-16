"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, User, Settings, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySelector } from "@/components/currency-selector";
import { CryptoSearch } from "@/components/crypto-search";
import { SidebarMarketBrief } from "@/components/sidebar-market-brief";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: "LayoutDashboard", href: "/" },
  { label: "Markets", icon: "Globe", href: "/markets" },
  { label: "Portfolio", icon: "PieChart", href: "/portfolio" },
  { label: "Trading", icon: "Zap", href: "/trading" },
  { label: "Analytics", icon: "BarChart3", href: "/analytics" },
];

const bottomItems = [
  { label: "Settings", icon: "Settings", href: "#" },
  { label: "Security", icon: "Shield", href: "#" },
  { label: "Notifications", icon: "Bell", href: "#" },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Globe: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  PieChart: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2"/><path d="M12 2v10h10"/></svg>,
  Zap: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  BookOpen: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  BarChart3: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Settings: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Shield: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Bell: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <TooltipProvider>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/50",
            isOpen ? "translate-x-0 w-64 lg:w-64" : "-translate-x-full lg:translate-x-0 lg:w-64",
            collapsed && "w-20 lg:w-20"
          )}
          style={{ boxShadow: "inset -1px 0 0 hsl(var(--sidebar-border)/0.5)" }}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-20 items-center justify-between gap-3 border-b border-sidebar-border/50 px-4">
              {!collapsed && (
                <div className="flex items-center gap-3">
                  <div className="relative grid h-9 w-9 place-items-center rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-chart-4 animate-pulse-glow" />
                    <svg className="relative h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </div>
                  <span className="font-display text-lg font-semibold tracking-tight">Charles Trade</span>
                </div>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl h-9 w-9 transition-all"
                      onClick={() => setCollapsed(!collapsed)}
                      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                      {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {!collapsed && (
                <>
                  <div className="mb-4"><CryptoSearch /></div>
                  <Separator className="my-3 border-sidebar-border/50" />
                  <SidebarMarketBrief />
                </>
              )}

              <nav className="space-y-1" aria-label="Main navigation">
                {navItems.map(({ label, icon: IconName, href }) => {
                  const Icon = iconMap[IconName];
                  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <TooltipProvider key={label}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={href}
                            onClick={onClose}
                            className={cn(
                              "sidebar-item w-full",
                              isActive ? "sidebar-item-active" : "sidebar-item-inactive",
                              collapsed && "justify-center px-0"
                            )}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            {!collapsed && <span className="truncate">{label}</span>}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-sidebar-border/50 p-3 space-y-1">
              {!collapsed && (
                <>
                  <Separator className="my-2 border-sidebar-border/50" />
                  <nav className="space-y-1" aria-label="Account">
                    {bottomItems.map(({ label, icon: IconName }) => {
                      const Icon = iconMap[IconName];
                      return (
                        <TooltipProvider key={label}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className={cn("sidebar-item w-full sidebar-item-inactive", collapsed && "justify-center px-0")}>
                                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                {!collapsed && <span className="truncate">{label}</span>}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </nav>
                </>
              )}

              <div className="pt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={cn("sidebar-item w-full sidebar-item-inactive", collapsed && "justify-center px-0")}>
                            <User className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            {!collapsed && <span className="truncate">Charles</span>}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 surface-panel-elevated">
                          <div className="px-4 py-3 border-b border-border/50">
                            <p className="font-medium text-sm">Charles</p>
                            <p className="text-xs text-muted-foreground">charles@trade.com</p>
                          </div>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2 text-destructive" onClick={onClose}>
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">Account</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </aside>
      </TooltipProvider>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function Separator({ className }: { className?: string }) {
  return <hr className={cn("border-border", className)} />;
}