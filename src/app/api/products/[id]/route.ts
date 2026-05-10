import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Update = z.object({
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  price: z.coerce.number().min(0).optional(),
  cost: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  reorderLevel: z.coerce.number().int().min(0).optional(),
  unit: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  warehouseId: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

async function ensureOwn(id: string, businessId: string) {
  const p = await prisma.product.findFirst({ where: { id, businessId } });
  if (!p) throw new Error("Not found");
  return p;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const product = await prisma.product.findFirst({
    where: { id: params.id, businessId: user.businessId },
    include: { category: true, supplier: true, warehouse: true, movements: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  await ensureOwn(params.id, user.businessId);
  const data = Update.parse(await req.json());
  const product = await prisma.product.update({ where: { id: params.id }, data });
  await prisma.auditLog.create({ data: { businessId: user.businessId, userId: user.id, action: "update", entity: "product", entityId: product.id } });
  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  await ensureOwn(params.id, user.businessId);
  await prisma.product.delete({ where: { id: params.id } });
  await prisma.auditLog.create({ data: { businessId: user.businessId, userId: user.id, action: "delete", entity: "product", entityId: params.id } });
  return NextResponse.json({ ok: true });
}
