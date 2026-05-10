import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

const Update = z.object({
  name: z.string().min(1).optional(),
  jobTitle: z.string().nullish(),
  phone: z.string().nullish(),
  password: z.string().min(8).optional(),
  businessName: z.string().min(1).optional(),
});

export const GET = safe(async () => {
  const user = await requireUser();
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    include: { business: true },
  });
  return NextResponse.json({ user: data });
});

export const PATCH = safe(async (req: Request) => {
  const user = await requireUser();
  const body = Update.parse(await req.json());
  const updates: any = {};
  if (body.name) updates.name = body.name;
  if (body.jobTitle !== undefined) updates.jobTitle = body.jobTitle;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.password) updates.passwordHash = await bcrypt.hash(body.password, 10);
  if (Object.keys(updates).length) {
    await prisma.user.update({ where: { id: user.id }, data: updates });
  }
  if (body.businessName && (user.role === "OWNER" || user.role === "MANAGER")) {
    await prisma.business.update({ where: { id: user.businessId }, data: { name: body.businessName } });
  }
  return NextResponse.json({ ok: true });
});
