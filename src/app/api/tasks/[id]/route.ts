import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

const Update = z.object({
  title: z.string().optional(),
  description: z.string().nullish(),
  status: z.string().optional(),
  priority: z.string().optional(),
  position: z.number().optional(),
  dueDate: z.string().nullish(),
  projectId: z.string().nullish(),
  assigneeId: z.string().nullish(),
});

type Ctx = { params: { id: string } };

export const PATCH = safe<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const t = await prisma.task.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = Update.parse(await req.json());
  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...data,
      dueDate: data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null,
    },
  });
  return NextResponse.json({ task });
});

export const DELETE = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const t = await prisma.task.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
