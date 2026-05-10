import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Input = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")).optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  status: z.string().default("NEW"),
  value: z.coerce.number().default(0),
});

export async function GET(req: Request) {
  const user = await requireUser();
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const status = url.searchParams.get("status") || undefined;
  const where: any = { businessId: user.businessId };
  if (q) where.OR = [{ name: { contains: q } }, { company: { contains: q } }, { email: { contains: q } }];
  if (status) where.status = status;
  const customers = await prisma.customer.findMany({
    where, include: { owner: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ customers });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = Input.parse(await req.json());
  const customer = await prisma.customer.create({
    data: { ...body, email: body.email || null, businessId: user.businessId, ownerId: user.id },
  });
  return NextResponse.json({ customer });
}
