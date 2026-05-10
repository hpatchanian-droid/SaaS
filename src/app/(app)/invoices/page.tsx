"use client";
import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, MoreHorizontal, Trash2, CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceDialog } from "@/components/invoices/invoice-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<string, any> = {
  DRAFT: "secondary", SENT: "default", PAID: "success", OVERDUE: "destructive", VOID: "secondary",
};

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { data, isLoading } = useQuery<{ invoices: any[] }>({
    queryKey: ["invoices"], queryFn: () => fetch("/api/invoices").then((r) => r.json()),
  });

  async function markPaid(id: string) {
    const r = await fetch(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PAID" }) });
    if (r.ok) {
      toast.success("Invoice marked paid");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    }
  }
  async function del(id: string) {
    if (!confirm("Delete this invoice?")) return;
    const r = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["invoices"] });
    }
  }

  const invoices = data?.invoices ?? [];
  const outstanding = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").reduce((s, i) => s + i.total, 0);
  const paid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Invoices"
        description="Send invoices, track payments, and stay on top of cash flow."
        actions={<Button variant="gradient" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New invoice</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total invoices</p><p className="mt-1 text-2xl font-bold">{invoices.length}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Outstanding</p><p className="mt-1 text-2xl font-bold text-amber-500">{formatCurrency(outstanding)}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Paid</p><p className="mt-1 text-2xl font-bold text-emerald-500">{formatCurrency(paid)}</p></Card>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices yet" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create invoice</Button>} className="m-4" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Issue</th>
                  <th className="px-4 py-3 text-left">Due</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3"><Link href={`/invoices/${i.id}`} className="font-mono text-xs hover:underline">{i.number}</Link></td>
                    <td className="px-4 py-3">{i.customer?.company || i.customer?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(i.issueDate)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{i.dueDate ? formatDate(i.dueDate) : "—"}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[i.status]}>{i.status}</Badge></td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(i.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/invoices/${i.id}`}><Eye className="h-4 w-4" /> View</Link></DropdownMenuItem>
                          {i.status !== "PAID" && <DropdownMenuItem onClick={() => markPaid(i.id)}><CheckCircle2 className="h-4 w-4" /> Mark paid</DropdownMenuItem>}
                          <DropdownMenuItem className="text-destructive" onClick={() => del(i.id)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
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

      <InvoiceDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
