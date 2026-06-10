alter table public.finance_entries
  add column if not exists description text;
