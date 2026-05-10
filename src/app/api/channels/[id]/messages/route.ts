import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";
import { publish } from "@/lib/events";

async function ensureMember(channelId: string, userId: string, businessId: string) {
  const channel = await prisma.channel.findFirst({ where: { id: channelId, businessId } });
  if (!channel) throw new Error("Channel not found");
  const member = await prisma.channelMember.findFirst({ where: { channelId, userId } });
  if (!member) {
    await prisma.channelMember.create({ data: { channelId, userId } });
  }
}

type Ctx = { params: { id: string } };

export const GET = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  await ensureMember(params.id, user.id, user.businessId);
  const messages = await prisma.message.findMany({
    where: { channelId: params.id },
    include: { author: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json({ messages });
});

export const POST = safe<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  await ensureMember(params.id, user.id, user.businessId);
  const body = z.object({ content: z.string().min(1) }).parse(await req.json());
  const message = await prisma.message.create({
    data: { channelId: params.id, authorId: user.id, content: body.content },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });
  publish(`channel:${params.id}`, { type: "message", message });
  return NextResponse.json({ message });
});
