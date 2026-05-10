"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { initials, formatDate } from "@/lib/utils";

export default function AttendancePage() {
  const qc = useQueryClient();
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data, isLoading } = useQuery<{ records: any[]; open: any | null }>({
    queryKey: ["attendance"], queryFn: () => fetch("/api/attendance?days=30").then((r) => r.json()),
    refetchInterval: 30000,
  });

  async function clock() {
    const r = await fetch("/api/attendance/clock", { method: "POST" });
    if (r.ok) {
      const d = await r.json();
      toast.success(d.action === "in" ? "Clocked in!" : "Clocked out!");
      qc.invalidateQueries({ queryKey: ["attendance"] });
    } else toast.error("Failed");
  }

  const open = data?.open;
  const elapsed = open && now
    ? Math.floor((now.getTime() - new Date(open.clockIn).getTime()) / 1000)
    : 0;
  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;

  const records = data?.records ?? [];
  const totalHours = records.reduce((s, r) => s + (r.hours ?? 0), 0);
  const lateCount = records.filter((r) => r.status === "LATE").length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Attendance" description="Clock in/out and review your time tracking history." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Time tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 text-center">
              <p className="text-3xl font-bold tabular-nums">{open ? fmt(elapsed) : "Not clocked in"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {open ? `Started ${new Date(open.clockIn).toLocaleTimeString()}` : "Press start to begin tracking"}
              </p>
            </div>
            <Button className="w-full" variant={open ? "destructive" : "gradient"} onClick={clock}>
              {open ? <><Square className="h-4 w-4" /> Clock out</> : <><Play className="h-4 w-4" /> Clock in</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Stats (last 30 days)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-xs text-muted-foreground">Sessions</p><p className="mt-1 text-2xl font-bold">{records.length}</p></div>
              <div><p className="text-xs text-muted-foreground">Hours logged</p><p className="mt-1 text-2xl font-bold">{totalHours.toFixed(1)}</p></div>
              <div><p className="text-xs text-muted-foreground">Late arrivals</p><p className="mt-1 text-2xl font-bold text-amber-500">{lateCount}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent attendance</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No records yet — clock in to begin.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 text-left">Member</th><th className="text-left">Date</th><th className="text-left">In</th><th className="text-left">Out</th><th className="text-right">Hours</th><th className="text-right">Status</th></tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6"><AvatarImage src={r.user.avatar} /><AvatarFallback>{initials(r.user.name)}</AvatarFallback></Avatar>
                          <span>{r.user.name}</span>
                        </div>
                      </td>
                      <td>{formatDate(r.clockIn)}</td>
                      <td>{new Date(r.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td>{r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : <span className="text-emerald-500">Active</span>}</td>
                      <td className="text-right">{r.hours?.toFixed(2) ?? "—"}</td>
                      <td className="text-right"><Badge variant={r.status === "LATE" ? "warning" : r.status === "ABSENT" ? "destructive" : "success"}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
