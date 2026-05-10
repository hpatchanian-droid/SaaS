import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Update = z.object({
  name: z.string().optional(),
  role: z.enum(["OWNER", "MANAGER", "EMPLOYEE"]).optional(),
  jobTitle: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  hourlyRate: z.coerce.number().optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (user.role !== "OWNER" && user.role !== "MANAGER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const target = await prisma.user.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = Update.parse(await req.json());
  const u = await prisma.user.update({ where: { id: params.id }, data });
  return NextResponse.json({ user: { id: u.id, name: u.name, role: u.role, active: u.active } });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (user.role !== "OWNER") return NextResponse.json({ error: "Owners only" }, { status: 403 });
  if (params.id === user.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  const target = await prisma.user.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.user.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
