"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6", "#a855f7"];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["analytics"], queryFn: () => fetch("/api/analytics").then((r) => r.json()),
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Analytics" description="Live business performance insights." />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Inventory value (cost)", value: data && formatCurrency(data.summary.inventoryValue) },
          { label: "Inventory value (retail)", value: data && formatCurrency(data.summary.inventoryRetail) },
          { label: "Avg invoice", value: data && formatCurrency(data.summary.avgInvoice) },
          { label: "Pipeline value", value: data && formatCurrency(data.summary.pipelineValue) },
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            {isLoading ? <Skeleton className="mt-2 h-8 w-32" /> : <p className="mt-1 text-2xl font-bold">{k.value}</p>}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profit trend</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-72 w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: any) => formatCurrency(Number(v))} />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue vs expenses</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-72 w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: any) => formatCurrency(Number(v))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customers by stage</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-72 w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data?.customerStatus} dataKey="count" nameKey="status" innerRadius={50} outerRadius={100} paddingAngle={3}>
                    {data?.customerStatus?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Expense breakdown</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-72 w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.expenseBreakdown} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="amount" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
