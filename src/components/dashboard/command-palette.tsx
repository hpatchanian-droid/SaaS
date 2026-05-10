"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  BarChart3, Bell, Boxes, Calendar, ClipboardList, Home, LogOut,
  MessageSquare, Plus, Receipt, Settings, Users, Wallet, FolderKanban,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

const items = [
  { label: "Go to Dashboard", icon: Home, href: "/dashboard" },
  { label: "Inventory", icon: Boxes, href: "/inventory" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Tasks", icon: ClipboardList, href: "/tasks" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Team", icon: Users, href: "/employees" },
  { label: "Attendance", icon: Calendar, href: "/attendance" },
  { label: "Invoices", icon: Receipt, href: "/invoices" },
  { label: "Expenses", icon: Wallet, href: "/expenses" },
  { label: "Messages", icon: MessageSquare, href: "/messages" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Settings", icon: Settings, href: "/settings" },
];
const actions = [
  { label: "New product", href: "/inventory?new=1", icon: Plus },
  { label: "New customer", href: "/customers?new=1", icon: Plus },
  { label: "New task", href: "/tasks?new=1", icon: Plus },
  { label: "New invoice", href: "/invoices?new=1", icon: Plus },
];

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const handle = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="mx-auto mt-32 w-full max-w-xl px-4" onClick={(e) => e.stopPropagation()}>
        <Command className="overflow-hidden rounded-xl border bg-popover shadow-2xl">
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full border-b bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results.</Command.Empty>
            <Command.Group heading="Quick actions" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {actions.map((a) => (
                <Command.Item
                  key={a.label}
                  onSelect={() => handle(a.href)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <a.icon className="h-4 w-4" /> {a.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Navigate" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {items.map((i) => (
                <Command.Item
                  key={i.label}
                  onSelect={() => handle(i.href)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <i.icon className="h-4 w-4" /> {i.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Account" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <Command.Item
                onSelect={() => signOut({ callbackUrl: "/" })}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
