-- Shelf: enforce Books-only + remove P2P chat
-- Run after 001_initial.sql

-- 1. Drop P2P chat (messages) — no contact between buyer/seller
drop table if exists public.messages cascade;

-- 2. Enforce Books-only for new listings
alter table public.listings drop constraint if exists listings_category_check;
-- Keep category column but constrain to Books for new data (existing other categories will be migrated)
update public.listings set category = 'Books' where category != 'Books';
alter table public.listings add constraint listings_category_books check (category = 'Books');

-- 3. Remove messages RLS policies if they still exist (safety)
drop policy if exists "messages readable participants" on public.messages;
drop policy if exists "messages insert participants" on public.messages;

-- 4. Disable realtime on messages (if enabled)
-- do this in dashboard: Realtime -> remove messages table
