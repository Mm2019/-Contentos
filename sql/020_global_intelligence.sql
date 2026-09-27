-- Phase 17 — Global Intelligence.
-- Findings are derived from existing Unified OS source entities; no source entity is duplicated.
create extension if not exists pgcrypto;

create table if not exists uos_global_intelligence_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  kind text not null,
  severity text not null default 'info' check (severity in ('critical','high','medium','info')),
  title text not null,
  summary text not null,
  confidence text not null default 'medium' check (confidence in ('low','medium','high')),
  status text not null default 'open' check (status in ('open','acknowledged','dismissed','applied')),
  evidence jsonb not null default '[]'::jsonb,
  source_entities jsonb not null default '[]'::jsonb,
  fingerprint text not null,
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, fingerprint)
);

alter table uos_global_intelligence_events enable row level security;
drop policy if exists uos_global_intelligence_events_member_all on uos_global_intelligence_events;
create policy uos_global_intelligence_events_member_all on uos_global_intelligence_events
  for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id));

create index if not exists idx_uos_global_intelligence_ws_status on uos_global_intelligence_events(workspace_id,status,severity,detected_at desc);
create index if not exists idx_uos_global_intelligence_project on uos_global_intelligence_events(project_id,detected_at desc);
