-- Phase 27 — Finance OS: source-of-truth hardening.
-- Fixes gaps identified in the Master Reference audit:
--   1) transactions had no currency/fx fields
--   2) debts.remaining and savings_goals.current_amount were plain editable
--      columns instead of values derived from real payment/contribution history
--   3) no assets table, no exchange_rates history, no net_worth_snapshots
--   4) recurring engine had no idempotency guard against duplicate generation
-- Non-destructive: only adds columns/tables/triggers. No existing data is dropped.

-- 1) Multi-currency on the ledger itself -----------------------------------
alter table uos_fin_transactions add column if not exists currency text not null default 'EGP';
alter table uos_fin_transactions add column if not exists to_amount numeric;
alter table uos_fin_transactions add column if not exists to_currency text;
alter table uos_fin_transactions add column if not exists exchange_rate_used numeric;

-- 2) Exchange rate history (never recalculate old transactions with today's rate)
create table if not exists uos_fin_exchange_rates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  currency text not null, rate_to_base numeric not null check (rate_to_base > 0),
  base_currency text not null default 'EGP', source text not null default 'manual',
  effective_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create index if not exists idx_fin_fx_workspace_currency on uos_fin_exchange_rates(workspace_id, currency, effective_at desc);

-- 3) Assets / investments (feed Net Worth) ----------------------------------
create table if not exists uos_fin_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null, type text not null default 'other',
  account_id uuid references uos_fin_accounts(id) on delete set null,
  currency text not null default 'EGP',
  purchase_value numeric not null default 0 check (purchase_value >= 0),
  current_value numeric not null default 0 check (current_value >= 0),
  purchase_date date, rate_to_base numeric not null default 1,
  include_in_net_worth boolean not null default true,
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- 4) Debt payments — debts.remaining becomes a DERIVED value ----------------
create table if not exists uos_fin_debt_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  debt_id uuid not null references uos_fin_debts(id) on delete cascade,
  amount numeric not null check (amount > 0), currency text not null default 'EGP',
  paid_at timestamptz not null default now(),
  transaction_id uuid references uos_fin_transactions(id) on delete set null,
  notes text, created_at timestamptz not null default now()
);

create or replace function uos_recalc_debt_remaining() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_debt_id uuid; v_principal numeric; v_paid numeric;
begin
  v_debt_id := coalesce(new.debt_id, old.debt_id);
  select principal into v_principal from uos_fin_debts where id = v_debt_id;
  select coalesce(sum(amount),0) into v_paid from uos_fin_debt_payments where debt_id = v_debt_id;
  update uos_fin_debts
    set remaining = greatest(v_principal - v_paid, 0),
        status = case when v_principal - v_paid <= 0 then 'paid' else status end,
        updated_at = now()
    where id = v_debt_id;
  return null;
end $$;

drop trigger if exists trg_recalc_debt_remaining on uos_fin_debt_payments;
create trigger trg_recalc_debt_remaining
  after insert or update or delete on uos_fin_debt_payments
  for each row execute function uos_recalc_debt_remaining();

-- 5) Goal contributions — savings_goals.current_amount becomes DERIVED ------
create table if not exists uos_fin_goal_contributions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  goal_id uuid not null references uos_fin_savings_goals(id) on delete cascade,
  amount numeric not null check (amount > 0), currency text not null default 'EGP',
  contributed_at timestamptz not null default now(),
  transaction_id uuid references uos_fin_transactions(id) on delete set null,
  notes text, created_at timestamptz not null default now()
);

create or replace function uos_recalc_goal_saved() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_goal_id uuid; v_saved numeric; v_target numeric;
begin
  v_goal_id := coalesce(new.goal_id, old.goal_id);
  select coalesce(sum(amount),0) into v_saved from uos_fin_goal_contributions where goal_id = v_goal_id;
  select target_amount into v_target from uos_fin_savings_goals where id = v_goal_id;
  update uos_fin_savings_goals
    set current_amount = v_saved,
        status = case when v_target > 0 and v_saved >= v_target then 'achieved' else status end,
        updated_at = now()
    where id = v_goal_id;
  return null;
end $$;

drop trigger if exists trg_recalc_goal_saved on uos_fin_goal_contributions;
create trigger trg_recalc_goal_saved
  after insert or update or delete on uos_fin_goal_contributions
  for each row execute function uos_recalc_goal_saved();

-- 6) Net worth snapshots (history, not just a live number) ------------------
create table if not exists uos_fin_net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  snapshot_date date not null default current_date,
  total_assets numeric not null default 0, total_liabilities numeric not null default 0,
  net_worth numeric not null default 0, base_currency text not null default 'EGP',
  created_at timestamptz not null default now(),
  unique(workspace_id, snapshot_date)
);

-- 7) Recurring engine — idempotency guard against duplicate generation ------
create table if not exists uos_fin_recurring_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  recurring_id uuid not null references uos_fin_recurring(id) on delete cascade,
  scheduled_date date not null,
  transaction_id uuid references uos_fin_transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(recurring_id, scheduled_date)
);

-- 8) Finance Projects (ROI/profit analysis, distinct from general Projects) --
create table if not exists uos_fin_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null, project_type text not null default 'other',
  budget numeric not null default 0, currency text not null default 'EGP',
  start_date date, status text not null default 'planning',
  area_id uuid references uos_areas(id) on delete set null,
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table uos_fin_transactions add column if not exists finance_project_id uuid references uos_fin_projects(id) on delete set null;

-- RLS: same workspace-membership pattern as every other uos_ table ----------
alter table uos_fin_exchange_rates enable row level security;
alter table uos_fin_assets enable row level security;
alter table uos_fin_debt_payments enable row level security;
alter table uos_fin_goal_contributions enable row level security;
alter table uos_fin_net_worth_snapshots enable row level security;
alter table uos_fin_recurring_generations enable row level security;
alter table uos_fin_projects enable row level security;

do $$
declare t text;
begin
  foreach t in array array['uos_fin_exchange_rates','uos_fin_assets','uos_fin_debt_payments',
    'uos_fin_goal_contributions','uos_fin_net_worth_snapshots','uos_fin_recurring_generations','uos_fin_projects']
  loop
    execute format('drop policy if exists ws_member_all on %I', t);
    execute format($p$create policy ws_member_all on %I for all
      using (workspace_id in (select workspace_id from uos_workspace_members where user_id = auth.uid()))
      with check (workspace_id in (select workspace_id from uos_workspace_members where user_id = auth.uid()))$p$, t);
  end loop;
end $$;

grant select, insert, update, delete on uos_fin_exchange_rates, uos_fin_assets, uos_fin_debt_payments,
  uos_fin_goal_contributions, uos_fin_net_worth_snapshots, uos_fin_recurring_generations, uos_fin_projects
  to authenticated;
grant all on uos_fin_exchange_rates, uos_fin_assets, uos_fin_debt_payments,
  uos_fin_goal_contributions, uos_fin_net_worth_snapshots, uos_fin_recurring_generations, uos_fin_projects
  to service_role;
revoke all on uos_fin_exchange_rates, uos_fin_assets, uos_fin_debt_payments,
  uos_fin_goal_contributions, uos_fin_net_worth_snapshots, uos_fin_recurring_generations, uos_fin_projects
  from anon;
