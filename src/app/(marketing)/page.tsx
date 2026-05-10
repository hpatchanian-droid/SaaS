"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, BarChart3, Boxes, Calendar, CheckCircle2, ChevronDown,
  Clock, MessageSquare, Receipt, Shield, Sparkles, Star, Users, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";

const features = [
  { icon: Boxes, title: "Inventory & Stock", desc: "Track products, warehouses, suppliers, and stock movements with realtime alerts." },
  { icon: Users, title: "Team & Attendance", desc: "Schedule shifts, clock in/out, run payroll, and manage time-off requests." },
  { icon: Calendar, title: "Tasks & Projects", desc: "Drag-and-drop Kanban boards, due dates, mentions, and activity logs." },
  { icon: Receipt, title: "Invoices & Finance", desc: "Send invoices, accept payments, track expenses, and see profit at a glance." },
  { icon: MessageSquare, title: "Realtime Chat", desc: "Built-in team channels and DMs that keep work conversations in one place." },
  { icon: BarChart3, title: "Live Analytics", desc: "Beautiful dashboards over real data — revenue, sales, and team productivity." },
];

const testimonials = [
  { name: "Maya Chen", role: "Founder, Bright Coffee", quote: "LVL Ops replaced four tools for us. Our team finally has a single source of truth." },
  { name: "Daniel Ortiz", role: "COO, Northwind", quote: "The dashboards are gorgeous and the inventory alerts have already saved us thousands." },
  { name: "Priya Shah", role: "CEO, PixelStudio", quote: "Onboarding was instant. It feels like the love child of Notion and Shopify." },
];

const tiers = [
  { name: "Starter", price: "$0", period: "forever", desc: "Solo founders & freelancers", features: ["1 team member", "100 products", "Unlimited tasks", "Email support"], cta: "Get started" },
  { name: "Growth", price: "$29", period: "/mo", desc: "Growing teams up to 25", features: ["Unlimited products", "Stripe payments", "Realtime chat", "AI insights", "Priority support"], cta: "Start free trial", popular: true },
  { name: "Scale", price: "$99", period: "/mo", desc: "Established companies", features: ["Unlimited team", "Custom roles", "Advanced analytics", "Audit log & SSO", "Dedicated CSM"], cta: "Talk to sales" },
];

