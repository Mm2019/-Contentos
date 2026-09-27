-- Phase 4 — Finance OS. One shared financial source of truth for all modules.
create extension if not exists pgcrypto;

create table if not exists uos_fin_accounts (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null, type text not null default 'cash', currency text not null default 'EGP', opening_balance numeric not null default 0,
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_fin_categories (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null, kind text not null default 'expense', parent_id uuid references uos_fin_categories(id) on delete set null, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_fin_transactions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  occurred_at timestamptz not null default now(), amount numeric not null check (amount >= 0),
  type text not null check (type in ('income','expense','transfer','refund','adjustment','debt_payment','debt_received')),
  from_account_id uuid references uos_fin_accounts(id) on delete set null,
  to_account_id uuid references uos_fin_accounts(id) on delete set null,
  category_id uuid references uos_fin_categories(id) on delete set null,
  project_id uuid references uos_projects(id) on delete set null,
  area_id uuid references uos_areas(id) on delete set null,
  description text, recurring_source_id uuid, debt_id uuid, shopping_item_id uuid, subscription_id uuid,
  source_entity_type text, source_entity_id text, external_id text, linked_transaction_id uuid references uos_fin_transactions(id) on delete set null,
  sync_status text not null default 'unlinked', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id, source_entity_type, source_entity_id, external_id)
);

create table if not exists uos_fin_budgets (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  category_id uuid references uos_fin_categories(id) on delete cascade, project_id uuid references uos_projects(id) on delete cascade,
  period_start date not null, period_end date not null, amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table if not exists uos_fin_recurring (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null, amount numeric not null check (amount >= 0), type text not null check (type in ('income','expense')),
  frequency text not null default 'monthly', next_due date, account_id uuid references uos_fin_accounts(id) on delete set null,
  category_id uuid references uos_fin_categories(id) on delete set null, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_fin_debts (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null, direction text not null default 'owed_by_me', principal numeric not null check (principal >= 0), remaining numeric not null check (remaining >= 0),
  due_date date, counterparty text, status text not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_fin_savings_goals (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null, target_amount numeric not null check (target_amount >= 0), current_amount numeric not null default 0 check (current_amount >= 0),
  due_date date, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Idempotent hardening for databases created by earlier phases.
alter table uos_fin_transactions add column if not exists linked_transaction_id uuid references uos_fin_transactions(id) on delete set null;
alter table uos_fin_transactions add column if not exists area_id uuid references uos_areas(id) on delete set null;

alter table uos_fin_accounts enable row level security;
alter table uos_fin_categories enable row level security;
alter table uos_fin_transactions enable row level security;
alter table uos_fin_budgets enable row level security;
alter table uos_fin_recurring enable row level security;
alter table uos_fin_debts enable row level security;
alter table uos_fin_savings_goals enable row level security;

do $$ declare t text; begin foreach t in array array['uos_fin_accounts','uos_fin_categories','uos_fin_transactions','uos_fin_budgets','uos_fin_recurring','uos_fin_debts','uos_fin_savings_goals'] loop execute format('drop policy if exists %I_owner_all on %I',t,t); execute format('create policy %I_owner_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))',t,t); end loop; end $$;

create index if not exists idx_uos_fin_tx_ws_date on uos_fin_transactions(workspace_id,occurred_at desc);
create index if not exists idx_uos_fin_tx_project on uos_fin_transactions(project_id,occurred_at desc);
create index if not exists idx_uos_fin_tx_account_from on uos_fin_transactions(from_account_id,occurred_at desc);
create index if not exists idx_uos_fin_tx_account_to on uos_fin_transactions(to_account_id,occurred_at desc);
create index if not exists idx_uos_fin_tx_category on uos_fin_transactions(category_id,occurred_at desc);
create index if not exists idx_uos_fin_budgets_ws on uos_fin_budgets(workspace_id,period_start,period_end);
create index if not exists idx_uos_fin_recurring_due on uos_fin_recurring(workspace_id,next_due) where active;
create index if not exists idx_uos_fin_debts_due on uos_fin_debts(workspace_id,due_date) where status <> 'closed';
create index if not exists idx_uos_fin_savings_status on uos_fin_savings_goals(workspace_id,status);

create or replace view uos_fin_account_balances as
select
  a.id,
  a.workspace_id,
  a.name,
  a.currency,
  a.opening_balance
    + coalesce(sum(case
        when t.from_account_id = a.id and t.type in ('expense','debt_payment','transfer') then -t.amount
        when t.to_account_id = a.id and t.type in ('income','refund','debt_received','transfer') then t.amount
        when t.from_account_id = a.id and t.type = 'adjustment' then t.amount
        else 0 end),0) as balance
from uos_fin_accounts a
left join uos_fin_transactions t on t.workspace_id = a.workspace_id and (t.from_account_id = a.id or t.to_account_id = a.id)
group by a.id;
