"use client";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

export function CustomerDialog({ open, onOpenChange, customer }: { open: boolean; onOpenChange: (v: boolean) => void; customer?: any | null }) {
  const isEdit = !!customer?.id;
  const [form, setForm] = React.useState<any>({});
  const [loading, setLoading] = React.useState(false);
  const qc = useQueryClient();

  React.useEffect(() => {
    setForm(
      customer?.id
        ? { ...customer, email: customer.email ?? "", phone: customer.phone ?? "", company: customer.company ?? "", notes: customer.notes ?? "" }
        : { name: "", email: "", phone: "", company: "", address: "", notes: "", status: "NEW", value: 0 }
    );
  }, [customer, open]);

  function set(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setLoading(true);
    try {
      const r = isEdit
        ? await fetch(`/api/customers/${customer.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch(`/api/customers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      toast.success(isEdit ? "Updated" : "Customer added");
      qc.invalidateQueries({ queryKey: ["customers"] });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>{isEdit ? "Edit customer" : "New customer"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Name *</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="space-y-2"><Label>Company</Label><Input value={form.company ?? ""} onChange={(e) => set("company", e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status ?? "NEW"} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Deal value</Label><Input type="number" value={form.value ?? 0} onChange={(e) => set("value", parseFloat(e.target.value))} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="gradient" onClick={submit} loading={loading}>{isEdit ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