const faqs = [
  { q: "Do I need a credit card to try LVL Ops?", a: "No. The Starter tier is free forever and there's a 14-day Growth trial without a card." },
  { q: "Can I import my existing data?", a: "Yes — we support CSV imports for products, customers, and invoices, plus an API for everything else." },
  { q: "Is my data secure?", a: "All connections are encrypted in transit (TLS 1.3) and at rest. Role-based permissions and audit logs are built in." },
  { q: "Can I cancel anytime?", a: "Of course. Plans are month-to-month and you keep access until the end of your billing period." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 gradient-mesh opacity-70" aria-hidden />

      {/* Nav */}
      <header className="relative z-20">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">LVL Ops</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground">Customers</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" variant="gradient">
              <Link href="/register">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="container mx-auto pb-24 pt-16 text-center md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium backdrop-blur"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            New: AI-powered insights are now in beta
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-bold tracking-tight md:text-7xl"
          >
            Run your business at the
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"> next level</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            LVL Ops is the all-in-one platform for inventory, team, CRM, finance and analytics.
            Replace six tools with one beautifully integrated workspace.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" variant="gradient">
              <Link href="/register">Start for free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Try the demo →</Link>
            </Button>
          </motion.div>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo: <span className="font-mono">owner@test.com</span> / <span className="font-mono">Test1234!</span>
          </p>

          {/* Hero preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative mx-auto mt-16 max-w-6xl"
          >
            <div className="absolute -inset-x-12 -inset-y-6 -z-10 rounded-[2.5rem] bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-purple-500/30 blur-3xl" />
            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
              <div className="flex h-9 items-center gap-1.5 border-b bg-muted/50 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-muted-foreground">app.lvlops.com/dashboard</span>
              </div>
              <div className="grid grid-cols-12 gap-4 p-6">
                <div className="col-span-12 grid grid-cols-2 gap-4 md:col-span-8 md:grid-cols-3">
                  {[
                    { l: "Revenue", v: "$48,210", c: "+18.2%" },
                    { l: "Orders", v: "1,284", c: "+5.4%" },
                    { l: "Active staff", v: "32 / 36", c: "+2" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl border bg-background p-4">
                      <p className="text-xs text-muted-foreground">{s.l}</p>
                      <p className="mt-2 text-2xl font-bold">{s.v}</p>
                      <p className="mt-1 text-xs text-emerald-500">{s.c}</p>
                    </div>
                  ))}
                  <div className="col-span-2 h-48 rounded-xl border bg-background p-4 md:col-span-3">
                    <p className="text-xs text-muted-foreground">Revenue trend</p>
                    <svg viewBox="0 0 400 120" className="mt-2 h-full w-full">
                      <defs>
                        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,90 C50,70 90,40 140,50 C200,62 250,20 320,30 C360,36 380,50 400,40 L400,120 L0,120 Z" fill="url(#g)" />
                      <path d="M0,90 C50,70 90,40 140,50 C200,62 250,20 320,30 C360,36 380,50 400,40" stroke="rgb(99 102 241)" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
                <div className="col-span-12 space-y-3 md:col-span-4">
                  <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-semibold">Today's tasks</p>
                    {["Finalize landing page copy", "Order packaging", "Photo shoot"].map((t, i) => (
                      <div key={t} className="mt-3 flex items-center gap-2 text-xs">
                        <div className={`h-3 w-3 rounded-full border-2 ${i === 0 ? "border-emerald-500 bg-emerald-500" : "border-muted"}`} />
                        <span className={i === 0 ? "line-through text-muted-foreground" : ""}>{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="h-4 w-4 text-indigo-500" /> AI Insight
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Inventory of "Slim Fit Hoodie" will run out in 4 days at current sell-through. Suggest reorder.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos */}
      <section className="relative z-10 border-y bg-background/50">
        <div className="container mx-auto py-10">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by 10,000+ teams
          </p>
          <div className="mt-6 grid grid-cols-2 gap-8 opacity-60 sm:grid-cols-3 md:grid-cols-6">
            {["NORTHWIND", "PIXEL", "ACME", "SOLODESIGN", "BRIGHT", "GREENSCAPE"].map((n) => (
              <div key={n} className="text-center font-semibold tracking-widest text-muted-foreground">
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10">
        <div className="container mx-auto py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Everything you need</p>
            <h2 className="mt-2 text-balance text-4xl font-bold md:text-5xl">One platform. Every workflow.</h2>
            <p className="mt-4 text-muted-foreground">Six tools in one. Beautifully integrated, lightning fast, and made for modern teams.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y bg-muted/30">
        <div className="container mx-auto grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {[
            { v: "10k+", l: "Teams" },
            { v: "$2.4B", l: "Processed" },
            { v: "99.99%", l: "Uptime" },
            { v: "4.9/5", l: "Rating" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-bold md:text-4xl">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10">
        <div className="container mx-auto py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-bold md:text-5xl">Loved by founders & operators</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm">"{t.quote}"</p>
                  <p className="mt-6 text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 border-t bg-muted/20">
        <div className="container mx-auto py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-bold md:text-5xl">Simple, honest pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free. Scale when you're ready. No hidden fees.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tiers.map((t) => (
              <Card key={t.name} className={`relative ${t.popular ? "border-primary shadow-xl" : ""}`}>
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{t.price}</span>
                    <span className="text-sm text-muted-foreground">{t.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={t.popular ? "gradient" : "outline"} className="mt-8 w-full">
                    <Link href="/register">{t.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10">
        <div className="container mx-auto py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-4xl font-bold md:text-5xl">Frequently asked</h2>
            <div className="mt-10 divide-y rounded-xl border bg-card">
              {faqs.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    >
                      <span className="font-medium">{f.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10">
        <div className="container mx-auto pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-center text-white shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
            <h2 className="relative text-balance text-4xl font-bold md:text-5xl">Ready to level up your operations?</h2>
            <p className="relative mt-4 text-white/80">Join thousands of teams already running smarter with LVL Ops.</p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
                <Link href="/register">Start free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link href="/login">Try the demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t">
        <div className="container mx-auto py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold">LVL Ops</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} LVL Ops. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
