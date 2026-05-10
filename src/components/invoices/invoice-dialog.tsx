"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

const STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE"];

export function InvoiceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const { data: customersData } = useQuery<{ customers: any[] }>({
    queryKey: ["customers-list"], queryFn: () => fetch("/api/customers").then((r) => r.json()), enabled: open,
  });
  const [form, setForm] = React.useState<any>({
    customerId: "", status: "DRAFT", dueDate: "", taxRate: 10, notes: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setForm({
        customerId: "", status: "DRAFT", dueDate: due.toISOString().slice(0, 10), taxRate: 10, notes: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
      });
    }
  }, [open]);

  function setItem(idx: number, k: string, v: any) {
    const items = [...form.items];
    items[idx] = { ...items[idx], [k]: v };
    setForm({ ...form, items });
  }
  function addItem() { setForm({ ...form, items: [...form.items, { description: "", quantity: 1, unitPrice: 0 }] }); }
  function rmItem(idx: number) { setForm({ ...form, items: form.items.filter((_: any, i: number) => i !== idx) }); }

  const subtotal = form.items.reduce((s: number, i: any) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
  const tax = subtotal * (form.taxRate / 100);
  const total = subtotal + tax;

  async function submit() {
    setLoading(true);
    try {
      const payload = { ...form, customerId: form.customerId || null };
      const r = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      toast.success("Invoice created");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label>Customer</Label>
              <Select value={form.customerId || "none"} onValueChange={(v) => setForm({ ...form, customerId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No customer</SelectItem>
                  {customersData?.customers?.map((c) => <SelectItem key={c.id} value={c.id}>{c.company || c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tax rate %</Label><Input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} /></div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Line items</Label>
              <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3.5 w-3.5" /> Add line</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((it: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <Input className="col-span-6" placeholder="Description" value={it.description} onChange={(e) => setItem(idx, "description", e.target.value)} />
                  <Input className="col-span-2" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setItem(idx, "quantity", parseFloat(e.target.value) || 0)} />
                  <Input className="col-span-3" type="number" step="0.01" placeholder="Unit price" value={it.unitPrice} onChange={(e) => setItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} />
                  <Button variant="ghost" size="icon" className="col-span-1" onClick={() => rmItem(idx)} disabled={form.items.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

          <div className="space-y-1 rounded-lg border p-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax ({form.taxRate}%)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="gradient" onClick={submit} loading={loading} disabled={!form.items[0]?.description}>Create invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
