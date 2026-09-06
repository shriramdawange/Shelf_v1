# Shelf — Curated Books for Students 🇮🇳

Buy-only bookstore for second-hand academic & fiction books. No chats, no exchange, no haggling — just browse, buy, and get delivery.

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, next-themes
- Supabase (Auth, PostgreSQL, Realtime, RLS), Zustand
- Cloudinary (25GB free, f_auto/q_auto, 300x300 thumb / 800x600 medium)
- Cashfree PG + Payouts (UPI/Card/Netbanking)

## Quick Start
```bash
npm install
cp .env.example .env.local # fill vars
npm run dev # http://localhost:3000
```

## Env Vars
See `.env.example`. Need Supabase URL/keys, Cloudinary cloudName + `eduswap_unsigned` preset, Cashfree sandbox keys, `NEXT_PUBLIC_APP_URL`.

## Flow (Buy-only, no contact)
`sellers list Books` → `buyer Browse /cart` → `/checkout` (pincode + phone) → `POST /api/cashfree/create-order` → `payment_session_id` → `<CashfreeCheckout>` → `POST /api/webhooks/cashfree` (HMAC) → `orders` → delivery.
- Split: platform 15% + ₹40 delivery, seller 85%
- No chat, no P2P negotiation — price is final

## Supabase
Run `supabase/migrations/001_initial.sql` + `002_book_only.sql`. Enable Realtime for `orders`. RLS as per migration.
Tables: profiles, listings (category = 'Books'), orders, order_items, reviews, delivery_assignments.

Cloudinary: unsigned preset `eduswap_unsigned`, folder `shelf/books/`.

## Key Paths
- `/` - curated hero + featured books
- `/browse` - search (title, subject, course_code) + condition + price
- `/listings/[id]` - gallery + Add to Cart / Buy Now
- `/listings/new` - sell a book (Books only)
- `/cart` → `/checkout` → Cashfree → `/orders/[id]` (live timeline, no chat)
- `/orders`, `/delivery`, `/admin`
- Auth: `/login`, `/register`

## Deploy (Vercel)
Push to git, import, set env vars, set Cashfree webhook to `https://your-url/api/webhooks/cashfree`, run migrations.

## Demo without Supabase/Cashfree
App runs in demo mode: browse shows sample books, checkout demo-confirms order.
