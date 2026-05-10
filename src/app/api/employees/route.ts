import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

export const GET = safe(async () => {
  const user = await requireUser();
  const users = await prisma.user.findMany({
    where: { businessId: user.businessId },
    select: {
      id: true, email: true, name: true, avatar: true, role: true, jobTitle: true, phone: true,
      hourlyRate: true, active: true, createdAt: true,
      _count: { select: { attendance: true, tasksAssigned: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
});

const Create = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["OWNER", "MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  hourlyRate: z.coerce.number().optional(),
  password: z.string().min(8).default("Test1234!"),
});

export const POST = safe(async (req: Request) => {
  const user = await requireUser();
  if (user.role !== "OWNER" && user.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = Create.parse(await req.json());
  const exists = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  const passwordHash = await bcrypt.hash(body.password, 10);
  const u = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash,
      name: body.name,
      role: body.role,
      jobTitle: body.jobTitle,
      phone: body.phone,
      hourlyRate: body.hourlyRate,
      businessId: user.businessId,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.email)}`,
    },
  });
  return NextResponse.json({ user: { id: u.id, email: u.email, name: u.name } });
});
