"use client";
import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, cn } from "@/lib/utils";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<{ notifications: any[] }>({
    queryKey: ["notifications"], queryFn: () => fetch("/api/notifications").then((r) => r.json()),
  });

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Notifications"
        description={`${unread} unread`}
        actions={unread ? <Button onClick={markAllRead} variant="outline"><CheckCheck className="h-4 w-4" /> Mark all read</Button> : null}
      />

      <Card className="divide-y">
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" className="m-4" />
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              className={cn("flex items-start gap-3 p-4 transition-colors hover:bg-muted/30", !n.read && "bg-primary/5")}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  {!n.read && <Badge variant="default" className="text-[10px]">New</Badge>}
                  <Badge variant="secondary" className="text-[10px]">{n.type}</Badge>
                </div>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
              </div>
            </Link>
          ))
        )}
      </Card>
    </div>
  );
}
