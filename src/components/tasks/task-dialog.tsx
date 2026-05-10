"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TaskDialog({ open, onOpenChange, task }: { open: boolean; onOpenChange: (v: boolean) => void; task?: any }) {
  const isEdit = !!task?.id;
  const [form, setForm] = React.useState<any>({});
  const [loading, setLoading] = React.useState(false);
  const qc = useQueryClient();

  const { data: usersData } = useQuery<{ users: any[] }>({
    queryKey: ["users-list"],
    queryFn: () => fetch("/api/employees").then((r) => r.json()),
    enabled: open,
  });
  const { data: projectsData } = useQuery<{ projects: any[] }>({
    queryKey: ["projects-list"],
    queryFn: () => fetch("/api/projects").then((r) => r.json()),
    enabled: open,
  });

  React.useEffect(() => {
    setForm(
      task?.id
        ? {
            title: task.title, description: task.description ?? "", status: task.status, priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
            projectId: task.projectId ?? "", assigneeId: task.assigneeId ?? "",
          }
        : { title: "", description: "", status: task?.status ?? "TODO", priority: "MEDIUM", dueDate: "", projectId: "", assigneeId: "" }
    );
  }, [task, open]);

  function set(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        projectId: form.projectId || null,
        assigneeId: form.assigneeId || null,
      };
      const r = isEdit
        ? await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      toast.success(isEdit ? "Task updated" : "Task created");
      qc.invalidateQueries({ queryKey: ["tasks"] });
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Title *</Label><Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status ?? "TODO"} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={form.priority ?? "MEDIUM"} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={form.projectId || "none"} onValueChange={(v) => set("projectId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {projectsData?.projects?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select value={form.assigneeId || "none"} onValueChange={(v) => set("assigneeId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {usersData?.users?.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2"><Label>Due date</Label><Input type="date" value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="gradient" onClick={submit} loading={loading}>{isEdit ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
