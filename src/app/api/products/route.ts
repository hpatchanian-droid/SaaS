import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const ProductInput = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  reorderLevel: z.coerce.number().int().min(0).default(5),
  unit: z.string().default("pc"),
  categoryId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  warehouseId: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const user = await requireUser();
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const categoryId = url.searchParams.get("categoryId") || undefined;
  const lowStock = url.searchParams.get("lowStock") === "1";

  const where: any = { businessId: user.businessId };
  if (q) where.OR = [{ name: { contains: q } }, { sku: { contains: q } }];
  if (categoryId) where.categoryId = categoryId;

  const products = await prisma.product.findMany({
    where,
    include: { category: true, supplier: true, warehouse: true },
    orderBy: { createdAt: "desc" },
  });
  const filtered = lowStock ? products.filter((p) => p.stock <= p.reorderLevel) : products;
  return NextResponse.json({ products: filtered });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = ProductInput.parse(await req.json());
  const sku = body.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

  const exists = await prisma.product.findFirst({ where: { businessId: user.businessId, sku } });
  if (exists) return NextResponse.json({ error: "SKU already exists" }, { status: 400 });

  const product = await prisma.product.create({
    data: { ...body, sku, businessId: user.businessId },
  });
  await prisma.auditLog.create({ data: { businessId: user.businessId, userId: user.id, action: "create", entity: "product", entityId: product.id } });
  return NextResponse.json({ product });
}
