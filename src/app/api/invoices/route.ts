import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { nextInvoiceNumber } from "@/lib/utils";

const Item = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  productId: z.string().optional().nullable(),
});

const Input = z.object({
  customerId: z.string().optional().nullable(),
  status: z.string().default("DRAFT"),
  issueDate: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  taxRate: z.coerce.number().default(0),
  notes: z.string().optional().nullable(),
  items: z.array(Item).min(1),
});

export async function GET() {
  const user = await requireUser();
  const invoices = await prisma.invoice.findMany({
    where: { businessId: user.businessId },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = Input.parse(await req.json());
  const last = await prisma.invoice.findFirst({ where: { businessId: user.businessId }, orderBy: { createdAt: "desc" } });
  const number = nextInvoiceNumber(last?.number);

  const subtotal = body.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * (body.taxRate / 100);
  const total = subtotal + tax;

  const invoice = await prisma.invoice.create({
    data: {
      number, status: body.status,
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      subtotal, tax, total, notes: body.notes,
      businessId: user.businessId, customerId: body.customerId || null, createdById: user.id,
      items: {
        create: body.items.map((i) => ({
          description: i.description, quantity: i.quantity, unitPrice: i.unitPrice,
          total: i.quantity * i.unitPrice, productId: i.productId || null,
        })),
      },
    },
    include: { items: true, customer: true },
  });
  return NextResponse.json({ invoice });
}
