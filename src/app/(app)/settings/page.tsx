"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials } from "@/lib/utils";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { data, isLoading } = useQuery<{ user: any }>({
    queryKey: ["profile"], queryFn: () => fetch("/api/profile").then((r) => r.json()),
  });
  const [form, setForm] = React.useState<any>({});
  const [pw, setPw] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (data?.user) {
      setForm({ name: data.user.name, jobTitle: data.user.jobTitle ?? "", phone: data.user.phone ?? "", businessName: data.user.business?.name ?? "" });
    }
  }, [data]);

  async function save() {
    setSaving(true);
    const r = await fetch("/api/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, password: pw || undefined }),
    });
    setSaving(false);
    if (r.ok) {
      toast.success("Settings saved");
      setPw("");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } else toast.error("Failed");
  }

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
  const user = data?.user;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Settings" description="Manage your profile, business, and preferences." />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarImage src={user?.avatar} /><AvatarFallback>{initials(user?.name ?? "")}</AvatarFallback></Avatar>
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{user?.role}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Job title</Label><Input value={form.jobTitle ?? ""} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <Button onClick={save} loading={saving} variant="gradient">Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader><CardTitle>Business</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Business name</Label><Input value={form.businessName ?? ""} onChange={(e) => setForm({ ...form, businessName: e.target.value })} disabled={user?.role === "EMPLOYEE"} /></div>
              <p className="text-xs text-muted-foreground">Plan: <span className="font-mono">{user?.business?.plan}</span></p>
              <Button onClick={save} loading={saving} variant="gradient">Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
            <CardContent>
              <Label>Theme</Label>
              <div className="mt-2 grid grid-cols-3 gap-2 max-w-md">
                {[
                  { v: "light", label: "Light", icon: Sun },
                  { v: "dark", label: "Dark", icon: Moon },
                  { v: "system", label: "System", icon: Monitor },
                ].map((t) => (
                  <Button key={t.v} variant={theme === t.v ? "default" : "outline"} onClick={() => setTheme(t.v)}>
                    <t.icon className="h-4 w-4" /> {t.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label>New password</Label>
                <Input type="password" placeholder="Leave blank to keep current" value={pw} onChange={(e) => setPw(e.target.value)} />
                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
              </div>
              <Button onClick={save} loading={saving} disabled={!pw || pw.length < 8} variant="gradient">Change password</Button>
              <div className="border-t pt-4">
                <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" /> Sign out everywhere
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
