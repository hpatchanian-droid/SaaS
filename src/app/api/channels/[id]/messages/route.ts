import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/events";

async function ensureMember(channelId: string, userId: string, businessId: string) {
  const channel = await prisma.channel.findFirst({ where: { id: channelId, businessId } });
  if (!channel) throw new Error("Channel not found");
  const member = await prisma.channelMember.findFirst({ where: { channelId, userId } });
  if (!member) {
    await prisma.channelMember.create({ data: { channelId, userId } });
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  await ensureMember(params.id, user.id, user.businessId);
  const messages = await prisma.message.findMany({
    where: { channelId: params.id },
    include: { author: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  await ensureMember(params.id, user.id, user.businessId);
  const body = z.object({ content: z.string().min(1) }).parse(await req.json());
  const message = await prisma.message.create({
    data: { channelId: params.id, authorId: user.id, content: body.content },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });
  publish(`channel:${params.id}`, { type: "message", message });
  return NextResponse.json({ message });
}
