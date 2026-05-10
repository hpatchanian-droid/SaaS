import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Idempotent seed: only seed if owner doesn't exist
  const existing = await prisma.user.findUnique({ where: { email: "owner@test.com" } });
  if (existing) {
    console.log("Seed data already present, skipping.");
    return;
  }

  const password = await bcrypt.hash("Test1234!", 10);

  const business = await prisma.business.create({
    data: {
      name: "Acme Industries",
      slug: "acme",
      plan: "pro",
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@test.com",
      passwordHash: password,
      name: "Alex Reed",
      role: "OWNER",
      jobTitle: "Founder & CEO",
      businessId: business.id,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=alex`,
      hourlyRate: 150,
    },
  });
  const manager = await prisma.user.create({
    data: {
      email: "manager@test.com",
      passwordHash: password,
      name: "Jordan Pierce",
      role: "MANAGER",
      jobTitle: "Operations Manager",
      businessId: business.id,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=jordan`,
      hourlyRate: 65,
    },
  });
  const employee = await prisma.user.create({
    data: {
      email: "employee@test.com",
      passwordHash: password,
      name: "Sam Casey",
      role: "EMPLOYEE",
      jobTitle: "Sales Associate",
      businessId: business.id,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sam`,
      hourlyRate: 28,
    },
  });

  // Categories + suppliers + warehouse
  const [electronics, apparel, accessories] = await Promise.all([
    prisma.category.create({ data: { name: "Electronics", color: "#6366f1", businessId: business.id } }),
    prisma.category.create({ data: { name: "Apparel", color: "#10b981", businessId: business.id } }),
    prisma.category.create({ data: { name: "Accessories", color: "#f59e0b", businessId: business.id } }),
  ]);
  const supplier = await prisma.supplier.create({
    data: { name: "Global Wholesale Co.", email: "orders@globalwc.com", phone: "+1 (415) 555-0188", businessId: business.id },
  });
  const warehouse = await prisma.warehouse.create({
    data: { name: "Main Warehouse", address: "1500 Industrial Way, San Francisco, CA", businessId: business.id },
  });

  // Products
  const products = [
    { sku: "EL-001", name: "Wireless Headphones Pro", price: 249.99, cost: 110, stock: 84, categoryId: electronics.id },
    { sku: "EL-002", name: "Smart Speaker Mini", price: 89.99, cost: 38, stock: 132, categoryId: electronics.id },
    { sku: "EL-003", name: "USB-C Hub 7-in-1", price: 49.99, cost: 18, stock: 22, categoryId: electronics.id },
    { sku: "AP-001", name: "Premium Cotton Tee", price: 28.0, cost: 9, stock: 410, categoryId: apparel.id },
    { sku: "AP-002", name: "Slim Fit Hoodie", price: 64.0, cost: 22, stock: 4, categoryId: apparel.id },
    { sku: "AC-001", name: "Leather Watch Strap", price: 35.0, cost: 12, stock: 67, categoryId: accessories.id },
    { sku: "AC-002", name: "Aluminum Phone Stand", price: 24.99, cost: 7, stock: 0, categoryId: accessories.id },
    { sku: "EL-004", name: "Mechanical Keyboard", price: 159.0, cost: 62, stock: 18, categoryId: electronics.id },
  ];
  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        businessId: business.id,
        supplierId: supplier.id,
        warehouseId: warehouse.id,
        imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(p.sku)}`,
        reorderLevel: 10,
      },
    });
  }

  // Customers
  const customerData = [
    { name: "Riley Thompson", company: "Bright Coffee", email: "riley@brightcoffee.io", status: "WON", value: 12400 },
    { name: "Casey Morgan", company: "PixelStudio", email: "casey@pixelstudio.com", status: "QUALIFIED", value: 8200 },
    { name: "Avery Johnson", company: "GreenScape", email: "avery@greenscape.co", status: "PROPOSAL", value: 15500 },
    { name: "Drew Patel", company: "Northwind Co.", email: "drew@northwind.com", status: "NEW", value: 4200 },
    { name: "Quinn Lee", company: "Solo Designs", email: "quinn@solodesigns.com", status: "CONTACTED", value: 2800 },
  ];
  const customers = [];
  for (const c of customerData) {
    customers.push(
      await prisma.customer.create({
        data: { ...c, businessId: business.id, ownerId: manager.id },
      })
    );
  }

  // Project + tasks
  const project = await prisma.project.create({
    data: { name: "Q4 Launch Campaign", description: "Marketing & inventory prep for holiday push", businessId: business.id, color: "#6366f1" },
  });
  const project2 = await prisma.project.create({
    data: { name: "Warehouse Optimization", description: "Reduce fulfillment time by 30%", businessId: business.id, color: "#10b981" },
  });

  const taskSeed = [
    { title: "Finalize landing page copy", status: "TODO", priority: "HIGH", projectId: project.id, assigneeId: manager.id },
    { title: "Order new packaging materials", status: "TODO", priority: "MEDIUM", projectId: project2.id, assigneeId: employee.id },
    { title: "Photo shoot for new collection", status: "IN_PROGRESS", priority: "HIGH", projectId: project.id, assigneeId: employee.id },
    { title: "Audit Q3 numbers", status: "IN_PROGRESS", priority: "MEDIUM", projectId: project.id, assigneeId: owner.id },
    { title: "Draft email sequence", status: "REVIEW", priority: "MEDIUM", projectId: project.id, assigneeId: manager.id },
    { title: "Onboard new vendor", status: "DONE", priority: "LOW", projectId: project2.id, assigneeId: manager.id },
    { title: "Schedule team training", status: "DONE", priority: "LOW", projectId: project.id, assigneeId: owner.id },
  ];
  let pos = 0;
  for (const t of taskSeed) {
    await prisma.task.create({
      data: { ...t, businessId: business.id, createdById: owner.id, position: pos++ },
    });
  }

  // Channels + messages
  const general = await prisma.channel.create({
    data: {
      name: "general", description: "Company-wide announcements", businessId: business.id,
      members: {
        create: [{ userId: owner.id }, { userId: manager.id }, { userId: employee.id }],
      },
    },
  });
  const ops = await prisma.channel.create({
    data: {
      name: "ops", description: "Operations & logistics", businessId: business.id,
      members: { create: [{ userId: owner.id }, { userId: manager.id }] },
    },
  });
  await prisma.message.createMany({
    data: [
      { channelId: general.id, authorId: owner.id, content: "Welcome to LVL Ops, team!" },
      { channelId: general.id, authorId: manager.id, content: "Excited to be here. Let's ship." },
      { channelId: general.id, authorId: employee.id, content: "Q4 is going to be huge 🚀" },
      { channelId: ops.id, authorId: manager.id, content: "Let's review warehouse throughput at 3pm." },
    ],
  });

  // Invoices
  const inv1 = await prisma.invoice.create({
    data: {
      number: "INV-1001", status: "PAID", businessId: business.id, customerId: customers[0].id, createdById: owner.id,
      issueDate: new Date(Date.now() - 30 * 86400000),
      dueDate: new Date(Date.now() - 15 * 86400000),
      subtotal: 1240, tax: 124, total: 1364,
      items: { create: [{ description: "Consulting (10 hrs)", quantity: 10, unitPrice: 124, total: 1240 }] },
    },
  });
  const inv2 = await prisma.invoice.create({
    data: {
      number: "INV-1002", status: "SENT", businessId: business.id, customerId: customers[2].id, createdById: manager.id,
      issueDate: new Date(Date.now() - 5 * 86400000),
      dueDate: new Date(Date.now() + 25 * 86400000),
      subtotal: 4200, tax: 420, total: 4620,
      items: { create: [{ description: "Brand strategy package", quantity: 1, unitPrice: 4200, total: 4200 }] },
    },
  });
  const inv3 = await prisma.invoice.create({
    data: {
      number: "INV-1003", status: "OVERDUE", businessId: business.id, customerId: customers[1].id, createdById: manager.id,
      issueDate: new Date(Date.now() - 60 * 86400000),
      dueDate: new Date(Date.now() - 30 * 86400000),
      subtotal: 800, tax: 80, total: 880,
      items: { create: [{ description: "Web maintenance", quantity: 4, unitPrice: 200, total: 800 }] },
    },
  });

  // Expenses
  await prisma.expense.createMany({
    data: [
      { businessId: business.id, createdById: owner.id, description: "AWS hosting", amount: 432, category: "Infrastructure", date: new Date(Date.now() - 7 * 86400000) },
      { businessId: business.id, createdById: owner.id, description: "Office supplies", amount: 218, category: "Office", date: new Date(Date.now() - 12 * 86400000) },
      { businessId: business.id, createdById: manager.id, description: "Google Ads", amount: 1500, category: "Marketing", date: new Date(Date.now() - 3 * 86400000) },
      { businessId: business.id, createdById: manager.id, description: "Vendor invoice (packaging)", amount: 920, category: "Supplies", date: new Date(Date.now() - 22 * 86400000) },
    ],
  });

  // Attendance — generate last 14 days for employee + manager
  for (const u of [employee, manager]) {
    for (let d = 0; d < 14; d++) {
      const day = new Date();
      day.setDate(day.getDate() - d);
      day.setHours(9, Math.floor(Math.random() * 30), 0, 0);
      const out = new Date(day);
      out.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 50), 0, 0);
      const hours = (out.getTime() - day.getTime()) / 3600000;
      await prisma.attendance.create({
        data: {
          userId: u.id, businessId: business.id, clockIn: day, clockOut: out, hours,
          status: day.getMinutes() > 15 ? "LATE" : "PRESENT",
        },
      });
    }
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: owner.id, businessId: business.id, title: "Low stock alert", body: "Slim Fit Hoodie has only 4 units left", type: "WARNING", link: "/inventory" },
      { userId: owner.id, businessId: business.id, title: "Invoice paid", body: "Bright Coffee paid INV-1001 ($1,364)", type: "SUCCESS", link: "/invoices" },
      { userId: manager.id, businessId: business.id, title: "New task assigned", body: "Finalize landing page copy", type: "INFO", link: "/tasks" },
    ],
  });

  console.log("✅ Seed complete. Demo accounts:");
  console.log("   owner@test.com / Test1234!");
  console.log("   manager@test.com / Test1234!");
  console.log("   employee@test.com / Test1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
