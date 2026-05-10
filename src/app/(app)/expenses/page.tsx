"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ description: "", amount: 0, category: "", date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = React.useState(false);

  const { data, isLoading } = useQuery<{ expenses: any[] }>({
    queryKey: ["expenses"], queryFn: () => fetch("/api/expenses").then((r) => r.json()),
  });

  async function submit() {
    setLoading(true);
    const r = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (r.ok) {
      toast.success("Expense logged");
      setOpen(false);
      setForm({ description: "", amount: 0, category: "", date: new Date().toISOString().slice(0, 10) });
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    } else toast.error("Failed");
  }

  async function del(id: string) {
    if (!confirm("Delete expense?")) return;
    const r = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    }
  }

  const expenses = data?.expenses ?? [];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
    const k = e.category || "Other";
    acc[k] = (acc[k] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Expenses" description="Track operating costs and stay on top of cash outflow."
        actions={<Button variant="gradient" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Log expense</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total expenses</p><p className="mt-1 text-2xl font-bold">{formatCurrency(total)}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">This month</p><p className="mt-1 text-2xl font-bold">{
          formatCurrency(expenses.filter((e) => new Date(e.date).getMonth() === new Date().getMonth() && new Date(e.date).getFullYear() === new Date().getFullYear()).reduce((s, e) => s + e.amount, 0))
        }</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Top category</p><p className="mt-1 text-2xl font-bold">
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"}
        </p></Card>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : expenses.length === 0 ? (
          <EmptyState icon={Wallet} title="No expenses yet" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Log expense</Button>} className="m-4" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Description</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-right">Amount</th><th /></tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{e.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.category || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" onClick={() => del(e.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log an expense</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Description *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Category</Label><Input placeholder="e.g. Marketing, Travel" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={submit} loading={loading} disabled={!form.description || !form.amount}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
