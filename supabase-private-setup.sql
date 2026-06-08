alter table public.finance_entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.finance_entries
  add column if not exists entry_type text not null default 'expense';

alter table public.finance_entries
  drop constraint if exists finance_entries_entry_type_check;

alter table public.finance_entries
  add constraint finance_entries_entry_type_check
  check (entry_type in ('expense', 'credit', 'reserve'));

alter table public.finance_plan_overrides
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create table if not exists public.finance_plan_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.finance_recurring_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount > 0),
  flow text not null check (flow in ('expense', 'income', 'saving')),
  frequency text not null check (frequency in ('once', 'weekly', 'fortnightly', 'monthly', 'bimonthly', 'quarterly', 'biannually', 'annually')),
  next_due_date date not null,
  category text not null,
  subcategory text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.finance_recurring_items
  drop constraint if exists finance_recurring_items_frequency_check;

alter table public.finance_recurring_items
  add constraint finance_recurring_items_frequency_check
  check (frequency in ('once', 'weekly', 'fortnightly', 'monthly', 'bimonthly', 'quarterly', 'biannually', 'annually'));

create index if not exists finance_entries_user_id_idx
  on public.finance_entries (user_id);

create index if not exists finance_plan_overrides_user_id_idx
  on public.finance_plan_overrides (user_id);

create index if not exists finance_recurring_items_user_id_idx
  on public.finance_recurring_items (user_id);

alter table public.finance_entries enable row level security;
alter table public.finance_plan_overrides enable row level security;
alter table public.finance_plan_data enable row level security;
alter table public.finance_recurring_items enable row level security;

drop policy if exists "Prototype can read entries" on public.finance_entries;
drop policy if exists "Prototype can insert entries" on public.finance_entries;
drop policy if exists "Prototype can update entries" on public.finance_entries;
drop policy if exists "Prototype can delete entries" on public.finance_entries;

drop policy if exists "Private users can read entries" on public.finance_entries;
drop policy if exists "Private users can insert entries" on public.finance_entries;
drop policy if exists "Private users can update entries" on public.finance_entries;
drop policy if exists "Private users can delete entries" on public.finance_entries;

create policy "Private users can read entries"
  on public.finance_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Private users can insert entries"
  on public.finance_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Private users can update entries"
  on public.finance_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Private users can delete entries"
  on public.finance_entries for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Prototype can read plan overrides" on public.finance_plan_overrides;
drop policy if exists "Prototype can insert plan overrides" on public.finance_plan_overrides;
drop policy if exists "Prototype can update plan overrides" on public.finance_plan_overrides;
drop policy if exists "Prototype can delete plan overrides" on public.finance_plan_overrides;

drop policy if exists "Private users can read plan overrides" on public.finance_plan_overrides;
drop policy if exists "Private users can insert plan overrides" on public.finance_plan_overrides;
drop policy if exists "Private users can update plan overrides" on public.finance_plan_overrides;
drop policy if exists "Private users can delete plan overrides" on public.finance_plan_overrides;

create policy "Private users can read plan overrides"
  on public.finance_plan_overrides for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Private users can insert plan overrides"
  on public.finance_plan_overrides for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Private users can update plan overrides"
  on public.finance_plan_overrides for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Private users can delete plan overrides"
  on public.finance_plan_overrides for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Private users can read plan data" on public.finance_plan_data;
drop policy if exists "Private users can insert plan data" on public.finance_plan_data;
drop policy if exists "Private users can update plan data" on public.finance_plan_data;
drop policy if exists "Private users can delete plan data" on public.finance_plan_data;

create policy "Private users can read plan data"
  on public.finance_plan_data for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Private users can insert plan data"
  on public.finance_plan_data for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Private users can update plan data"
  on public.finance_plan_data for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Private users can delete plan data"
  on public.finance_plan_data for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Private users can read recurring items" on public.finance_recurring_items;
drop policy if exists "Private users can insert recurring items" on public.finance_recurring_items;
drop policy if exists "Private users can update recurring items" on public.finance_recurring_items;
drop policy if exists "Private users can delete recurring items" on public.finance_recurring_items;

create policy "Private users can read recurring items"
  on public.finance_recurring_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Private users can insert recurring items"
  on public.finance_recurring_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Private users can update recurring items"
  on public.finance_recurring_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Private users can delete recurring items"
  on public.finance_recurring_items for delete
  to authenticated
  using (auth.uid() = user_id);
