"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building, Mail, MessageSquarePlus, Phone, MapPin, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = React.useState(false);
  const [note, setNote] = React.useState("");

  const { data, isLoading } = useQuery<{ customer: any }>({
    queryKey: ["customer", id],
    queryFn: () => fetch(`/api/customers/${id}`).then((r) => r.json()),
  });

  async function addNote() {
    if (!note.trim()) return;
    const r = await fetch(`/api/customers/${id}/activities`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "NOTE", content: note }),
    });
    if (r.ok) {
      setNote("");
      toast.success("Note added");
      qc.invalidateQueries({ queryKey: ["customer", id] });
    }
  }

  if (isLoading) return <div className="p-6"><Skeleton className="h-32 w-full" /></div>;
  const c = data?.customer;
  if (!c) return <div className="p-6">Not found</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/customers")}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">{c.name}</h1>
          <p className="text-sm text-muted-foreground">{c.company}</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /> Edit</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="space-y-3 p-6">
            <Badge>{c.status}</Badge>
            <p className="text-2xl font-bold">{formatCurrency(c.value)}</p>
            <div className="space-y-1.5 text-sm">
              {c.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {c.email}</div>}
              {c.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {c.phone}</div>}
              {c.company && <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /> {c.company}</div>}
              {c.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {c.address}</div>}
            </div>
            {c.notes && <p className="border-t pt-3 text-sm text-muted-foreground">{c.notes}</p>}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquarePlus className="h-4 w-4" /> Add a note</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log a call, email, or note..." />
              <Button onClick={addNote} disabled={!note.trim()}>Add note</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
            <CardContent>
              {c.activities?.length ? (
                <ul className="space-y-3">
                  {c.activities.map((a: any) => (
                    <li key={a.id} className="rounded-lg border p-3 text-sm">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{a.type}</span><span>{formatRelativeTime(a.createdAt)}</span>
                      </div>
                      <p>{a.content}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </CardContent>
          </Card>

          {c.invoices?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground"><tr><th className="py-2 text-left">Number</th><th className="text-left">Status</th><th className="text-right">Total</th></tr></thead>
                  <tbody>
                    {c.invoices.map((i: any) => (
                      <tr key={i.id} className="border-t">
                        <td className="py-2 font-mono text-xs"><Link href={`/invoices/${i.id}`} className="hover:underline">{i.number}</Link></td>
                        <td><Badge>{i.status}</Badge></td>
                        <td className="text-right">{formatCurrency(i.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CustomerDialog open={editOpen} onOpenChange={setEditOpen} customer={c} />
    </div>
  );
}
