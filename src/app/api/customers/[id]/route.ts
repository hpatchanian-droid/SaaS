import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

const Update = z.object({
  name: z.string().optional(),
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  phone: z.string().nullish(),
  company: z.string().nullish(),
  address: z.string().nullish(),
  notes: z.string().nullish(),
  tags: z.string().nullish(),
  status: z.string().optional(),
  value: z.coerce.number().optional(),
});

type Ctx = { params: { id: string } };

export const GET = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const customer = await prisma.customer.findFirst({
    where: { id: params.id, businessId: user.businessId },
    include: { activities: { orderBy: { createdAt: "desc" } }, invoices: true, owner: true },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ customer });
});

export const PATCH = safe<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const c = await prisma.customer.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = Update.parse(await req.json());
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: { ...data, email: data.email === "" ? null : data.email },
  });
  return NextResponse.json({ customer });
});

export const DELETE = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const c = await prisma.customer.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
