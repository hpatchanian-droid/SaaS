"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<{ invoice: any }>({
    queryKey: ["invoice", id], queryFn: () => fetch(`/api/invoices/${id}`).then((r) => r.json()),
  });

  async function markPaid() {
    const r = await fetch(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PAID" }) });
    if (r.ok) {
      toast.success("Marked paid");
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    }
  }

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
  const inv = data?.invoice;
  if (!inv) return <div className="p-6">Not found</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 print:hidden">
        <Button asChild variant="ghost" size="icon"><Link href="/invoices"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">{inv.number}</h1>
          <Badge>{inv.status}</Badge>
        </div>
        <div className="ml-auto flex gap-2">
          {inv.status !== "PAID" && <Button variant="gradient" onClick={markPaid}><CheckCircle2 className="h-4 w-4" /> Mark paid</Button>}
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
        </div>
      </div>

      <Card className="p-8 print:border-0 print:shadow-none">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From</p>
            <p className="mt-1 text-lg font-bold">{inv.business?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{inv.number}</p>
            <p className="text-xs text-muted-foreground">Issued {formatDate(inv.issueDate)}</p>
            {inv.dueDate && <p className="text-xs text-muted-foreground">Due {formatDate(inv.dueDate)}</p>}
          </div>
        </div>

        {inv.customer && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bill to</p>
            <p className="mt-1 font-semibold">{inv.customer.company || inv.customer.name}</p>
            {inv.customer.email && <p className="text-sm text-muted-foreground">{inv.customer.email}</p>}
            {inv.customer.address && <p className="text-sm text-muted-foreground">{inv.customer.address}</p>}
          </div>
        )}

        <table className="mt-8 w-full text-sm">
          <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="py-2 text-left">Description</th><th className="text-right">Qty</th><th className="text-right">Unit</th><th className="text-right">Total</th></tr>
          </thead>
          <tbody>
            {inv.items.map((i: any) => (
              <tr key={i.id} className="border-b">
                <td className="py-3">{i.description}</td>
                <td className="text-right">{i.quantity}</td>
                <td className="text-right">{formatCurrency(i.unitPrice)}</td>
                <td className="text-right font-medium">{formatCurrency(i.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(inv.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(inv.tax)}</span></div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span>{formatCurrency(inv.total)}</span></div>
        </div>
        {inv.notes && <p className="mt-8 border-t pt-4 text-sm text-muted-foreground">{inv.notes}</p>}
      </Card>
    </div>
  );
}
