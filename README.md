# EduSwap - Educational Marketplace MVP 🇮🇳

Full-stack Next.js 14 marketplace for students to buy/sell books, notes, lab equipment with Cloudinary + Cashfree + Supabase.

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, next-themes
- Supabase (Auth, PostgreSQL, Realtime, RLS), Zustand, TanStack Query
- Cloudinary (25GB free, f_auto/q_auto, thumbs 300x300, medium 800x600)
- Cashfree PG + Payouts (UPI/Card/Netbanking), Axios

## Quick Start
```bash
npm install
cp .env.example .env.local # fill vars
npm run dev # http://localhost:3000
```

## Env Vars
See `.env.example`. Need Supabase URL/keys, Cloudinary cloudName/apiKey/secret + upload preset `eduswap_unsigned` (unsigned), Cashfree App ID/Secret, webhook secret, `NEXT_PUBLIC_APP_URL`.

## Cashfree Setup
1. Create account https://www.cashfree.com → Dashboard → Developers → API Keys
2. Apply for Payouts product separately
3. Set webhook URL: `https://yourdomain.com/api/webhooks/cashfree`
4. Test with sandbox credentials (`CASHFREE_ENV=sandbox`)

**Flow:** Buyer Buy Now → POST `/api/cashfree/create-order` → `payment_session_id` → `<CashfreeCheckout>` (cashfree-js) → redirect → webhook `POST /api/webhooks/cashfree` verifies `x-webhook-signature` (HMAC sha256 base64) → updates `orders` → notify seller → delivery.

Split: platform 15% + ₹40 delivery, seller gets 85%. Payout via `createPayout` to beneficiary UPI/bank (weekly).

## Supabase
Run `supabase/migrations/001_initial.sql` in SQL Editor. Enable Realtime for `messages` + `orders`. Configure Google OAuth in Auth settings. Set RLS policies as in migration.

Tables: profiles, listings, orders, order_items, messages, reviews, delivery_assignments. See migration for schema.

Cloudinary: Create unsigned upload preset `eduswap_unsigned`, folder `eduswap/listings/{user_id}/`, delivery `f_auto,q_auto`.

## Key Paths
- `/` - landing + featured
- `/browse` - search/filter (category, subject, course_code, price, condition)
- `/listings/[id]` - gallery + add to cart
- `/listings/new` - create (Cloudinary upload)
- `/cart` → `/checkout` → Cashfree → `/orders/[id]` (tracking + WhatsApp-style chat via Realtime)
- `/delivery` - partner accepts jobs, updates status
- `/admin` - moderation, payouts, revenue, CSV export
- Auth: `/login`, `/register` (email + Google OAuth, roles: buyer/seller/delivery/admin)

## Deploy (Vercel)
- Push to git, import in Vercel, set env vars, set Cashfree webhook to `https://your-vercel-url/api/webhooks/cashfree`, run migration.

## Production Checklist
- Add Cashfree IP whitelist, domain to return URLs
- Add Sentry/Vercel Analytics, PWA icons
- Rate limit payment endpoints, validate image type/size, XSS/CSRF via Next.js defaults
- ARIA labels, keyboard nav, skeletons, toasts, empty states done

## Demo without Supabase/Cashfree
App works in demo mode: browse shows sample data, checkout creates local demo order, chat/payout show toasts. Configure env for full functionality.
