-- EduSwap Full Schema
create extension if not exists "uuid-ossp";
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique, full_name text, phone text, university text,
  is_seller boolean default false, is_delivery_partner boolean default false, is_admin boolean default false,
  cashfree_beneficiary_id text, avatar_url text, created_at timestamptz default now()
);
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.profiles(id) on delete cascade not null,
  title text not null, description text, category text not null, subject text, course_code text,
  condition text not null check (condition in ('New','Like New','Good','Fair','Poor')),
  price integer not null check (price >= 0), images text[] default '{}',
  status text not null default 'active' check (status in ('active','sold','hidden','pending')),
  created_at timestamptz default now()
);
create index if not exists idx_listings_status on public.listings(status);
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.listings(id) not null,
  buyer_id uuid references public.profiles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  delivery_partner_id uuid references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','confirmed','picked_up','in_transit','delivered','cancelled','refunded')),
  total_amount integer not null, platform_fee integer not null, delivery_fee integer not null, seller_earnings integer not null,
  cashfree_order_id text unique, cashfree_payment_id text,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  delivery_address text, created_at timestamptz default now()
);
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  listing_id uuid references public.listings(id) not null, quantity integer default 1, price integer not null
);
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null, content text not null, created_at timestamptz default now()
);
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) not null, reviewer_id uuid references public.profiles(id) not null,
  reviewee_id uuid references public.profiles(id) not null, rating integer check (rating between 1 and 5), comment text, created_at timestamptz default now(), unique(order_id, reviewer_id)
);
create table if not exists public.delivery_assignments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null, partner_id uuid references public.profiles(id) not null,
  status text default 'assigned', assigned_at timestamptz default now(), completed_at timestamptz
);
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.delivery_assignments enable row level security;
alter table public.order_items enable row level security;
drop policy if exists "profiles readable" on public.profiles; create policy "profiles readable" on public.profiles for select using (true);
drop policy if exists "profiles upsert own" on public.profiles; create policy "profiles upsert own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles; create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "listings readable" on public.listings; create policy "listings readable" on public.listings for select using (true);
drop policy if exists "listings insert seller" on public.listings; create policy "listings insert seller" on public.listings for insert with check (auth.uid() = seller_id);
drop policy if exists "listings update own" on public.listings; create policy "listings update own" on public.listings for update using (auth.uid() = seller_id);
drop policy if exists "listings delete own" on public.listings; create policy "listings delete own" on public.listings for delete using (auth.uid() = seller_id);
drop policy if exists "orders readable involved" on public.orders; create policy "orders readable involved" on public.orders for select using (auth.uid() = buyer_id or auth.uid() = seller_id or auth.uid() = delivery_partner_id);
drop policy if exists "orders insert buyer" on public.orders; create policy "orders insert buyer" on public.orders for insert with check (auth.uid() = buyer_id);
drop policy if exists "orders update involved" on public.orders; create policy "orders update involved" on public.orders for update using (auth.uid() = buyer_id or auth.uid() = seller_id or auth.uid() = delivery_partner_id);
drop policy if exists "order_items readable" on public.order_items; create policy "order_items readable" on public.order_items for select using (true);
drop policy if exists "order_items insert" on public.order_items; create policy "order_items insert" on public.order_items for insert with check (true);
drop policy if exists "messages readable participants" on public.messages; create policy "messages readable participants" on public.messages for select using (exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid() or o.delivery_partner_id = auth.uid())));
drop policy if exists "messages insert participants" on public.messages; create policy "messages insert participants" on public.messages for insert with check (exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())));
drop policy if exists "reviews readable" on public.reviews; create policy "reviews readable" on public.reviews for select using (true);
drop policy if exists "reviews insert reviewer" on public.reviews; create policy "reviews insert reviewer" on public.reviews for insert with check (auth.uid() = reviewer_id);
drop policy if exists "delivery_assignments readable" on public.delivery_assignments; create policy "delivery_assignments readable" on public.delivery_assignments for select using (true);
drop policy if exists "delivery_assignments insert" on public.delivery_assignments; create policy "delivery_assignments insert" on public.delivery_assignments for insert with check (auth.uid() = partner_id);
create or replace function public.handle_new_user() returns trigger as $$ begin insert into public.profiles (id, full_name, username) values (new.id, new.raw_user_meta_data->>'full_name', new.email); return new; end; $$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
