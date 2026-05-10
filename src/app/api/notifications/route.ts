import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { businessId: user.businessId, userId: user.id },
    orderBy: { createdAt: "desc" }, take: 50,
  });
  return NextResponse.json({ notifications });
}

export async function PATCH() {
  const user = await requireUser();
  await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
