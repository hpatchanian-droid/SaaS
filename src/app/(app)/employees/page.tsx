"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Trash2, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials, formatCurrency } from "@/lib/utils";

const ROLES = ["OWNER", "MANAGER", "EMPLOYEE"];

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<any | null>(null);
  const [form, setForm] = React.useState<any>({ name: "", email: "", role: "EMPLOYEE", jobTitle: "", phone: "", hourlyRate: 0, password: "Test1234!" });
  const [loading, setLoading] = React.useState(false);

  const { data, isLoading } = useQuery<{ users: any[] }>({
    queryKey: ["employees"], queryFn: () => fetch("/api/employees").then((r) => r.json()),
  });

  function startNew() {
    setEditUser(null);
    setForm({ name: "", email: "", role: "EMPLOYEE", jobTitle: "", phone: "", hourlyRate: 0, password: "Test1234!" });
    setOpen(true);
  }
  function startEdit(u: any) {
    setEditUser(u);
    setForm({ name: u.name, role: u.role, jobTitle: u.jobTitle ?? "", phone: u.phone ?? "", hourlyRate: u.hourlyRate ?? 0 });
    setOpen(true);
  }

  async function submit() {
    setLoading(true);
    try {
      const r = editUser
        ? await fetch(`/api/employees/${editUser.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch(`/api/employees`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      toast.success(editUser ? "Updated" : "Team member added");
      qc.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deactivate(id: string) {
    if (!confirm("Deactivate this team member?")) return;
    const r = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Deactivated");
      qc.invalidateQueries({ queryKey: ["employees"] });
    } else toast.error("Failed");
  }

  const users = data?.users ?? [];
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Team"
        description="Manage your employees, roles, and pay rates."
        actions={<Button variant="gradient" onClick={startNew}><Plus className="h-4 w-4" /> Add team member</Button>}
      />

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No team members" action={<Button onClick={startNew}><Plus className="h-4 w-4" /> Add</Button>} className="m-4" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Job Title</th>
                  <th className="px-4 py-3 text-right">Pay</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarImage src={u.avatar} /><AvatarFallback>{initials(u.name)}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={u.role === "OWNER" ? "default" : u.role === "MANAGER" ? "warning" : "secondary"}>{u.role}</Badge></td>
                    <td className="px-4 py-3">{u.jobTitle || "—"}</td>
                    <td className="px-4 py-3 text-right">{u.hourlyRate ? `${formatCurrency(u.hourlyRate)}/hr` : "—"}</td>
                    <td className="px-4 py-3"><Badge variant={u.active ? "success" : "secondary"}>{u.active ? "Active" : "Inactive"}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(u)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deactivate(u.id)}><Trash2 className="h-4 w-4" /> Deactivate</DropdownMenuItem>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editUser ? "Edit team member" : "Add team member"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            {!editUser && (<>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Temporary password</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            </>)}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Job title</Label><Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Pay (per hour)</Label><Input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: parseFloat(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={submit} loading={loading}>{editUser ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
