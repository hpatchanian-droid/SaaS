import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Body = z.object({
  type: z.enum(["IN", "OUT", "ADJUST"]),
  quantity: z.coerce.number().int(),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const product = await prisma.product.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = Body.parse(await req.json());
  let newStock = product.stock;
  if (body.type === "IN") newStock += Math.abs(body.quantity);
  else if (body.type === "OUT") newStock -= Math.abs(body.quantity);
  else newStock = Math.max(0, body.quantity);
  if (newStock < 0) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

  await prisma.$transaction([
    prisma.product.update({ where: { id: product.id }, data: { stock: newStock } }),
    prisma.stockMovement.create({
      data: {
        productId: product.id, businessId: user.businessId,
        warehouseId: product.warehouseId, type: body.type,
        quantity: body.type === "ADJUST" ? newStock - product.stock : body.quantity,
        note: body.note,
      },
    }),
  ]);

  if (newStock <= product.reorderLevel) {
    await prisma.notification.create({
      data: {
        businessId: user.businessId, userId: user.id,
        title: "Low stock alert", body: `${product.name} is now at ${newStock} units (reorder at ${product.reorderLevel}).`,
        type: "WARNING", link: `/inventory/${product.id}`,
      },
    });
  }
  return NextResponse.json({ ok: true, stock: newStock });
}
