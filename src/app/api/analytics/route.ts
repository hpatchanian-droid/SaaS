import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  const businessId = user.businessId;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [invoices, expenses, products, customers, employees] = await Promise.all([
    prisma.invoice.findMany({ where: { businessId, issueDate: { gte: sixMonthsAgo } } }),
    prisma.expense.findMany({ where: { businessId, date: { gte: sixMonthsAgo } } }),
    prisma.product.findMany({ where: { businessId } }),
    prisma.customer.findMany({ where: { businessId } }),
    prisma.user.count({ where: { businessId, active: true } }),
  ]);

  // Monthly revenue, expenses, profit
  const series: any[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const rev = invoices.filter((x) => x.status === "PAID" && x.issueDate.getMonth() === d.getMonth() && x.issueDate.getFullYear() === d.getFullYear()).reduce((s, x) => s + x.total, 0);
    const exp = expenses.filter((x) => x.date.getMonth() === d.getMonth() && x.date.getFullYear() === d.getFullYear()).reduce((s, x) => s + x.amount, 0);
    series.push({ month: label, revenue: Math.round(rev), expenses: Math.round(exp), profit: Math.round(rev - exp) });
  }

  // Customers by status
  const statusCounts: Record<string, number> = {};
  customers.forEach((c) => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });
  const customerStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  // Inventory value & breakdown
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const inventoryRetail = products.reduce((s, p) => s + p.stock * p.price, 0);
  const lowStock = products.filter((p) => p.stock <= p.reorderLevel).length;

  // Avg invoice
  const paidInvs = invoices.filter((i) => i.status === "PAID");
  const avgInvoice = paidInvs.length ? paidInvs.reduce((s, i) => s + i.total, 0) / paidInvs.length : 0;

  // Expenses by category
  const expByCat: Record<string, number> = {};
  expenses.forEach((e) => { const k = e.category || "Other"; expByCat[k] = (expByCat[k] || 0) + e.amount; });
  const expenseBreakdown = Object.entries(expByCat).map(([category, amount]) => ({ category, amount: Math.round(amount) }));

  return NextResponse.json({
    series, customerStatus, expenseBreakdown,
    summary: {
      inventoryValue, inventoryRetail, lowStock, avgInvoice,
      employees, customers: customers.length, products: products.length,
      pipelineValue: customers.reduce((s, c) => s + c.value, 0),
    },
  });
}
