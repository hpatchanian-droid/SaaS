"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Bell, LogOut, Moon, Search, Settings, Sun, User as UserIcon } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "./command-palette";
import { initials } from "@/lib/utils";

export function Topbar({ user }: { user: { id: string; name: string; email: string; image?: string; role: string } }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const load = () =>
      fetch("/api/notifications/unread-count")
        .then((r) => r.json())
        .then((d) => mounted && setUnread(d.count ?? 0))
        .catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
        <button
          onClick={() => setCommandOpen(true)}
          className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          <span>Search anything...</span>
          <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono sm:inline-block">⌘K</kbd>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Link href="/notifications">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-primary">{user.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <UserIcon className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
