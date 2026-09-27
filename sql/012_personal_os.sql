-- Phase 5 — Personal OS. Built on Shared Core; specialized entities only where lifecycle requires them.
create extension if not exists pgcrypto;

create table if not exists uos_habits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null,
  type text not null default 'boolean',
  frequency text not null default 'daily',
  target numeric,
  active boolean not null default true,
  category text,
  start_date date,
  goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_habit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  habit_id uuid not null references uos_habits(id) on delete cascade,
  log_date date not null,
  actual_value numeric,
  status text not null check (status in ('done','partial','missed','skipped')),
  notes text,
  trigger text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(habit_id, log_date)
);

create table if not exists uos_learning_courses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  area_id uuid references uos_areas(id) on delete set null,
  title text not null,
  description text,
  skill text,
  status text not null default 'active',
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_learning_modules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  course_id uuid not null references uos_learning_courses(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_learning_lessons (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  course_id uuid not null references uos_learning_courses(id) on delete cascade,
  module_id uuid references uos_learning_modules(id) on delete set null,
  title text not null,
  duration_minutes int,
  watched_minutes int not null default 0,
  status text not null default 'not_started',
  skill text,
  notes text,
  resource_id uuid references uos_resources(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_programs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null,
  goal text,
  status text not null default 'active',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_phases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  program_id uuid not null references uos_fitness_programs(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_workouts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  program_id uuid not null references uos_fitness_programs(id) on delete cascade,
  phase_id uuid references uos_fitness_phases(id) on delete set null,
  name text not null,
  week_number int,
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_exercises (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null,
  category text,
  instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  workout_id uuid references uos_fitness_workouts(id) on delete set null,
  started_at timestamptz not null default now(),
  duration_minutes int,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_measurements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg numeric,
  body_fat_pct numeric,
  resting_hr int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_home_rooms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null,
  type text not null default 'custom',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_home_maintenance (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  issue text not null,
  room_id uuid references uos_home_rooms(id) on delete set null,
  category text,
  priority text not null default 'normal',
  status text not null default 'open',
  estimated_cost numeric,
  actual_cost numeric,
  technician text,
  due_date date,
  completed_date date,
  related_inventory_id uuid,
  related_shopping_id uuid,
  related_finance_transaction_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_home_inventory (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  name text not null,
  kind text not null default 'asset',
  quantity numeric not null default 1,
  unit text,
  stock_status text not null default 'good' check (stock_status in ('good','low','critical','out')),
  room_id uuid references uos_home_rooms(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_home_shopping (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  item text not null,
  quantity numeric not null default 1,
  estimated_cost numeric,
  purchased boolean not null default false,
  purchased_at timestamptz,
  inventory_id uuid references uos_home_inventory(id) on delete set null,
  maintenance_id uuid references uos_home_maintenance(id) on delete set null,
  linked_transaction_id uuid references uos_fin_transactions(id) on delete set null,
  source_entity text,
  source_id text,
  sync_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: personal OS rows are workspace-scoped and protected by the shared helper.
do $$ declare t text; begin foreach t in array array[
  'uos_habits','uos_habit_logs','uos_learning_courses','uos_learning_modules','uos_learning_lessons',
  'uos_fitness_programs','uos_fitness_phases','uos_fitness_workouts','uos_fitness_exercises','uos_fitness_sessions','uos_fitness_measurements',
  'uos_home_rooms','uos_home_maintenance','uos_home_inventory','uos_home_shopping'
] loop
  execute format('alter table %I enable row level security',t);
  execute format('drop policy if exists %I_owner_all on %I',t,t);
  execute format('create policy %I_owner_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))',t,t);
end loop; end $$;

create index if not exists idx_uos_habits_ws on uos_habits(workspace_id,active);
create index if not exists idx_uos_habit_logs_ws_date on uos_habit_logs(workspace_id,log_date desc);
create index if not exists idx_uos_learning_courses_ws on uos_learning_courses(workspace_id,status);
create index if not exists idx_uos_learning_modules_course on uos_learning_modules(course_id,sort_order);
create index if not exists idx_uos_learning_lessons_course on uos_learning_lessons(course_id,status);
create index if not exists idx_uos_fitness_programs_ws on uos_fitness_programs(workspace_id,status);
create index if not exists idx_uos_fitness_sessions_ws on uos_fitness_sessions(workspace_id,started_at desc);
create index if not exists idx_uos_home_maintenance_ws on uos_home_maintenance(workspace_id,status,due_date);
create index if not exists idx_uos_home_inventory_ws on uos_home_inventory(workspace_id,stock_status);
create index if not exists idx_uos_home_shopping_ws on uos_home_shopping(workspace_id,purchased,created_at desc);
