"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <React.Suspense>
      <LoginInner />
    </React.Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back!");
    router.push(callbackUrl);
    router.refresh();
  }

  function fillDemo(email: string) {
    setEmail(email);
    setPassword("Test1234!");
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
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <Button type="submit" variant="gradient" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-dashed p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Try a demo account</p>
        <div className="grid gap-1.5 text-xs">
          {[
            { e: "owner@test.com", l: "Owner" },
            { e: "manager@test.com", l: "Manager" },
            { e: "employee@test.com", l: "Employee" },
          ].map((d) => (
            <button
              key={d.e}
              type="button"
              onClick={() => fillDemo(d.e)}
              className="flex justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
            >
              <span className="font-mono">{d.e}</span>
              <span className="text-muted-foreground">{d.l}</span>
            </button>
          ))}
          <p className="px-2 text-muted-foreground">Password: <span className="font-mono">Test1234!</span></p>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
