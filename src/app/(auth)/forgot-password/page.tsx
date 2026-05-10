"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulated email — real SMTP/Supabase handles delivery in prod
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
    toast.success("If that account exists, we sent reset instructions.");
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
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">We'll send you a link to reset it.</p>

      {!sent ? (
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" variant="gradient" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      ) : (
        <div className="mt-8 rounded-lg border bg-muted/40 p-4 text-sm">
          Check <span className="font-mono">{email}</span> for the reset link.
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}
