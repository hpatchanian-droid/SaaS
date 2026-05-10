# LVL Ops — All-in-one Business Operations Platform

A modern, production-style SaaS platform that combines inventory management, team operations, CRM, finance, realtime chat, analytics and AI insights into one beautifully integrated workspace.

> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · NextAuth · TanStack Query · Recharts · Framer Motion · SQLite (default) / PostgreSQL (production)

---

## Quick start

```bash
# 1. Install dependencies (also runs prisma generate, db push and seed)
npm install

# 2. Start dev server
npm run dev

# 3. Open
http://localhost:3000
```

The `postinstall` script automatically:

1. Generates the Prisma client
2. Creates the SQLite database (`prisma/dev.db`)
3. Pushes the schema
4. Seeds three demo accounts and a workspace full of realistic sample data

### Demo accounts

| Role     | Email                | Password    |
| -------- | -------------------- | ----------- |
| Owner    | `owner@test.com`     | `Test1234!` |
| Manager  | `manager@test.com`   | `Test1234!` |
| Employee | `employee@test.com`  | `Test1234!` |

> The login page has one-click "fill demo" buttons.

---

## Features

### Landing
- Animated hero, mesh gradients, testimonials, pricing, FAQ, footer
- Fully responsive

### Auth
- Email + password (NextAuth credentials provider, bcrypt-hashed)
- Sign up, sign in, forgot password flows
- JWT-backed sessions, role-based middleware
- Three roles: `OWNER`, `MANAGER`, `EMPLOYEE`

### Dashboard
- Live KPIs (revenue, outstanding, customers, inventory)
- Revenue/Expenses area chart, tasks by status pie, top products bar
- AI Insights panel with deterministic, data-driven generation

### Inventory
- Full product CRUD, stock-in/stock-out/adjust with audit trail
- Categories, suppliers, warehouses, low-stock alerts
- Auto SKU generation, search, low-stock filter
- Inline notifications when stock drops below reorder

### CRM / Customers
- Full customer CRUD, lead pipeline by stage
- Customer detail view with timeline of activities (notes, calls, emails)
- Linked to invoices

### Tasks & Projects
- Drag-and-drop Kanban with 4 columns
- Priorities, due dates, project tags, assignees
- Project pages and per-project task filtering

### Team & Attendance
- Add/edit/deactivate team members, set roles & pay
- Live time tracker with clock-in / clock-out
- Stats: hours logged, late arrivals, sessions

### Finance
- Invoice generator with line items, tax, customer linking
- Printable invoice page (`window.print()`)
- Mark as paid, delete, status transitions
- Expense logging with categories

### Messaging
- Realtime team channels via **Server-Sent Events**
- Per-channel feed, member list, channel creation
- Auto-grouping consecutive messages from the same author

### Analytics
- Profit trend (line), revenue/expenses (bar), customer pipeline (pie), expenses by category
- All charts render from real database queries

### Notifications
- In-app notification center with unread badge in topbar (auto-polls every 15s)
- Generated server-side from real events (low stock, paid invoice, task assigned, etc.)

### Settings
- Profile, business, appearance (theme), security (password change)

### UX polish
- Dark + light mode (next-themes)
- Command palette (⌘K) for navigation & quick actions
- Mobile bottom navigation, responsive sidebar
- Toast notifications, loading skeletons, empty states, smooth animations

### Security
- Password hashing (bcrypt)
- JWT sessions, server-side `requireUser()` for every API
- Per-business data isolation on every query
- Zod validation on all API inputs
- Audit log table for sensitive mutations

---

## Project structure

```
src/
├── app/
│   ├── (marketing)/page.tsx          ← landing
│   ├── (auth)/{login,register,forgot-password}
│   ├── (app)/                        ← authenticated app
│   │   ├── layout.tsx                ← sidebar + topbar
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── customers/[id]
│   │   ├── tasks/
│   │   ├── projects/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── invoices/[id]
│   │   ├── expenses/
│   │   ├── messages/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── settings/
│   ├── api/                          ← REST API routes
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                           ← shadcn-style primitives
│   ├── dashboard/                    ← sidebar, topbar, command palette
│   ├── inventory/, customers/, tasks/, invoices/
├── lib/
│   ├── prisma.ts                     ← shared client
│   ├── auth.ts                       ← NextAuth options + helpers
│   ├── events.ts                     ← in-process pub/sub
│   └── utils.ts
├── middleware.ts                     ← route protection
└── types/next-auth.d.ts
prisma/
├── schema.prisma                     ← 20+ models
└── seed.ts                           ← realistic demo data
```

---

## Switching to PostgreSQL / Supabase

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Update `DATABASE_URL` in `.env` to your Postgres connection string.
3. Run:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

The schema avoids native enums so it works on both providers.

---

## Deployment

### Vercel
1. Push repo to GitHub.
2. Import in Vercel.
3. Add env vars (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
4. Deploy. The `build` script runs `prisma generate && prisma migrate deploy && next build`.

### Docker
```bash
docker compose up --build
```
Spins up a PostgreSQL 16 container and the app on `:3000`.

---

## Available scripts

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start the dev server                |
| `npm run build`      | Production build (incl. migrations) |
| `npm start`          | Run the production build            |
| `npm run lint`       | ESLint                              |
| `npm run typecheck`  | TypeScript only                     |
| `npm run db:push`    | Sync schema to DB (no migrations)   |
| `npm run db:migrate` | Create + apply a new migration      |
| `npm run db:seed`    | Run seed                            |
| `npm run db:reset`   | Wipe & reseed                       |

---

## License

MIT
