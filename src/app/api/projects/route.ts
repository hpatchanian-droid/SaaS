import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

export const GET = safe(async () => {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { businessId: user.businessId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ projects });
});

export const POST = safe(async (req: Request) => {
  const user = await requireUser();
  const body = z
    .object({
      name: z.string().min(1),
      description: z.string().nullish(),
      color: z.string().default("#6366f1"),
    })
    .parse(await req.json());
  const project = await prisma.project.create({ data: { ...body, businessId: user.businessId } });
  return NextResponse.json({ project });
});
