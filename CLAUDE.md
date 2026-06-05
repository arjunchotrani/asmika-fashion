# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ashmika Fashion is a full-stack luxury fashion e-commerce platform — a monorepo with three applications:

- **Frontend** (/frontend): Customer-facing Next.js storefront with premium dark luxury UI
- **Admin Panel** (/admin-panel): Next.js management dashboard (Shopify luxury admin aesthetic)
- **Backend** (/backend): Cloudflare Workers + Hono API with Supabase PostgreSQL and Cloudflare R2

## Core Rules

- Preserve the premium dark luxury UI — do not alter brand aesthetic without explicit instruction
- Do not break existing CRUD operations or remove working APIs
- Use TypeScript strictly throughout
- Preserve SEO architecture (meta tags, structured data, canonical URLs)
- Preserve R2 upload system — product images are stored in Cloudflare R2, URLs in Supabase
- Prefer incremental edits over full rewrites

## UI Direction

- Shopify luxury admin inspiration for admin panel
- Minimal premium textile aesthetic across storefront
- Rich hover states, soft gradients, strong typographic hierarchy
- Frontend uses Tailwind v4 with `@theme` block syntax (no tailwind.config.js); theme tokens in /frontend/src/app/globals.css

## Architecture

### Database (Supabase PostgreSQL)
- admins: JWT-authenticated admin users (PBKDF2 password hashing via Web Crypto API)
- categories, subcategories: hierarchical taxonomy, status (draft/published/archived)
- products, product_images: gallery support, soft-delete via status field
- collections: themed product groupings
- enquiries: customer inquiries, soft-deleted via archived flag

All tables have automatic `updated_at` triggers. Use status fields for soft deletes — never hard-delete products, categories, or collections.

### Backend API (/backend)
Entry point: `/backend/src/index.ts` — Hono router with structured route modules.

- **Public**: product listing/detail, enquiry submission, collections, categories
- **Protected**: all admin CRUD — enforced by `authMiddleware` (JWT validation)
- **Validation**: Zod schemas in `/backend/src/validators/` on every POST/PUT
- **Uploads**: `POST /api/uploads` — streams to Cloudflare R2; returns public URL stored in Supabase

Environment config in `/backend/.dev.vars` (local) — never commit secrets.

### Frontend (/frontend)
- Next.js App Router; pages in `/src/app/`
- Sections in `/src/sections/` (Hero, Collections, BrandStory, NewArrivals, ProductShowcase)
- Tailwind v4 + Framer Motion + next-themes (dark/light toggle)
- Custom cursor and grain overlay implemented via inline script in root layout

### Admin Panel (/admin-panel)
- Protected routes under `/(admin)/` group; `middleware.ts` enforces JWT presence
- Form components in `/src/components/forms/` — product, category, collection, enquiry
- API calls via `lib/api.ts` (`apiFetch`) — injects Authorization header, redirects on 401
- Toast notifications via Sonner

## Development Commands

**Frontend:**
```bash
cd frontend && npm run dev      # localhost:3000
cd frontend && npm run build
cd frontend && npm run lint
```

**Admin Panel:**
```bash
cd admin-panel && npm run dev   # localhost:3000 (or 3001)
cd admin-panel && npm run build
cd admin-panel && npm run lint
```

**Backend (Cloudflare Workers):**
```bash
cd backend && npm run dev       # localhost:8787 via Wrangler
cd backend && npm run deploy    # deploy to Cloudflare
cd backend && npm run test-all
cd backend && npm run create-admin  # one-time admin setup
```

## Environment Setup

**Backend** — `/backend/.dev.vars`:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

**Admin Panel** — `/admin-panel/.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8787
```

## Common Tasks

**Adding a product field:** validator → Supabase schema → admin form → route handler (in that order).

**Deploy backend:** `cd backend && npm run deploy` — live immediately on Cloudflare Workers.

**R2 uploads:** always go through `POST /api/uploads`; never bypass this route or store images elsewhere.
