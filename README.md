# Joyguru Enterprise

Production-oriented ecommerce foundation for Joyguru Enterprise, a handmade clayware manufacturer and wholesale supplier in India.

## Stack

Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS · Framer Motion · GSAP · Lenis · Three.js · Prisma · PostgreSQL/Supabase · Razorpay · Resend · Discord Webhook.

## Local setup

1. Install Node.js 20+ and PostgreSQL (or create a Supabase project).
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` and the providers you intend to use.
3. Install dependencies: `npm install`.
4. Create the schema and seed the catalog: `npm run db:push && npm run db:seed`.
5. Start the app: `npm run dev`.

### No-database mode

The public storefront is intentionally resilient when `DATABASE_URL` is missing or PostgreSQL/Supabase is unavailable. Public product, category, search and product-detail reads use `safeQuery()` and fall back to the local catalog in `lib/demo-data.ts`. The hero, storytelling sections, gallery, navigation and footer are static-first and remain available. Checkout, login, account, orders and admin correctly remain backend-dependent.

The seed creates 24 curated products across five collections so the storefront, filters, inventory and checkout can be verified end to end.

## Enterprise admin extensions

The first enterprise extension pass adds:

- `/admin/media` — Cloudflare R2 presigned uploads, multi-file upload, progress, search, grid/list view, copy URL and bulk delete.
- `/admin/page-builder` — typed homepage block editor with reorder, duplicate, delete, undo/redo, draft save and publish.
- `/admin/settings` — configuration CMS backed by the existing `SiteSetting` model.
- `/manifest.webmanifest`, `/sw.js`, `/offline` — installable PWA shell and offline fallback.

Configure the R2 variables in `.env.local` before using the media upload flow. The media API intentionally returns a configuration error until R2 is configured; it does not store fake assets.

## Payment setup

- Configure Razorpay keys and set the webhook endpoint to `/api/razorpay/webhook` for `payment.captured`.
- Configure `RESEND_API_KEY` and a verified `EMAIL_FROM` for transactional email.
- Configure `DISCORD_WEBHOOK_URL` for operational notifications. Discord delivery is fire-and-forget, retries up to three times with a five-second timeout, and never blocks checkout/auth responses. Set optional `DISCORD_BRAND_IMAGE_URL` to a publicly reachable brand image for embed thumbnails.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment notes

The application uses standard Next.js Node runtime APIs for Prisma, secure cookies, email and Razorpay. Vercel and a Dockerized Node deployment are supported. Cloudflare Workers require a Next.js-compatible Node/Workers adapter and an edge-safe database driver; do not point a raw Workers runtime at the Node Prisma routes without that adapter.
