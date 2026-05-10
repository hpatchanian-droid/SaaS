"use client";
import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip as ReTooltip, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  ArrowDownRight, ArrowUpRight, Boxes, DollarSign, Receipt, Users,
  AlertTriangle, Sparkles, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { AiInsight } from "@/components/dashboard/ai-insight";

interface DashboardData {
  stats: {
    revenueThisMonth: number; expensesThisMonth: number; outstanding: number; outstandingCount: number;
    products: number; lowStock: number; customers: number; employees: number;
  };
  series: { month: string; revenue: number; expenses: number }[];
  recentInvoices: any[];
  tasksByStatus: { status: string; _count: number }[];
  topProducts: { name: string; revenue: number; quantity: number }[];
}

const TASK_COLORS: Record<string, string> = {
  TODO: "#94a3b8", IN_PROGRESS: "#6366f1", REVIEW: "#f59e0b", DONE: "#10b981",
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/dashboard").then((r) => r.json()),
    refetchInterval: 30000,
  });

  const profit = (data?.stats.revenueThisMonth ?? 0) - (data?.stats.expensesThisMonth ?? 0);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Dashboard"
        description="Live overview of your business operations."
        actions={
          <>
            <Button asChild variant="outline" size="sm"><Link href="/analytics">View analytics</Link></Button>
            <Button asChild size="sm" variant="gradient"><Link href="/invoices?new=1">New invoice</Link></Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          loading={isLoading}
          icon={<DollarSign className="h-4 w-4" />}
          label="Revenue (this month)"
          value={formatCurrency(data?.stats.revenueThisMonth ?? 0)}
          delta={profit >= 0 ? `${formatCurrency(profit)} profit` : `${formatCurrency(profit)} loss`}
          positive={profit >= 0}
        />
        <Kpi
          loading={isLoading}
          icon={<Receipt className="h-4 w-4" />}
          label="Outstanding"
          value={formatCurrency(data?.stats.outstanding ?? 0)}
          delta={`${data?.stats.outstandingCount ?? 0} open invoices`}
          positive={false}
          neutral
        />
        <Kpi
          loading={isLoading}
          icon={<Users className="h-4 w-4" />}
          label="Customers"
          value={formatNumber(data?.stats.customers ?? 0)}
          delta={`${data?.stats.employees ?? 0} team members`}
          neutral
        />
        <Kpi
          loading={isLoading}
          icon={<Boxes className="h-4 w-4" />}
          label="Inventory"
          value={formatNumber(data?.stats.products ?? 0)}
          delta={data?.stats.lowStock ? `${data.stats.lowStock} low-stock` : "All stocked"}
          positive={!data?.stats.lowStock}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data?.series}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <ReTooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: any) => formatCurrency(Number(v))}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#rev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#exp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.tasksByStatus.map((t) => ({ name: t.status.replace("_", " "), value: t._count, color: TASK_COLORS[t.status] }))}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {data?.tasksByStatus.map((t) => (
                      <Cell key={t.status} fill={TASK_COLORS[t.status]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top selling products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : data?.topProducts.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.topProducts} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={140} />
                  <ReTooltip formatter={(v: any) => formatCurrency(Number(v))} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No sales yet — create your first invoice.</p>
            )}
          </CardContent>
        </Card>

        <AiInsight />
      </div>

      {/* Recent invoices */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent invoices</CardTitle>
          <Button asChild variant="ghost" size="sm"><Link href="/invoices">View all <ArrowRight className="h-4 w-4" /></Link></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : data?.recentInvoices.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 text-left">Invoice</th><th className="text-left">Customer</th><th className="text-right">Total</th><th className="text-right">Status</th></tr>
                </thead>
                <tbody>
                  {data.recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="border-t">
                      <td className="py-3 font-mono text-xs">{inv.number}</td>
                      <td>{inv.customer?.company || inv.customer?.name || "—"}</td>
                      <td className="text-right font-medium">{formatCurrency(inv.total)}</td>
                      <td className="text-right"><InvoiceStatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No invoices yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ loading, icon, label, value, delta, positive, neutral }: { loading?: boolean; icon: React.ReactNode; label: string; value: string; delta: string; positive?: boolean; neutral?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
          </div>
          {loading ? <Skeleton className="mt-3 h-8 w-32" /> : <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>}
          <div className="mt-2 flex items-center gap-1 text-xs">
            {!neutral && (positive ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-rose-500" />)}
            <span className={neutral ? "text-muted-foreground" : positive ? "text-emerald-500" : "text-rose-500"}>{delta}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    PAID: "success", SENT: "default", OVERDUE: "destructive", DRAFT: "secondary", VOID: "secondary",
  };
  return <Badge variant={map[status] || "secondary"}>{status}</Badge>;
}
