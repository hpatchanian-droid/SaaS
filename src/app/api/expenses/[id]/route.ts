import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

type Ctx = { params: { id: string } };

export const DELETE = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const e = await prisma.expense.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!e) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
