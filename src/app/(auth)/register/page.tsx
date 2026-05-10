"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", email: "", password: "", businessName: "" });
  const [loading, setLoading] = React.useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) {
      setLoading(false);
      toast.error(data.error || "Could not create account");
      return;
    }
    const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Account created but sign-in failed. Try logging in.");
      router.push("/login");
      return;
    }
    toast.success("Welcome to LVL Ops!");
    router.push("/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card/80 p-8 shadow-2xl backdrop-blur-xl"
    >
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-bold">LVL Ops</span>
      </Link>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Start your free workspace in seconds.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business</Label>
            <Input id="businessName" required value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" minLength={8} required value={form.password} onChange={(e) => set("password", e.target.value)} />
          <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
        </div>
        <Button type="submit" variant="gradient" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
