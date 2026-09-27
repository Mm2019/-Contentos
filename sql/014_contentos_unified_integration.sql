-- Phase 7 — ContentOS Unified Integration
-- IMPORTANT: this table stores only references to the existing ContentOS account IDs.
-- ContentOS remains authoritative in content_os_data.data._accounts and keeps all
-- workflow/configuration/analytics/history/intelligence/recovery behavior.
create table if not exists uos_project_content_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid not null references uos_projects(id) on delete cascade,
  content_account_id text not null,
  source_table text not null default 'content_os_data',
  source_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, content_account_id)
);

create index if not exists idx_uos_project_content_accounts_project
  on uos_project_content_accounts(project_id);

create index if not exists idx_uos_project_content_accounts_workspace
  on uos_project_content_accounts(workspace_id);

alter table uos_project_content_accounts enable row level security;

drop policy if exists uos_project_content_accounts_select on uos_project_content_accounts;
create policy uos_project_content_accounts_select
on uos_project_content_accounts for select to authenticated
using (workspace_id in (select id from uos_workspaces where owner_id = auth.uid()));

drop policy if exists uos_project_content_accounts_insert on uos_project_content_accounts;
create policy uos_project_content_accounts_insert
on uos_project_content_accounts for insert to authenticated
with check (workspace_id in (select id from uos_workspaces where owner_id = auth.uid()));

drop policy if exists uos_project_content_accounts_update on uos_project_content_accounts;
create policy uos_project_content_accounts_update
on uos_project_content_accounts for update to authenticated
using (workspace_id in (select id from uos_workspaces where owner_id = auth.uid()))
with check (workspace_id in (select id from uos_workspaces where owner_id = auth.uid()));

drop policy if exists uos_project_content_accounts_delete on uos_project_content_accounts;
create policy uos_project_content_accounts_delete
on uos_project_content_accounts for delete to authenticated
using (workspace_id in (select id from uos_workspaces where owner_id = auth.uid()));
