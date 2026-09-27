-- Phase 16 — Complete Personal OS: Home + Fitness + Habits.
-- Specialized lifecycle only; Tasks, Goals, Calendar and Finance remain Shared Core sources of truth.
create extension if not exists pgcrypto;

-- Project scoping for specialized personal verticals.
do $$ declare t text; begin foreach t in array array[
  'uos_habits','uos_habit_logs','uos_learning_courses','uos_fitness_programs','uos_fitness_phases','uos_fitness_workouts',
  'uos_fitness_exercises','uos_fitness_sessions','uos_fitness_measurements','uos_home_rooms','uos_home_maintenance','uos_home_inventory','uos_home_shopping'
] loop
  execute format('alter table if exists %I add column if not exists project_id uuid references uos_projects(id) on delete set null',t);
end loop; end $$;

-- Habit review / trigger history: keep daily log simple, move reflections to weekly review.
create table if not exists uos_habit_weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  week_start date not null,
  week_end date not null,
  summary text,
  wins text,
  misses text,
  blockers text,
  next_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, project_id, week_start)
);

-- Fitness recovery is a specialized log, not a Task replacement.
create table if not exists uos_fitness_recovery (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  recorded_at date not null default current_date,
  sleep_hours numeric,
  energy_level int check (energy_level is null or energy_level between 1 and 10),
  soreness_level int check (soreness_level is null or soreness_level between 1 and 10),
  stress_level int check (stress_level is null or stress_level between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shared-Core links prevent duplicated tasks/events when specialized records need action/scheduling.
alter table if exists uos_home_maintenance add column if not exists related_task_id uuid references uos_tasks(id) on delete set null;
alter table if exists uos_home_maintenance add column if not exists related_event_id uuid references uos_events(id) on delete set null;
alter table if exists uos_home_shopping add column if not exists related_task_id uuid references uos_tasks(id) on delete set null;
alter table if exists uos_home_shopping add column if not exists related_event_id uuid references uos_events(id) on delete set null;
alter table if exists uos_fitness_sessions add column if not exists task_id uuid references uos_tasks(id) on delete set null;
alter table if exists uos_fitness_sessions add column if not exists event_id uuid references uos_events(id) on delete set null;
alter table if exists uos_home_inventory add column if not exists reorder_point numeric;
alter table if exists uos_home_inventory add column if not exists min_stock numeric;

-- Project-scoped indexes.
do $$ declare t text; begin foreach t in array array[
  'uos_habits','uos_habit_logs','uos_fitness_programs','uos_fitness_workouts','uos_fitness_sessions','uos_home_rooms','uos_home_maintenance','uos_home_inventory','uos_home_shopping'
] loop
  execute format('create index if not exists idx_%I_project on %I(workspace_id,project_id,created_at desc)', lower(t), t);
end loop; end $$;
create index if not exists idx_uos_habit_reviews_ws on uos_habit_weekly_reviews(workspace_id,project_id,week_start desc);
create index if not exists idx_uos_fitness_recovery_ws on uos_fitness_recovery(workspace_id,project_id,recorded_at desc);

-- RLS for new phase-specific entities.
do $$ declare t text; begin foreach t in array array['uos_habit_weekly_reviews','uos_fitness_recovery'] loop
  execute format('alter table %I enable row level security',t);
  execute format('drop policy if exists %I_member_all on %I',t,t);
  execute format('create policy %I_member_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))',t,t);
end loop; end $$;

-- Explicitly protect project-linked personal rows with existing workspace policies.
do $$ declare t text; begin foreach t in array array[
  'uos_habits','uos_habit_logs','uos_fitness_programs','uos_fitness_phases','uos_fitness_workouts','uos_fitness_exercises','uos_fitness_sessions','uos_fitness_measurements',
  'uos_home_rooms','uos_home_maintenance','uos_home_inventory','uos_home_shopping'
] loop
  execute format('alter table %I enable row level security',t);
end loop; end $$;
