alter table public.finance_entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.finance_entries
  add column if not exists entry_type text not null default 'expense';

alter table public.finance_entries
  add column if not exists linked_account_id text;

alter table public.finance_entries
  add column if not exists description text;

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
  end_date date,
  occurrence_limit integer check (occurrence_limit is null or occurrence_limit > 0),
  category text not null,
  subcategory text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.finance_net_worth_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('asset', 'liability')),
  group_name text not null,
  subtype text not null,
  name text not null,
  base_value numeric not null default 0 check (base_value >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.finance_recurring_occurrence_status (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  recurring_item_id text not null,
  occurrence_date date not null,
  completed boolean not null default true,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.finance_recurring_items
  drop constraint if exists finance_recurring_items_frequency_check;

alter table public.finance_recurring_items
  add constraint finance_recurring_items_frequency_check
  check (frequency in ('once', 'weekly', 'fortnightly', 'monthly', 'bimonthly', 'quarterly', 'biannually', 'annually'));

alter table public.finance_recurring_items
  add column if not exists end_date date;

alter table public.finance_recurring_items
  add column if not exists occurrence_limit integer;

alter table public.finance_recurring_items
  drop constraint if exists finance_recurring_items_occurrence_limit_check;

alter table public.finance_recurring_items
  add constraint finance_recurring_items_occurrence_limit_check
  check (occurrence_limit is null or occurrence_limit > 0);

create index if not exists finance_entries_user_id_idx
  on public.finance_entries (user_id);

create index if not exists finance_plan_overrides_user_id_idx
  on public.finance_plan_overrides (user_id);

create index if not exists finance_recurring_items_user_id_idx
  on public.finance_recurring_items (user_id);

create index if not exists finance_net_worth_items_user_id_idx
  on public.finance_net_worth_items (user_id);

create index if not exists finance_recurring_occurrence_status_user_id_idx
  on public.finance_recurring_occurrence_status (user_id);

alter table public.finance_entries enable row level security;
alter table public.finance_plan_overrides enable row level security;
alter table public.finance_plan_data enable row level security;
alter table public.finance_recurring_items enable row level security;
alter table public.finance_net_worth_items enable row level security;
alter table public.finance_recurring_occurrence_status enable row level security;

create or replace function public.keep_newer_finance_record()
returns trigger
language plpgsql
as $$
begin
  if old.updated_at is not null
    and new.updated_at is not null
    and new.updated_at < old.updated_at then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists finance_entries_keep_newer on public.finance_entries;
create trigger finance_entries_keep_newer
  before update on public.finance_entries
  for each row execute function public.keep_newer_finance_record();

drop trigger if exists finance_recurring_items_keep_newer on public.finance_recurring_items;
create trigger finance_recurring_items_keep_newer
  before update on public.finance_recurring_items
  for each row execute function public.keep_newer_finance_record();

drop trigger if exists finance_net_worth_items_keep_newer on public.finance_net_worth_items;
create trigger finance_net_worth_items_keep_newer
  before update on public.finance_net_worth_items
  for each row execute function public.keep_newer_finance_record();

drop trigger if exists finance_recurring_occurrence_status_keep_newer on public.finance_recurring_occurrence_status;
create trigger finance_recurring_occurrence_status_keep_newer
  before update on public.finance_recurring_occurrence_status
  for each row execute function public.keep_newer_finance_record();

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

drop policy if exists "Private users can read net worth items" on public.finance_net_worth_items;
drop policy if exists "Private users can insert net worth items" on public.finance_net_worth_items;
drop policy if exists "Private users can update net worth items" on public.finance_net_worth_items;
drop policy if exists "Private users can delete net worth items" on public.finance_net_worth_items;

create policy "Private users can read net worth items"
  on public.finance_net_worth_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Private users can insert net worth items"
  on public.finance_net_worth_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Private users can update net worth items"
  on public.finance_net_worth_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Private users can delete net worth items"
  on public.finance_net_worth_items for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Private users can read recurring occurrence status" on public.finance_recurring_occurrence_status;
drop policy if exists "Private users can insert recurring occurrence status" on public.finance_recurring_occurrence_status;
drop policy if exists "Private users can update recurring occurrence status" on public.finance_recurring_occurrence_status;
drop policy if exists "Private users can delete recurring occurrence status" on public.finance_recurring_occurrence_status;

create policy "Private users can read recurring occurrence status"
  on public.finance_recurring_occurrence_status for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Private users can insert recurring occurrence status"
  on public.finance_recurring_occurrence_status for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Private users can update recurring occurrence status"
  on public.finance_recurring_occurrence_status for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Private users can delete recurring occurrence status"
  on public.finance_recurring_occurrence_status for delete
  to authenticated
  using (auth.uid() = user_id);
