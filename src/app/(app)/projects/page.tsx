"use client";
import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", description: "", color: "#6366f1" });
  const [loading, setLoading] = React.useState(false);

  const { data, isLoading } = useQuery<{ projects: any[] }>({
    queryKey: ["projects"], queryFn: () => fetch("/api/projects").then((r) => r.json()),
  });

  async function submit() {
    setLoading(true);
    const r = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (r.ok) {
      toast.success("Project created");
      setOpen(false);
      setForm({ name: "", description: "", color: "#6366f1" });
      qc.invalidateQueries({ queryKey: ["projects"] });
    } else toast.error("Failed");
  }

  const projects = data?.projects ?? [];
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Projects" description="Group tasks by initiative."
        actions={<Button variant="gradient" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New project</Button>}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create a project to organize tasks together." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New project</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/tasks?projectId=${p.id}`}>
              <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-3 inline-block rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: `${p.color}20`, color: p.color }}>
                    {p.status}
                  </div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                  <div className="mt-4 text-xs text-muted-foreground">{p._count.tasks} task{p._count.tasks === 1 ? "" : "s"}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Color</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-20" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={submit} loading={loading} disabled={!form.name}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
