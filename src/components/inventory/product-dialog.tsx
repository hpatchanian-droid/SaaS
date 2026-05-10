"use client";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: any | null;
  categories: any[];
}

export function ProductDialog({ open, onOpenChange, product, categories }: Props) {
  const isEdit = !!product?.id;
  const [form, setForm] = React.useState<any>({});
  const [loading, setLoading] = React.useState(false);
  const qc = useQueryClient();

  React.useEffect(() => {
    setForm(
      product?.id
        ? {
            name: product.name, sku: product.sku, description: product.description ?? "",
            imageUrl: product.imageUrl ?? "", price: product.price, cost: product.cost,
            stock: product.stock, reorderLevel: product.reorderLevel, unit: product.unit,
            categoryId: product.categoryId ?? "", barcode: product.barcode ?? "",
          }
        : { name: "", sku: "", description: "", imageUrl: "", price: 0, cost: 0, stock: 0, reorderLevel: 5, unit: "pc", categoryId: "", barcode: "" }
    );
  }, [product, open]);

  function set(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.categoryId) delete payload.categoryId;
      const r = isEdit
        ? await fetch(`/api/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      toast.success(isEdit ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["products"] });
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
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update product details and stock levels." : "Add a new product to your inventory."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Name *</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="space-y-2"><Label>SKU</Label><Input value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)} placeholder="Auto-generated if empty" /></div>
          <div className="space-y-2"><Label>Barcode</Label><Input value={form.barcode ?? ""} onChange={(e) => set("barcode", e.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Image URL</Label><Input value={form.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.categoryId || "none"} onValueChange={(v) => set("categoryId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Unit</Label><Input value={form.unit ?? "pc"} onChange={(e) => set("unit", e.target.value)} /></div>
          <div className="space-y-2"><Label>Price *</Label><Input type="number" step="0.01" value={form.price ?? 0} onChange={(e) => set("price", parseFloat(e.target.value))} /></div>
          <div className="space-y-2"><Label>Cost</Label><Input type="number" step="0.01" value={form.cost ?? 0} onChange={(e) => set("cost", parseFloat(e.target.value))} /></div>
          <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock ?? 0} onChange={(e) => set("stock", parseInt(e.target.value))} /></div>
          <div className="space-y-2"><Label>Reorder level</Label><Input type="number" value={form.reorderLevel ?? 5} onChange={(e) => set("reorderLevel", parseInt(e.target.value))} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} loading={loading} variant="gradient">{isEdit ? "Save changes" : "Create product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
