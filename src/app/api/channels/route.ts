import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

export const GET = safe(async () => {
  const user = await requireUser();
  const channels = await prisma.channel.findMany({
    where: { businessId: user.businessId, members: { some: { userId: user.id } } },
    include: {
      _count: { select: { messages: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ channels });
});

export const POST = safe(async (req: Request) => {
  const user = await requireUser();
  const body = z.object({ name: z.string().min(1), description: z.string().optional() }).parse(await req.json());
  const channel = await prisma.channel.create({
    data: {
      name: body.name,
      description: body.description,
      businessId: user.businessId,
      members: { create: [{ userId: user.id }] },
    },
  });
  return NextResponse.json({ channel });
});
