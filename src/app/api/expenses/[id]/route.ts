import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const e = await prisma.expense.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!e) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
