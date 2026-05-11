-- Hilful Fuzul fund: donors, donations, expenses, receipts, audit trail + public read model.
-- Apply with Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.donors (
  id uuid primary key default gen_random_uuid (),
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid (),
  donor_id uuid references public.donors (id) on delete set null,
  amount_bdt numeric(14, 2) not null check (amount_bdt > 0),
  payment_method text not null default 'cash',
  reference_note text,
  received_at timestamptz not null default now(),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donations_received_at_idx on public.donations (received_at desc);
create index if not exists donations_published_idx on public.donations (is_published) where is_published = true;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid (),
  category text not null,
  amount_bdt numeric(14, 2) not null check (amount_bdt > 0),
  description text not null,
  beneficiary_note text,
  spent_at timestamptz not null default now(),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_spent_at_idx on public.expenses (spent_at desc);
create index if not exists expenses_published_idx on public.expenses (is_published) where is_published = true;

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid (),
  receipt_no text not null unique,
  donation_id uuid not null unique references public.donations (id) on delete restrict,
  extra_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists receipts_receipt_no_idx on public.receipts (receipt_no);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid (),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists donations_set_updated_at on public.donations;
create trigger donations_set_updated_at
before update on public.donations
for each row
execute procedure public.set_updated_at ();

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
before update on public.expenses
for each row
execute procedure public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- Public transparency view + RPC sums
-- ---------------------------------------------------------------------------

create or replace view public.transparency_ledger as
select
  d.id,
  'donation'::text as kind,
  d.received_at as occurred_at,
  d.reference_note as description,
  d.amount_bdt as amount_in,
  null::numeric as amount_out
from public.donations d
where d.is_published = true
union all
select
  e.id,
  'expense'::text as kind,
  e.spent_at as occurred_at,
  e.description as description,
  null::numeric as amount_in,
  e.amount_bdt as amount_out
from public.expenses e
where e.is_published = true;

create or replace function public.transparency_sums ()
returns table (total_donations numeric, total_expenses numeric)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce((select sum(amount_bdt) from public.donations), 0) as total_donations,
    coalesce((select sum(amount_bdt) from public.expenses), 0) as total_expenses;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.donors enable row level security;
alter table public.donations enable row level security;
alter table public.expenses enable row level security;
alter table public.receipts enable row level security;
alter table public.audit_logs enable row level security;

-- Donors: internal only (RLS on; no anon/authenticated policies — use service role on server).

-- Donations: public may read published rows only.
create policy "Public read published donations"
on public.donations
for select
to anon, authenticated
using (is_published = true);

-- Expenses: public may read published rows only.
create policy "Public read published expenses"
on public.expenses
for select
to anon, authenticated
using (is_published = true);

-- Receipts: verifiable when linked donation is published.
create policy "Public read receipts for published donations"
on public.receipts
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.donations d
    where d.id = receipts.donation_id
      and d.is_published = true
  )
);

-- Audit logs: RLS on; no client policies (server uses service role only).

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.transparency_ledger to anon, authenticated;

grant select on public.donations to anon, authenticated;
grant select on public.expenses to anon, authenticated;
grant select on public.receipts to anon, authenticated;

grant execute on function public.transparency_sums () to anon, authenticated;
