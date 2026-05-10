import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

const Update = z.object({
  name: z.string().optional(),
  role: z.enum(["OWNER", "MANAGER", "EMPLOYEE"]).optional(),
  jobTitle: z.string().nullish(),
  phone: z.string().nullish(),
  hourlyRate: z.coerce.number().nullish(),
  active: z.boolean().optional(),
});

type Ctx = { params: { id: string } };

export const PATCH = safe<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  if (user.role !== "OWNER" && user.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const target = await prisma.user.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = Update.parse(await req.json());
  const u = await prisma.user.update({ where: { id: params.id }, data });
  return NextResponse.json({ user: { id: u.id, name: u.name, role: u.role, active: u.active } });
});

export const DELETE = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  if (user.role !== "OWNER") return NextResponse.json({ error: "Owners only" }, { status: 403 });
  if (params.id === user.id) return NextResponse.json({ error: "Cannot deactivate yourself" }, { status: 400 });
  const target = await prisma.user.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.user.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json({ ok: true });
});
