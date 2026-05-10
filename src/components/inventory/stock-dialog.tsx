"use client";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StockDialog({ product, onOpenChange }: { product: any | null; onOpenChange: (v: boolean) => void }) {
  const [qty, setQty] = React.useState<number>(1);
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const qc = useQueryClient();

  React.useEffect(() => {
    if (product) {
      setQty(1);
      setNote("");
    }
  }, [product]);

  async function submit() {
    if (!product) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/products/${product.id}/stock`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: product.type, quantity: qty, note }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      toast.success(`Stock ${product.type === "IN" ? "added" : product.type === "OUT" ? "removed" : "adjusted"}`);
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
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {product?.type === "IN" ? "Stock in" : product?.type === "OUT" ? "Stock out" : "Adjust stock"} — {product?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Current stock: <span className="font-semibold text-foreground">{product?.stock} {product?.unit || "pc"}</span></p>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason or PO reference..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} loading={loading} variant="gradient">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
