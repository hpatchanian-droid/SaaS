import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Update = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")).nullable().optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  status: z.string().optional(),
  value: z.coerce.number().optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const customer = await prisma.customer.findFirst({
    where: { id: params.id, businessId: user.businessId },
    include: { activities: { orderBy: { createdAt: "desc" } }, invoices: true, owner: true },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const c = await prisma.customer.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = Update.parse(await req.json());
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: { ...data, email: data.email === "" ? null : data.email },
  });
  return NextResponse.json({ customer });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const c = await prisma.customer.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
