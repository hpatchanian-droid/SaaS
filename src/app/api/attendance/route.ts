import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await requireUser();
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || undefined;
  const days = parseInt(url.searchParams.get("days") || "14");
  const since = new Date();
  since.setDate(since.getDate() - days);
  const where: any = { businessId: user.businessId, clockIn: { gte: since } };
  if (userId) where.userId = userId;
  // Employees can only see their own
  if (user.role === "EMPLOYEE") where.userId = user.id;

  const records = await prisma.attendance.findMany({
    where, orderBy: { clockIn: "desc" },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  const open = await prisma.attendance.findFirst({
    where: { businessId: user.businessId, userId: user.id, clockOut: null },
    orderBy: { clockIn: "desc" },
  });

  return NextResponse.json({ records, open });
}
