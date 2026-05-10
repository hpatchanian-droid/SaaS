"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Boxes, Calendar, ClipboardList, FolderKanban, Home,
  MessageSquare, Receipt, Settings, Sparkles, Users, Wallet, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/employees", label: "Team", icon: Users },
  { href: "/attendance", label: "Attendance", icon: Calendar },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card/40 backdrop-blur lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{businessName}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">LVL Ops</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <ul className="space-y-0.5">
          {nav.map((n) => {
            const active = pathname === n.href || (n.href !== "/dashboard" && pathname?.startsWith(n.href));
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t p-3">
        <div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Upgrade to Pro
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Unlock AI insights & unlimited seats.</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/inventory", label: "Stock", icon: Boxes },
    { href: "/tasks", label: "Tasks", icon: ClipboardList },
    { href: "/messages", label: "Chat", icon: MessageSquare },
    { href: "/settings", label: "More", icon: Settings },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-background/90 backdrop-blur lg:hidden">
      {items.map((n) => {
        const active = pathname === n.href || (n.href !== "/dashboard" && pathname?.startsWith(n.href));
        return (
          <Link key={n.href} href={n.href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
            <n.icon className="h-5 w-5" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
