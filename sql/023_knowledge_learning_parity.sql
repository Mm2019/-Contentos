-- Phase 22 — Knowledge + Learning parity completion.
-- Preserves Shared Core Resources/Notes and adds missing functional entities/relations.
create extension if not exists pgcrypto;

create table if not exists uos_knowledge_bookmark_types (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null,
  description text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, name)
);

create table if not exists uos_knowledge_categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null,
  description text,
  type text not null default 'topic' check (type in ('area','topic','skill','project','personal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, name, type)
);

create table if not exists uos_knowledge_meetings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  area_id uuid references uos_areas(id) on delete set null,
  title text not null,
  meeting_date timestamptz not null,
  status text not null default 'planned' check (status in ('planned','completed','cancelled')),
  people text,
  notes text,
  decisions_summary text,
  action_items_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_meeting_tasks (
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  meeting_id uuid not null references uos_knowledge_meetings(id) on delete cascade,
  task_id uuid not null references uos_tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (meeting_id, task_id)
);

create table if not exists uos_meeting_decisions (
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  meeting_id uuid not null references uos_knowledge_meetings(id) on delete cascade,
  decision_id uuid not null references uos_decisions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (meeting_id, decision_id)
);

-- Extend canonical Resource/Idea entities instead of creating duplicate databases.
alter table if exists uos_resources add column if not exists description text;
alter table if exists uos_resources add column if not exists why_saved text;
alter table if exists uos_resources add column if not exists bookmark_type_id uuid references uos_knowledge_bookmark_types(id) on delete set null;
alter table if exists uos_resources add column if not exists category_id uuid references uos_knowledge_categories(id) on delete set null;

alter table if exists uos_knowledge_ideas add column if not exists category_id uuid references uos_knowledge_categories(id) on delete set null;
alter table if exists uos_knowledge_ideas add column if not exists related_resource_id uuid references uos_resources(id) on delete set null;
alter table if exists uos_knowledge_ideas add column if not exists next_action text;
alter table if exists uos_knowledge_ideas add column if not exists target_task_id uuid references uos_tasks(id) on delete set null;

alter table if exists uos_events add column if not exists status text not null default 'upcoming';
alter table if exists uos_events add column if not exists url text;
alter table if exists uos_events add column if not exists category_id uuid references uos_knowledge_categories(id) on delete set null;
alter table if exists uos_events add column if not exists area_id uuid references uos_areas(id) on delete set null;
alter table if exists uos_events add column if not exists why_attend text;
alter table if exists uos_events add column if not exists takeaways text;
alter table if exists uos_events add column if not exists follow_up text;

-- Explicit status vocabulary includes the user's existing Notion flow while retaining the broader Unified OS states.
alter table if exists uos_resources drop constraint if exists uos_resources_status_check;
alter table if exists uos_knowledge_ideas drop constraint if exists uos_knowledge_ideas_status_check;
alter table if exists uos_resources add constraint uos_resources_status_check check (status in ('inbox','reading','reference','archived','new','testing','essential','future'));
alter table if exists uos_knowledge_ideas add constraint uos_knowledge_ideas_status_check check (status in ('inbox','exploring','active','parked','done','raw_idea','evaluating','developing','ready','in_progress','completed','paused','archived'));

-- RLS for new entities + relation tables.
do $$ declare t text; begin foreach t in array array[
  'uos_knowledge_bookmark_types','uos_knowledge_categories','uos_knowledge_meetings'
] loop
  execute format('alter table %I enable row level security',t);
  execute format('drop policy if exists %I_member_all on %I',t,t);
  execute format('create policy %I_member_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))',t,t);
end loop; end $$;

alter table uos_meeting_tasks enable row level security;
alter table uos_meeting_decisions enable row level security;
drop policy if exists uos_meeting_tasks_member_all on uos_meeting_tasks;
create policy uos_meeting_tasks_member_all on uos_meeting_tasks for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id));
drop policy if exists uos_meeting_decisions_member_all on uos_meeting_decisions;
create policy uos_meeting_decisions_member_all on uos_meeting_decisions for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id));

create index if not exists idx_uos_knowledge_types_ws on uos_knowledge_bookmark_types(workspace_id,name);
create index if not exists idx_uos_knowledge_categories_ws on uos_knowledge_categories(workspace_id,type,name);
create index if not exists idx_uos_knowledge_meetings_ws_date on uos_knowledge_meetings(workspace_id,meeting_date desc,status);
create index if not exists idx_uos_resources_knowledge on uos_resources(workspace_id,status,category_id,bookmark_type_id,date_added desc);
create index if not exists idx_uos_ideas_knowledge on uos_knowledge_ideas(workspace_id,status,category_id,related_resource_id,created_at desc);
create index if not exists idx_uos_events_knowledge on uos_events(workspace_id,status,category_id,area_id,starts_at desc);
create index if not exists idx_uos_meeting_tasks_task on uos_meeting_tasks(task_id);
create index if not exists idx_uos_meeting_decisions_decision on uos_meeting_decisions(decision_id);

-- Helpful views for the three requested Notion-style workflows.
create or replace view uos_knowledge_inbox as
select r.id, r.workspace_id, r.title, r.url, r.status, r.type, r.category_id, r.bookmark_type_id, r.date_added, 'resource'::text as item_kind
from uos_resources r where lower(coalesce(r.status,'')) = 'inbox'
union all
select i.id, i.workspace_id, i.title, null::text as url, i.status, i.idea_type as type, i.category_id, null::uuid as bookmark_type_id, i.created_at::date as date_added, 'idea'::text as item_kind
from uos_knowledge_ideas i where lower(coalesce(i.status,'')) = 'inbox';
