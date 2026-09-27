-- Phase 11 — Product / SaaS OS. Built as a vertical over the Shared Core.
create table if not exists uos_product_products (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, name text not null, slug text, status text not null default 'draft', description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_prds (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, product_id uuid references uos_product_products(id) on delete set null,
  title text not null, version text not null default '1.0', problem text, users text, goals text, non_goals text, assumptions text, risks text, dependencies text, acceptance_criteria text, metrics text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_requirements (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, prd_id uuid references uos_product_prds(id) on delete set null,
  title text not null, type text not null default 'functional', description text, priority text not null default 'medium', status text not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_epics (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, requirement_id uuid references uos_product_requirements(id) on delete set null,
  title text not null, description text, status text not null default 'planned',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_features (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, epic_id uuid references uos_product_epics(id) on delete set null,
  task_id uuid references uos_tasks(id) on delete set null, title text not null, status text not null default 'idea', priority text not null default 'medium', problem text, description text, acceptance_criteria text, metrics text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_releases (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, product_id uuid references uos_product_products(id) on delete set null,
  name text not null, version text, status text not null default 'planned', release_date date, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_bugs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, linked_feature_id uuid references uos_product_features(id) on delete set null, release_id uuid references uos_product_releases(id) on delete set null,
  title text not null, severity text not null default 'medium', priority text not null default 'medium', environment text, steps text, expected text, actual text, reproduction text, assignee_id uuid references auth.users(id) on delete set null, status text not null default 'open',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_qa_cases (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, feature_id uuid references uos_product_features(id) on delete set null,
  title text not null, description text, steps text, expected text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_qa_runs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, release_id uuid references uos_product_releases(id) on delete set null,
  name text not null, environment text, started_at timestamptz, completed_at timestamptz, release_ready boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_qa_results (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, run_id uuid references uos_product_qa_runs(id) on delete cascade, case_id uuid references uos_product_qa_cases(id) on delete cascade,
  status text not null default 'not_run', evidence text, notes text, recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_feedback (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, linked_feature_id uuid references uos_product_features(id) on delete set null,
  title text not null, source text not null default 'user', status text not null default 'new', priority text not null default 'medium', description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_support_tickets (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, title text not null, type text not null default 'request', priority text not null default 'medium', status text not null default 'new', customer text, description text, sla_due_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_analytics_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, product_id uuid references uos_product_products(id) on delete set null,
  event_name text not null, metric text, value numeric not null default 0, source text not null default 'manual', occurred_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_subscriptions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, name text not null, plan text, status text not null default 'active', price numeric not null default 0, billing_cycle text not null default 'monthly', started_at timestamptz, renewal_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_team (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, name text not null, role text, email text, status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_product_technical_assets (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, name text not null, type text not null default 'repository', url text, status text not null default 'active', notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['uos_product_products','uos_product_prds','uos_product_requirements','uos_product_epics','uos_product_features','uos_product_releases','uos_product_bugs','uos_product_qa_cases','uos_product_qa_runs','uos_product_qa_results','uos_product_feedback','uos_product_support_tickets','uos_product_analytics_events','uos_product_subscriptions','uos_product_team','uos_product_technical_assets'] LOOP
    EXECUTE format('alter table %I enable row level security', t);
    EXECUTE format('drop policy if exists %I_owner_all on %I', t, t);
    EXECUTE format('create policy %I_owner_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))', t, t);
  END LOOP;
END $$;

create index if not exists idx_uos_product_products_ws on uos_product_products(workspace_id,project_id);
create index if not exists idx_uos_product_prds_ws on uos_product_prds(workspace_id,project_id);
create index if not exists idx_uos_product_requirements_ws on uos_product_requirements(workspace_id,project_id,status);
create index if not exists idx_uos_product_epics_ws on uos_product_epics(workspace_id,project_id,status);
create index if not exists idx_uos_product_features_ws on uos_product_features(workspace_id,project_id,status);
create index if not exists idx_uos_product_releases_ws on uos_product_releases(workspace_id,project_id,status);
create index if not exists idx_uos_product_bugs_ws on uos_product_bugs(workspace_id,project_id,status,severity);
create index if not exists idx_uos_product_qa_cases_ws on uos_product_qa_cases(workspace_id,project_id);
create index if not exists idx_uos_product_qa_runs_ws on uos_product_qa_runs(workspace_id,project_id);
create index if not exists idx_uos_product_qa_results_run on uos_product_qa_results(run_id,status);
create index if not exists idx_uos_product_feedback_ws on uos_product_feedback(workspace_id,project_id,status);
create index if not exists idx_uos_product_support_ws on uos_product_support_tickets(workspace_id,project_id,status,priority);
create index if not exists idx_uos_product_analytics_ws on uos_product_analytics_events(workspace_id,project_id,occurred_at);
create index if not exists idx_uos_product_subscriptions_ws on uos_product_subscriptions(workspace_id,project_id,status);
create index if not exists idx_uos_product_team_ws on uos_product_team(workspace_id,project_id);
create index if not exists idx_uos_product_assets_ws on uos_product_technical_assets(workspace_id,project_id);
