import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/api-error";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  businessName: z.string().min(1),
});

export const POST = safe(async (req: Request) => {
  const data = Body.parse(await req.json());
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

  const slug =
    data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6);

  const business = await prisma.business.create({ data: { name: data.businessName, slug } });
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      role: "OWNER",
      businessId: business.id,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.email)}`,
    },
  });

  // Default channel
  await prisma.channel.create({
    data: {
      name: "general",
      description: "Company-wide announcements",
      businessId: business.id,
      members: { create: [{ userId: user.id }] },
    },
  });

  return NextResponse.json({ ok: true, userId: user.id });
});
