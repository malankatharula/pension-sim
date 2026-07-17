-- ═══════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  date_of_birth date,
  currency      text not null default 'LKR',
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ═══════════════════════════════════════
-- SIMULATIONS
-- ═══════════════════════════════════════
create table public.simulations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null default 'My Plan',

  starting_age    integer not null,
  retirement_age  integer not null,
  payments        jsonb not null,
  annual_rate_conservative  numeric(6,4) not null,
  annual_rate_optimistic    numeric(6,4) not null,
  annual_rate_fd_lock       numeric(6,4) not null,
  annual_rate_liquid        numeric(6,4) not null,
  inflation_rate            numeric(6,4) not null,
  wht_rate                  numeric(5,4) not null,
  mc_iterations             integer not null default 5000,
  mc_mu                     numeric(6,4) not null,
  mc_sigma                  numeric(6,4) not null,

  results         jsonb not null,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_simulations_user_id on public.simulations(user_id);
create index idx_simulations_created_at on public.simulations(created_at desc);


-- ═══════════════════════════════════════
-- GOAL PLANS
-- ═══════════════════════════════════════
create table public.goal_plans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  simulation_id   uuid references public.simulations(id) on delete set null,
  name            text not null default 'My Goals',

  monthly_income  numeric(12,2) not null,

  goal_retirement_target   numeric(14,2) not null,
  goal_emergency_target    numeric(14,2) not null,
  goal_housing_target      numeric(14,2) not null,
  goal_education_target    numeric(14,2) not null,

  priority_retirement  integer not null default 5,
  priority_emergency   integer not null default 1,
  priority_housing     integer not null default 2,
  priority_education    integer not null default 3,

  allocation      jsonb not null,

  created_at      timestamptz not null default now()
);

create index idx_goal_plans_user_id on public.goal_plans(user_id);


-- ═══════════════════════════════════════
-- APP CONFIG
-- ═══════════════════════════════════════
create table public.app_config (
  key         text primary key,
  value       text not null,
  description text,
  updated_at  timestamptz not null default now()
);


-- ═══════════════════════════════════════
-- FD RATES
-- ═══════════════════════════════════════
create table public.fd_rates (
  id          uuid primary key default gen_random_uuid(),
  bank_name   text not null,
  term_months integer not null,
  rate        numeric(5,4) not null,
  min_amount  numeric(12,2),
  notes       text,
  as_of_date  date not null default current_date,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index idx_fd_rates_active on public.fd_rates(is_active, term_months);


-- ═══════════════════════════════════════
-- UPDATED_AT trigger (reusable)
-- ═══════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_simulations_updated_at
  before update on public.simulations
  for each row execute procedure public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════

-- Helper function: checks if the current user is an admin,
-- without re-triggering RLS on profiles (avoids infinite recursion,
-- error 42P17, that occurs if a profiles policy directly subqueries profiles).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- ── PROFILES ──────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());


-- ── SIMULATIONS ───────────────────────────────────
alter table public.simulations enable row level security;

create policy "Users can CRUD own simulations"
  on public.simulations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── GOAL PLANS ────────────────────────────────────
alter table public.goal_plans enable row level security;

create policy "Users can CRUD own goal plans"
  on public.goal_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── APP CONFIG ────────────────────────────────────
alter table public.app_config enable row level security;

create policy "Anyone can read config"
  on public.app_config for select
  using (true);

create policy "Admins can write config"
  on public.app_config for all
  using (public.is_admin());


-- ── FD RATES ──────────────────────────────────────
alter table public.fd_rates enable row level security;

create policy "Anyone can read active FD rates"
  on public.fd_rates for select
  using (is_active = true);

create policy "Admins can manage FD rates"
  on public.fd_rates for all
  using (public.is_admin());


-- ═══════════════════════════════════════
-- GRANTS
-- Table-level privileges. RLS policies above further filter
-- WHICH rows are visible/editable within these allowed operations.
-- Required because "Automatically expose new tables" was disabled
-- when the project was created.
-- ═══════════════════════════════════════

grant select on public.app_config to anon, authenticated;
grant select, insert, update, delete on public.app_config to authenticated;

grant select on public.fd_rates to anon, authenticated;
grant select, insert, update, delete on public.fd_rates to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;

grant select, insert, update, delete on public.simulations to authenticated;

grant select, insert, update, delete on public.goal_plans to authenticated;