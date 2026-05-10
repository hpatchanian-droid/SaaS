"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, MessageSquare, Trash2, Flag } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { initials, formatDate, cn } from "@/lib/utils";

const COLUMNS = [
  { key: "TODO", label: "To do", color: "bg-slate-500" },
  { key: "IN_PROGRESS", label: "In progress", color: "bg-indigo-500" },
  { key: "REVIEW", label: "Review", color: "bg-amber-500" },
  { key: "DONE", label: "Done", color: "bg-emerald-500" },
];
const PRIORITY_COLOR: Record<string, string> = {
  LOW: "text-slate-400", MEDIUM: "text-amber-500", HIGH: "text-rose-500", URGENT: "text-rose-600",
};

export default function TasksPage() {
  const qc = useQueryClient();
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editTask, setEditTask] = React.useState<any>(null);

  const { data, isLoading } = useQuery<{ tasks: any[] }>({
    queryKey: ["tasks"],
    queryFn: () => fetch("/api/tasks").then((r) => r.json()),
  });

  async function moveToColumn(taskId: string, status: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    const r = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Task deleted");
      qc.invalidateQueries({ queryKey: ["tasks"] });
    }
  }

  const tasks = data?.tasks ?? [];
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Tasks"
        description="Drag and drop cards across columns to update status."
        actions={
          <Button variant="gradient" onClick={() => { setEditTask(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className="rounded-xl bg-muted/30 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId) {
                  moveToColumn(draggedId, col.key);
                  setDraggedId(null);
                }
              }}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn("h-2 w-2 rounded-full", col.color)} />
                  {col.label}
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditTask({ status: col.key }); setDialogOpen(true); }}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {isLoading
                  ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                  : items.map((t) => (
                      <Card
                        key={t.id}
                        draggable
                        onDragStart={() => setDraggedId(t.id)}
                        onDragEnd={() => setDraggedId(null)}
                        onClick={() => { setEditTask(t); setDialogOpen(true); }}
                        className={cn("cursor-grab p-3 transition-all hover:shadow-md active:cursor-grabbing", draggedId === t.id && "opacity-50")}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">{t.title}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {t.description && <p className="line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Flag className={cn("h-3 w-3", PRIORITY_COLOR[t.priority])} />
                            {t.project && <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: `${t.project.color}20`, color: t.project.color }}>{t.project.name}</Badge>}
                          </div>
                          {t.assignee && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={t.assignee.avatar} />
                              <AvatarFallback className="text-[10px]">{initials(t.assignee.name)}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        {(t.dueDate || t._count?.comments > 0) && (
                          <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                            {t.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(t.dueDate)}</span>}
                            {t._count?.comments > 0 && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {t._count.comments}</span>}
                          </div>
                        )}
                      </Card>
                    ))}
                {!isLoading && items.length === 0 && (
                  <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">Drag tasks here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editTask} />
    </div>
  );
}
