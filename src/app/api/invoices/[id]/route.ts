import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { safe } from "@/lib/api-error";

type Ctx = { params: { id: string } };

export const GET = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, businessId: user.businessId },
    include: { items: true, customer: true, business: true, createdBy: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ invoice });
});

export const PATCH = safe<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const inv = await prisma.invoice.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = z.object({ status: z.string() }).parse(await req.json());
  const invoice = await prisma.invoice.update({ where: { id: params.id }, data: { status: body.status } });
  if (body.status === "PAID") {
    await prisma.notification.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        title: "Invoice paid",
        body: `${inv.number} marked paid`,
        type: "SUCCESS",
        link: "/invoices",
      },
    });
  }
  return NextResponse.json({ invoice });
});

export const DELETE = safe<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const inv = await prisma.invoice.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
