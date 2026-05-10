import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

const Input = z.object({
  name: z.string().min(1),
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  phone: z.string().nullish(),
  company: z.string().nullish(),
  address: z.string().nullish(),
  notes: z.string().nullish(),
  tags: z.string().nullish(),
  status: z.string().default("NEW"),
  value: z.coerce.number().default(0),
});

export const GET = safe(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const status = url.searchParams.get("status") || undefined;
  const where: any = { businessId: user.businessId };
  if (q) where.OR = [{ name: { contains: q } }, { company: { contains: q } }, { email: { contains: q } }];
  if (status) where.status = status;
  const customers = await prisma.customer.findMany({
    where,
    include: { owner: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ customers });
});

export const POST = safe(async (req: Request) => {
  const user = await requireUser();
  const body = Input.parse(await req.json());
  const customer = await prisma.customer.create({
    data: { ...body, email: body.email || null, businessId: user.businessId, ownerId: user.id },
  });
  return NextResponse.json({ customer });
});
