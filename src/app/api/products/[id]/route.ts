import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

const Update = z.object({
  name: z.string().optional(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  price: z.coerce.number().min(0).optional(),
  cost: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  reorderLevel: z.coerce.number().int().min(0).optional(),
  unit: z.string().optional(),
  categoryId: z.string().nullish(),
  supplierId: z.string().nullish(),
  warehouseId: z.string().nullish(),
  barcode: z.string().nullish(),
  active: z.boolean().optional(),
});

async function ensureOwn(id: string, businessId: string) {
  const p = await prisma.product.findFirst({ where: { id, businessId } });
  if (!p) throw new Error("Not found");
  return p;
}

type Ctx = { params: { id: string } };

export const GET = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const product = await prisma.product.findFirst({
    where: { id: params.id, businessId: user.businessId },
    include: {
      category: true, supplier: true, warehouse: true,
      movements: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
});

export const PATCH = safe<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  await ensureOwn(params.id, user.businessId);
  const data = Update.parse(await req.json());
  const product = await prisma.product.update({ where: { id: params.id }, data });
  await prisma.auditLog.create({
    data: { businessId: user.businessId, userId: user.id, action: "update", entity: "product", entityId: product.id },
  });
  return NextResponse.json({ product });
});

export const DELETE = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  await ensureOwn(params.id, user.businessId);
  await prisma.product.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: { businessId: user.businessId, userId: user.id, action: "delete", entity: "product", entityId: params.id },
  });
  return NextResponse.json({ ok: true });
});
