-- ========================================================
-- Zapols Restaurant & Lounge: Supabase Database Setup
-- Run this in the Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_id text not null unique,
  customer_name text not null,
  customer_location text not null,
  summary text not null,
  notes text default '',
  total numeric not null default 0,
  payment_method text not null,
  packaging text not null default 'takeaway',
  pickup_code text not null,
  status text not null default 'pending' check (status in ('pending', 'packed', 'delivered')),
  items_json jsonb default '[]'::jsonb
);

-- 2. Indexes for high performance
create index if not exists idx_orders_order_id on public.orders (order_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- 4. Set RLS policies for ordering & kitchen management
create policy "Allow anonymous insert orders" 
  on public.orders for insert 
  with check (true);

create policy "Allow anonymous select orders" 
  on public.orders for select 
  using (true);

create policy "Allow anonymous update orders" 
  on public.orders for update 
  using (true)
  with check (true);

create policy "Allow anonymous delete orders" 
  on public.orders for delete 
  using (true);

-- 5. Enable Supabase Realtime on orders table
alter publication supabase_realtime add table public.orders;
