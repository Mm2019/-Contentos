-- Phase 13 — Marketplace OS. Marketplace state is distinct from Commerce Orders and shared People/Finance.
create extension if not exists pgcrypto;

create table if not exists uos_marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  parent_id uuid references uos_marketplace_categories(id) on delete set null,
  name text not null,
  slug text not null,
  attribute_schema jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','hidden','archived')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, slug)
);

create table if not exists uos_marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  category_id uuid references uos_marketplace_categories(id) on delete set null,
  seller_ref text,
  title text not null,
  description text,
  attributes jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','pending_review','published','paused','sold','archived','rejected')),
  price numeric not null default 0 check (price >= 0),
  currency text not null default 'EGP',
  location text,
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, external_id)
);

create table if not exists uos_marketplace_deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  listing_id uuid references uos_marketplace_listings(id) on delete set null,
  buyer_ref text,
  seller_ref text,
  status text not null default 'initiated' check (status in ('initiated','negotiating','accepted','paid','completed','cancelled','disputed','refunded')),
  agreed_amount numeric not null default 0 check (agreed_amount >= 0),
  currency text not null default 'EGP',
  commerce_order_id uuid references uos_commerce_orders(id) on delete set null,
  finance_transaction_id uuid references uos_fin_transactions(id) on delete set null,
  expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_marketplace_verifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  subject_type text not null check (subject_type in ('person','seller','buyer','business','listing')),
  subject_ref text not null,
  method text not null default 'manual',
  status text not null default 'pending' check (status in ('pending','submitted','verified','rejected','expired')),
  submitted_at timestamptz,
  verified_at timestamptz,
  expires_at timestamptz,
  reviewer_ref text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_marketplace_trust_scores (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  subject_type text not null check (subject_type in ('person','seller','buyer','business','listing')),
  subject_ref text not null,
  trust_score numeric not null default 0 check (trust_score >= 0 and trust_score <= 100),
  risk_level text not null default 'medium' check (risk_level in ('critical','high','medium','low')),
  verification_state text not null default 'unverified' check (verification_state in ('unverified','pending','verified','rejected')),
  signals jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  listing_id uuid references uos_marketplace_listings(id) on delete set null,
  reviewer_ref text not null,
  reviewee_ref text not null,
  rating integer not null check (rating between 1 and 5),
  body text,
  status text not null default 'pending' check (status in ('pending','published','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_marketplace_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  target_type text not null check (target_type in ('listing','person','deal','review','category')),
  target_id text not null,
  reporter_ref text not null,
  reason text,
  severity text not null default 'medium' check (severity in ('critical','high','medium','low')),
  status text not null default 'open' check (status in ('open','reviewing','actioned','dismissed','closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_marketplace_disputes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  deal_id uuid references uos_marketplace_deals(id) on delete set null,
  opened_by_ref text not null,
  reason text,
  status text not null default 'opened' check (status in ('opened','investigating','resolution_proposed','resolved','rejected','escalated')),
  claimed_amount numeric not null default 0 check (claimed_amount >= 0),
  currency text not null default 'EGP',
  resolution text,
  finance_transaction_id uuid references uos_fin_transactions(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_marketplace_safety_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  event_type text not null check (event_type in ('risk_flag','fraud_signal','unsafe_meetup','content_safety','verification_failure','policy_violation')),
  target_type text not null check (target_type in ('listing','person','deal','review','report')),
  target_id text not null,
  severity text not null default 'medium' check (severity in ('critical','high','medium','low')),
  status text not null default 'open' check (status in ('open','monitoring','resolved','dismissed')),
  action_taken text,
  detected_by text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'uos_marketplace_categories','uos_marketplace_listings','uos_marketplace_deals','uos_marketplace_verifications',
    'uos_marketplace_trust_scores','uos_marketplace_reviews','uos_marketplace_reports','uos_marketplace_disputes','uos_marketplace_safety_events'
  ] LOOP
    EXECUTE format('alter table %I enable row level security', t);
    EXECUTE format('drop policy if exists %I_member_all on %I', t, t);
    EXECUTE format('create policy %I_member_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))', t, t);
  END LOOP;
END $$;

create index if not exists idx_uos_marketplace_categories_ws on uos_marketplace_categories(workspace_id,project_id,status);
create index if not exists idx_uos_marketplace_listings_ws on uos_marketplace_listings(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_marketplace_listings_category on uos_marketplace_listings(category_id,status);
create index if not exists idx_uos_marketplace_deals_ws on uos_marketplace_deals(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_marketplace_verifications_ws on uos_marketplace_verifications(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_marketplace_trust_ws on uos_marketplace_trust_scores(workspace_id,project_id,risk_level,trust_score desc);
create index if not exists idx_uos_marketplace_reviews_ws on uos_marketplace_reviews(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_marketplace_reports_ws on uos_marketplace_reports(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_marketplace_disputes_ws on uos_marketplace_disputes(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_marketplace_safety_ws on uos_marketplace_safety_events(workspace_id,project_id,status,severity,created_at desc);
