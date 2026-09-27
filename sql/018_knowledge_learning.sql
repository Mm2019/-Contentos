-- Phase 15 — Knowledge + Learning. Reuse Shared Core Resources/Notes and specialize only Ideas, Skills and Study Sessions.
create extension if not exists pgcrypto;

-- Resources already exist in Shared Core and remain the canonical Bookmark/Resource entity.
-- Notes already exist in Shared Core and remain canonical notes.

alter table if exists uos_learning_courses
  add column if not exists project_id uuid references uos_projects(id) on delete set null;

alter table if exists uos_learning_courses
  add column if not exists skill_id uuid;

create table if not exists uos_knowledge_ideas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'raw_idea' check (status in ('raw_idea','evaluating','developing','ready','in_progress','completed','paused','archived')),
  source text,
  idea_type text,
  target_entity_type text,
  target_entity_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_learning_skills (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  name text not null,
  category text,
  target_level numeric,
  current_level numeric default 0,
  status text not null default 'active' check (status in ('active','paused','mastered','archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, name, project_id)
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'uos_learning_courses_skill_fk') then
    alter table uos_learning_courses add constraint uos_learning_courses_skill_fk foreign key (skill_id) references uos_learning_skills(id) on delete set null;
  end if;
end $$;

alter table if exists uos_learning_lessons
  add column if not exists project_id uuid references uos_projects(id) on delete set null;

alter table if exists uos_learning_lessons
  add column if not exists skill_id uuid;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'uos_learning_lessons_skill_fk') then
    alter table uos_learning_lessons add constraint uos_learning_lessons_skill_fk foreign key (skill_id) references uos_learning_skills(id) on delete set null;
  end if;
end $$;

create table if not exists uos_learning_study_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  course_id uuid references uos_learning_courses(id) on delete set null,
  lesson_id uuid references uos_learning_lessons(id) on delete set null,
  skill_id uuid references uos_learning_skills(id) on delete set null,
  event_id uuid references uos_events(id) on delete set null,
  task_id uuid references uos_tasks(id) on delete set null,
  scheduled_at timestamptz,
  duration_minutes int,
  actual_minutes int default 0,
  status text not null default 'planned' check (status in ('planned','in_progress','completed','skipped','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS on new specialized entities. Shared Core Resources/Notes stay under their existing policies.
do $$ declare t text; begin foreach t in array array[
  'uos_knowledge_ideas','uos_learning_skills','uos_learning_study_sessions'
] loop
  execute format('alter table %I enable row level security',t);
  execute format('drop policy if exists %I_member_all on %I',t,t);
  execute format('create policy %I_member_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))',t,t);
end loop; end $$;

create index if not exists idx_uos_learning_courses_project on uos_learning_courses(workspace_id,project_id,status);
create index if not exists idx_uos_knowledge_ideas_ws on uos_knowledge_ideas(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_learning_skills_ws on uos_learning_skills(workspace_id,project_id,status);
create index if not exists idx_uos_learning_sessions_ws on uos_learning_study_sessions(workspace_id,project_id,status,scheduled_at desc);
create index if not exists idx_uos_learning_sessions_lesson on uos_learning_study_sessions(lesson_id,scheduled_at desc);
