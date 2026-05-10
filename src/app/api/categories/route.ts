import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  const categories = await prisma.category.findMany({
    where: { businessId: user.businessId },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = z.object({ name: z.string().min(1), color: z.string().optional() }).parse(await req.json());
  const category = await prisma.category.create({ data: { ...body, businessId: user.businessId } });
  return NextResponse.json({ category });
}
