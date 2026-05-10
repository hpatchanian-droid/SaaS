import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

const Input = z.object({
  title: z.string().min(1),
  description: z.string().nullish(),
  status: z.string().default("TODO"),
  priority: z.string().default("MEDIUM"),
  dueDate: z.string().nullish(),
  projectId: z.string().nullish(),
  assigneeId: z.string().nullish(),
});

export const GET = safe(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId") || undefined;
  const where: any = { businessId: user.businessId };
  if (projectId) where.projectId = projectId;
  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      project: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
});

export const POST = safe(async (req: Request) => {
  const user = await requireUser();
  const body = Input.parse(await req.json());
  const last = await prisma.task.findFirst({
    where: { businessId: user.businessId, status: body.status },
    orderBy: { position: "desc" },
  });
  const task = await prisma.task.create({
    data: {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      projectId: body.projectId || null,
      assigneeId: body.assigneeId || null,
      businessId: user.businessId,
      createdById: user.id,
      position: (last?.position ?? -1) + 1,
    },
  });
  if (task.assigneeId && task.assigneeId !== user.id) {
    await prisma.notification.create({
      data: {
        businessId: user.businessId,
        userId: task.assigneeId,
        title: "Task assigned",
        body: task.title,
        type: "INFO",
        link: "/tasks",
      },
    });
  }
  return NextResponse.json({ task });
});
