"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AiInsight() {
  const { data, isLoading, refetch, isFetching } = useQuery<{ insights: string[] }>({
    queryKey: ["ai-insight"],
    queryFn: () => fetch("/api/ai/insights").then((r) => r.json()),
    staleTime: 60_000,
  });

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-purple-500/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.18),transparent_50%)]" />
      <CardHeader className="relative flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" /> AI Insights
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh insights">
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </>
        ) : data?.insights.length ? (
          data.insights.map((insight, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-card/60 p-3 text-sm backdrop-blur">
              {insight}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No insights yet — keep using the platform!</p>
        )}
      </CardContent>
    </Card>
  );
}
