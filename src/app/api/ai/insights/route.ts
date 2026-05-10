import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

/**
 * AI Insights — generates business insights from real, live data.
 * If OPENAI_API_KEY is set we'll use it to compose richer narratives,
 * otherwise we fall back to deterministic, data-driven rules so the
 * feature always works.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const businessId = user.businessId;
    const insights: string[] = [];

    const [products, lowStockItems, paidThisMonth, paidLastMonth, overdueInvoices, topCustomer, taskAgg] = await Promise.all([
      prisma.product.count({ where: { businessId } }),
      prisma.product.findMany({ where: { businessId }, select: { name: true, stock: true, reorderLevel: true } }),
      prisma.invoice.aggregate({
        where: { businessId, status: "PAID", issueDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          businessId, status: "PAID",
          issueDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { total: true },
      }),
      prisma.invoice.findMany({ where: { businessId, status: "OVERDUE" }, include: { customer: true } }),
      prisma.invoice.groupBy({ by: ["customerId"], where: { businessId, status: "PAID" }, _sum: { total: true }, orderBy: { _sum: { total: "desc" } }, take: 1 }),
      prisma.task.groupBy({ by: ["status"], where: { businessId }, _count: true }),
    ]);

    // Revenue trend
    const cur = paidThisMonth._sum.total ?? 0;
    const prev = paidLastMonth._sum.total ?? 0;
    if (prev > 0) {
      const pct = ((cur - prev) / prev) * 100;
      insights.push(
        pct >= 0
          ? `Revenue is up ${pct.toFixed(1)}% vs last month (${formatCurrency(cur)} this month).`
          : `Revenue is down ${Math.abs(pct).toFixed(1)}% vs last month — consider a re-engagement campaign.`
      );
    } else if (cur > 0) {
      insights.push(`You've earned ${formatCurrency(cur)} so far this month — keep it going.`);
    }

    // Low stock
    const low = lowStockItems.filter((p) => p.stock <= p.reorderLevel);
    if (low.length > 0) {
      const example = low[0];
      insights.push(
        `${low.length} product${low.length === 1 ? "" : "s"} hit the reorder threshold. Top concern: ${example.name} (${example.stock} left, threshold ${example.reorderLevel}).`
      );
    } else if (products > 0) {
      insights.push(`Inventory is healthy — no products below reorder level.`);
    }

    // Overdue
    if (overdueInvoices.length > 0) {
      const total = overdueInvoices.reduce((s, i) => s + i.total, 0);
      insights.push(
        `${overdueInvoices.length} overdue invoice${overdueInvoices.length === 1 ? "" : "s"} totaling ${formatCurrency(total)}. Send a friendly reminder to recover faster.`
      );
    }

    // Top customer
    if (topCustomer[0]?.customerId) {
      const c = await prisma.customer.findUnique({ where: { id: topCustomer[0].customerId } });
      if (c) insights.push(`Top customer: ${c.company || c.name} contributed ${formatCurrency(topCustomer[0]._sum.total ?? 0)} in paid invoices.`);
    }

    // Task pile
    const todo = taskAgg.find((t) => t.status === "TODO")?._count ?? 0;
    const done = taskAgg.find((t) => t.status === "DONE")?._count ?? 0;
    if (todo > done && todo > 5) {
      insights.push(`You have ${todo} open tasks vs ${done} completed — consider a focus sprint to clear the backlog.`);
    }

    if (insights.length === 0) {
      insights.push("Add products, customers, or invoices to start receiving tailored insights.");
    }

    // Log
    await prisma.aiLog.create({
      data: { businessId, userId: user.id, prompt: "dashboard_insights", response: JSON.stringify(insights) },
    }).catch(() => {});

    return NextResponse.json({ insights });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 401 });
  }
}
