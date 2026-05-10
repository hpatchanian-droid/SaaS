"use client";
import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, MoreHorizontal, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { formatCurrency } from "@/lib/utils";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];
const STATUS_VARIANT: Record<string, any> = {
  NEW: "secondary", CONTACTED: "default", QUALIFIED: "default",
  PROPOSAL: "warning", WON: "success", LOST: "destructive",
};

export default function CustomersPage() {
  const [q, setQ] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [dialogCustomer, setDialogCustomer] = React.useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const qc = useQueryClient();

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useQuery<{ customers: any[] }>({
    queryKey: ["customers", debounced, status],
    queryFn: () => {
      const url = new URL("/api/customers", window.location.origin);
      if (debounced) url.searchParams.set("q", debounced);
      if (status) url.searchParams.set("status", status);
      return fetch(url).then((r) => r.json());
    },
  });

  async function deleteCustomer(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    const r = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Customer deleted");
      qc.invalidateQueries({ queryKey: ["customers"] });
    }
  }

  const customers = data?.customers ?? [];
  const totalValue = customers.reduce((s, c) => s + c.value, 0);
  const won = customers.filter((c) => c.status === "WON").length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Customers"
        description="Track leads, manage your pipeline, and grow relationships."
        actions={
          <Button onClick={() => { setDialogCustomer(null); setDialogOpen(true); }} variant="gradient">
            <Plus className="h-4 w-4" /> New customer
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total customers</p><p className="mt-1 text-2xl font-bold">{customers.length}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Pipeline value</p><p className="mt-1 text-2xl font-bold">{formatCurrency(totalValue)}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Closed won</p><p className="mt-1 text-2xl font-bold text-emerald-500">{won}</p></Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers..." className="pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant={status === null ? "default" : "outline"} onClick={() => setStatus(null)}>All</Button>
            {STATUSES.map((s) => (
              <Button key={s} size="sm" variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>{s}</Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : customers.length === 0 ? (
          <EmptyState icon={Users} title="No customers yet" description="Add your first customer to start tracking your pipeline." action={
            <Button onClick={() => { setDialogCustomer(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Add customer</Button>
          } className="m-4" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c: any) => (
                  <tr key={c.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/customers/${c.id}`} className="block">
                        <div className="font-medium">{c.name}</div>
                        {c.company && <div className="text-xs text-muted-foreground">{c.company}</div>}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {c.email && <div className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" /> {c.email}</div>}
                      {c.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {c.phone}</div>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[c.status] || "secondary"}>{c.status}</Badge></td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(c.value)}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setDialogCustomer(c); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteCustomer(c.id, c.name)}>
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CustomerDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={dialogCustomer} />
    </div>
  );
}
