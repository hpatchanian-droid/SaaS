import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Update = z.object({
  name: z.string().optional(),
  jobTitle: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  password: z.string().min(8).optional(),
  businessName: z.string().optional(),
});

export async function GET() {
  const user = await requireUser();
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    include: { business: true },
  });
  return NextResponse.json({ user: data });
}

export async function PATCH(req: Request) {
  const user = await requireUser();
  const body = Update.parse(await req.json());
  const updates: any = {};
  if (body.name) updates.name = body.name;
  if (body.jobTitle !== undefined) updates.jobTitle = body.jobTitle;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.password) updates.passwordHash = await bcrypt.hash(body.password, 10);
  await prisma.user.update({ where: { id: user.id }, data: updates });
  if (body.businessName && (user.role === "OWNER" || user.role === "MANAGER")) {
    await prisma.business.update({ where: { id: user.businessId }, data: { name: body.businessName } });
  }
  return NextResponse.json({ ok: true });
}
