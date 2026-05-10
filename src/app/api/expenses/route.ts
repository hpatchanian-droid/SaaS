import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  const expenses = await prisma.expense.findMany({
    where: { businessId: user.businessId },
    orderBy: { date: "desc" },
    include: { createdBy: { select: { id: true, name: true, avatar: true } } },
  });
  return NextResponse.json({ expenses });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = z
    .object({
      description: z.string().min(1),
      amount: z.coerce.number().positive(),
      category: z.string().optional().nullable(),
      date: z.string().optional(),
    })
    .parse(await req.json());
  const expense = await prisma.expense.create({
    data: {
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
      businessId: user.businessId,
      createdById: user.id,
    },
  });
  return NextResponse.json({ expense });
}
