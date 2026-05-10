"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Boxes, AlertTriangle, Pencil, Trash2, MoreHorizontal, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDialog } from "@/components/inventory/product-dialog";
import { StockDialog } from "@/components/inventory/stock-dialog";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const [q, setQ] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [lowStock, setLowStock] = React.useState(false);
  const [dialogProduct, setDialogProduct] = React.useState<any | null>(null);
  const [stockProduct, setStockProduct] = React.useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const qc = useQueryClient();

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useQuery<{ products: any[] }>({
    queryKey: ["products", debounced, lowStock],
    queryFn: () => {
      const url = new URL("/api/products", window.location.origin);
      if (debounced) url.searchParams.set("q", debounced);
      if (lowStock) url.searchParams.set("lowStock", "1");
      return fetch(url).then((r) => r.json());
    },
  });

  const { data: cats } = useQuery<{ categories: any[] }>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
    } else {
      toast.error("Could not delete");
    }
  }

  const products = data?.products ?? [];
  const totalValue = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.reorderLevel).length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Inventory"
        description="Track products, stock movements, and warehouse allocation."
        actions={
          <Button onClick={() => { setDialogProduct(null); setDialogOpen(true); }} variant="gradient">
            <Plus className="h-4 w-4" /> New product
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total products</p><p className="mt-1 text-2xl font-bold">{products.length}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Inventory value</p><p className="mt-1 text-2xl font-bold">{formatCurrency(totalValue)}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Low stock</p><p className="mt-1 text-2xl font-bold text-amber-500">{lowStockCount}</p></Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or SKU..." className="pl-9" />
          </div>
          <Button variant={lowStock ? "default" : "outline"} size="sm" onClick={() => setLowStock((v) => !v)}>
            <AlertTriangle className="h-4 w-4" /> Low stock {lowStockCount ? `(${lowStockCount})` : ""}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No products yet"
            description="Start tracking your inventory by adding your first product."
            action={<Button onClick={() => { setDialogProduct(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Add product</Button>}
            className="m-4"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-muted">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" /> : <Boxes className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category?.name ? <Badge variant="secondary">{p.category.name}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock === 0 ? "font-semibold text-rose-500" : p.stock <= p.reorderLevel ? "font-semibold text-amber-500" : "font-medium"}>
                        {p.stock} {p.unit || "pc"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setStockProduct({ ...p, type: "IN" }); }}>
                            <ArrowDownToLine className="h-4 w-4" /> Stock in
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStockProduct({ ...p, type: "OUT" }); }}>
                            <ArrowUpFromLine className="h-4 w-4" /> Stock out
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setDialogProduct(p); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteProduct(p.id, p.name)} className="text-destructive">
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

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={dialogProduct} categories={cats?.categories ?? []} />
      <StockDialog product={stockProduct} onOpenChange={(o) => !o && setStockProduct(null)} />
    </div>
  );
}
