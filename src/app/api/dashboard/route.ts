import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const businessId = user.businessId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [products, customers, lowStock, openInvoices, paidInvoices, expenses, employees, recentInvoices, taskCounts] =
      await Promise.all([
        prisma.product.count({ where: { businessId } }),
        prisma.customer.count({ where: { businessId } }),
        (async () => {
          const all = await prisma.product.findMany({ where: { businessId }, select: { stock: true, reorderLevel: true } });
          return all.filter((p) => p.stock <= p.reorderLevel).length;
        })(),
        prisma.invoice.aggregate({ where: { businessId, status: { in: ["SENT", "OVERDUE"] } }, _sum: { total: true }, _count: true }),
        prisma.invoice.aggregate({ where: { businessId, status: "PAID", issueDate: { gte: monthStart } }, _sum: { total: true } }),
        prisma.expense.aggregate({ where: { businessId, date: { gte: monthStart } }, _sum: { amount: true } }),
        prisma.user.count({ where: { businessId, active: true } }),
        prisma.invoice.findMany({
          where: { businessId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { customer: { select: { name: true, company: true } } },
        }),
        prisma.task.groupBy({ by: ["status"], where: { businessId }, _count: true }),
      ]);

    // Revenue series — last 6 months
    const invs = await prisma.invoice.findMany({
      where: { businessId, status: "PAID", issueDate: { gte: sixMonthsAgo } },
      select: { issueDate: true, total: true },
    });
    const exps = await prisma.expense.findMany({
      where: { businessId, date: { gte: sixMonthsAgo } },
      select: { date: true, amount: true },
    });
    const series: { month: string; revenue: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short" });
      const rev = invs
        .filter((x) => x.issueDate.getFullYear() === d.getFullYear() && x.issueDate.getMonth() === d.getMonth())
        .reduce((s, x) => s + x.total, 0);
      const exp = exps
        .filter((x) => x.date.getFullYear() === d.getFullYear() && x.date.getMonth() === d.getMonth())
        .reduce((s, x) => s + x.amount, 0);
      series.push({ month: key, revenue: Math.round(rev), expenses: Math.round(exp) });
    }

    // Top products by invoice item count
    const topItems = await prisma.invoiceItem.groupBy({
      by: ["productId"],
      where: { invoice: { businessId } },
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });
    const productIds = topItems.map((t) => t.productId).filter(Boolean) as string[];
    const productMap = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } });
    const topProducts = topItems
      .filter((i) => i.productId)
      .map((i) => ({
        name: productMap.find((p) => p.id === i.productId)?.name ?? "Unknown",
        revenue: i._sum.total ?? 0,
        quantity: i._sum.quantity ?? 0,
      }));

    return NextResponse.json({
      stats: {
        revenueThisMonth: paidInvoices._sum.total ?? 0,
        expensesThisMonth: expenses._sum.amount ?? 0,
        outstanding: openInvoices._sum.total ?? 0,
        outstandingCount: openInvoices._count,
        products,
        lowStock,
        customers,
        employees,
      },
      series,
      recentInvoices,
      tasksByStatus: taskCounts,
      topProducts,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 401 });
  }
}
