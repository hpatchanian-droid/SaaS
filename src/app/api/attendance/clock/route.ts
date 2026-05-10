import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST() {
  const user = await requireUser();
  const open = await prisma.attendance.findFirst({
    where: { businessId: user.businessId, userId: user.id, clockOut: null },
    orderBy: { clockIn: "desc" },
  });
  if (open) {
    const now = new Date();
    const hours = (now.getTime() - open.clockIn.getTime()) / 3600000;
    const updated = await prisma.attendance.update({
      where: { id: open.id }, data: { clockOut: now, hours: Math.round(hours * 100) / 100 },
    });
    return NextResponse.json({ action: "out", record: updated });
  }
  const now = new Date();
  const expected = new Date(now);
  expected.setHours(9, 0, 0, 0);
  const status = now > expected ? "LATE" : "PRESENT";
  const created = await prisma.attendance.create({
    data: { businessId: user.businessId, userId: user.id, clockIn: now, status },
  });
  return NextResponse.json({ action: "in", record: created });
}
