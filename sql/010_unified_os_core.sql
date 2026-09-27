-- Unified OS Core — built around the existing ContentOS, not a replacement for it.
create extension if not exists pgcrypto;

create table if not exists uos_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  base_currency text not null default 'EGP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, name)
);

create table if not exists uos_areas (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  parent_id uuid references uos_areas(id) on delete set null, name text not null, type text not null default 'area', status text not null default 'active', description text,
  owner_id uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_projects (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null, project_type text not null default 'other', project_profile text not null default 'Personal / Research', area_id uuid references uos_areas(id) on delete set null,
  status text not null default 'idea', priority text not null default 'normal', owner_id uuid references auth.users(id), start_date date, target_date date,
  description text, vision text, mission text, business_model text, revenue_model text, cost_model text, enabled_modules jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_tasks (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  title text not null, project_id uuid references uos_projects(id) on delete set null, area_id uuid references uos_areas(id) on delete set null,
  parent_task_id uuid references uos_tasks(id) on delete set null, status text not null default 'backlog', priority text not null default 'normal', assignee_id uuid references auth.users(id),
  due_date date, start_date date, estimated_minutes int, actual_minutes int, tags jsonb not null default '[]'::jsonb, dependencies jsonb not null default '[]'::jsonb,
  blocked_by jsonb not null default '[]'::jsonb, related_entity_type text, related_entity_id text, recurring jsonb, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_goals (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  title text not null, project_id uuid references uos_projects(id) on delete set null, area_id uuid references uos_areas(id) on delete set null,
  parent_goal_id uuid references uos_goals(id) on delete set null, level text not null default 'goal', status text not null default 'active', target_value numeric, current_value numeric, due_date date, description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  title text not null, project_id uuid references uos_projects(id) on delete set null, event_type text not null default 'event', starts_at timestamptz not null, ends_at timestamptz, location text, notes text, related_entity_type text, related_entity_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_resources (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  title text not null, url text, type text, category text, area_id uuid references uos_areas(id) on delete set null, project_id uuid references uos_projects(id) on delete set null,
  status text not null default 'new', notes text, tags jsonb not null default '[]'::jsonb, rating int, source text, date_added date default current_date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_notes (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  title text not null, body text, project_id uuid references uos_projects(id) on delete set null, area_id uuid references uos_areas(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_decisions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  title text not null, rationale text, decision text, project_id uuid references uos_projects(id) on delete set null, decided_at timestamptz not null default now(), owner_id uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_reviews (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  review_type text not null default 'weekly', period_start date, period_end date, summary text, metrics jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_content_links (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid not null references uos_projects(id) on delete cascade,
  contentos_entity_type text not null,
  contentos_entity_id text not null,
  label text,
  created_at timestamptz not null default now(),
  unique(project_id, contentos_entity_type, contentos_entity_id)
);

create or replace function uos_ensure_personal_workspace(p_name text default 'Personal OS') returns uuid language plpgsql security definer set search_path=public as $$
declare wid uuid; begin
  select id into wid from uos_workspaces where owner_id=auth.uid() order by created_at limit 1;
  if wid is null then insert into uos_workspaces(owner_id,name) values(auth.uid(),p_name) returning id into wid; end if;
  return wid;
end $$;

create or replace function uos_is_member(p_workspace uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from uos_workspaces w where w.id=p_workspace and w.owner_id=auth.uid())
$$;

alter table uos_workspaces enable row level security;
alter table uos_areas enable row level security;
alter table uos_projects enable row level security;
alter table uos_tasks enable row level security;
alter table uos_goals enable row level security;
alter table uos_events enable row level security;
alter table uos_resources enable row level security;
alter table uos_notes enable row level security;
alter table uos_decisions enable row level security;
alter table uos_reviews enable row level security;
alter table uos_content_links enable row level security;

do $$ declare t text; begin foreach t in array array['uos_areas','uos_projects','uos_tasks','uos_goals','uos_events','uos_resources','uos_notes','uos_decisions','uos_reviews','uos_content_links'] loop execute format('drop policy if exists %I_owner_all on %I',t,t); execute format('create policy %I_owner_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))',t,t); end loop; end $$;

drop policy if exists uos_workspaces_owner on uos_workspaces;
create policy uos_workspaces_owner on uos_workspaces for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create index if not exists idx_uos_projects_ws on uos_projects(workspace_id);
create index if not exists idx_uos_tasks_ws on uos_tasks(workspace_id,due_date,status);
create index if not exists idx_uos_goals_ws on uos_goals(workspace_id,status);
create index if not exists idx_uos_events_ws on uos_events(workspace_id,starts_at);
create index if not exists idx_uos_resources_ws on uos_resources(workspace_id,status);
