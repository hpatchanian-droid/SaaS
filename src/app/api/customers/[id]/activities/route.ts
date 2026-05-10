import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

type Ctx = { params: { id: string } };

export const POST = safe<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const c = await prisma.customer.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = z.object({ type: z.string().default("NOTE"), content: z.string().min(1) }).parse(await req.json());
  const activity = await prisma.customerActivity.create({ data: { customerId: params.id, ...body } });
  return NextResponse.json({ activity });
});
