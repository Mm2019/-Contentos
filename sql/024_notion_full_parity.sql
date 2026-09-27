-- Phase 23 — Notion OS Full Parity
-- Completes the documented Habit, Home, Learning, Projects and Today functions.
-- Reuses Shared Core entities; does not create duplicate Task / Goal / Calendar / Finance ledgers.
create extension if not exists pgcrypto;

-- ============================================================
-- HABIT OS
-- ============================================================
alter table if exists uos_habits add column if not exists level text not null default 'maintenance' check (level in ('growth','maintenance','automatic','deferred'));
alter table if exists uos_habits add column if not exists unit text;
alter table if exists uos_habits add column if not exists minimum_target numeric;
alter table if exists uos_habits add column if not exists weight int not null default 1 check (weight between 1 and 3);
alter table if exists uos_habits add column if not exists priority text not null default 'normal';
alter table if exists uos_habits add column if not exists preferred_time time;
alter table if exists uos_habits add column if not exists why text;
alter table if exists uos_habits add column if not exists reward text;
alter table if exists uos_habits add column if not exists common_triggers text;
alter table if exists uos_habits add column if not exists quit_reason text;
alter table if exists uos_habits add column if not exists recovery_plan text;
alter table if exists uos_habits add column if not exists best_clean_streak int not null default 0;
alter table if exists uos_habits add column if not exists recurrence_days jsonb not null default '[]'::jsonb;

create table if not exists uos_habit_relapses (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  habit_id uuid not null references uos_habits(id) on delete cascade,
  occurred_at timestamptz not null default now(), triggers text, related_habit_id uuid references uos_habits(id) on delete set null,
  severity int check (severity is null or severity between 1 and 10), what_happened text, recovery_plan_24h text, outcome text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_habit_journal (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, entry_date date not null default current_date,
  habit_id uuid references uos_habits(id) on delete set null, mood int check (mood is null or mood between 1 and 10),
  energy int check (energy is null or energy between 1 and 10), gratitude text, biggest_win text, learned text,
  bothering_me text, tomorrow_plan text, tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_habit_books (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, title text not null, author text, status text not null default 'to_read',
  category text, format text, language text, pages int, current_page int not null default 0, start_date date, finish_date date,
  rating numeric, key_idea text, notes text, quotes text, cover_url text, url text,
  related_habit_id uuid references uos_habits(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_habit_weekly_focus (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, week_start date not null, week_end date not null,
  habit_ids jsonb not null default '[]'::jsonb, status text not null default 'active', what_worked text, what_failed text,
  weekly_rating int check (weekly_rating is null or weekly_rating between 1 and 10), next_week_adjustment text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id, project_id, week_start)
);

create table if not exists uos_habit_achievements (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, habit_id uuid references uos_habits(id) on delete set null,
  name text not null, condition_type text not null check (condition_type in ('clean_days','completed_days','total_quantity')),
  target_value numeric not null, current_value numeric not null default 0, achieved boolean not null default false,
  achieved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ============================================================
-- HOME OS
-- ============================================================
alter table if exists uos_home_inventory add column if not exists purchase_date date;
alter table if exists uos_home_inventory add column if not exists warranty_until date;
alter table if exists uos_home_inventory add column if not exists model text;
alter table if exists uos_home_inventory add column if not exists serial_number text;
alter table if exists uos_home_inventory add column if not exists last_service_date date;
alter table if exists uos_home_maintenance add column if not exists maintenance_type text not null default 'repair' check (maintenance_type in ('preventive','repair'));
alter table if exists uos_home_maintenance add column if not exists recurrence_interval_days int;
alter table if exists uos_home_maintenance add column if not exists last_completed_at date;
alter table if exists uos_home_maintenance add column if not exists next_due_date date;
alter table if exists uos_home_maintenance add column if not exists warning_days int not null default 14;
alter table if exists uos_tasks add column if not exists recurrence_interval_days int;
alter table if exists uos_tasks add column if not exists recurrence_last_completed_at date;
alter table if exists uos_tasks add column if not exists recurrence_next_due_date date;
alter table if exists uos_tasks add column if not exists home_room_id uuid references uos_home_rooms(id) on delete set null;

create or replace view uos_home_inventory_health as
select i.*, case
  when i.kind = 'consumable' and i.reorder_point is not null and i.quantity <= i.reorder_point then 'needs_purchase'
  when i.warranty_until is not null and i.warranty_until < current_date then 'warranty_expired'
  when i.warranty_until is not null and i.warranty_until <= current_date + interval '60 days' then 'warranty_expiring'
  else 'healthy'
end as derived_health,
case when i.warranty_until is null then null when i.warranty_until < current_date then 'expired' when i.warranty_until <= current_date + interval '60 days' then 'expiring' else 'valid' end as warranty_status
from uos_home_inventory i;

-- ============================================================
-- LEARNING OS
-- ============================================================
create table if not exists uos_learning_level_tests (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, area_id uuid references uos_areas(id) on delete set null,
  title text not null, test_date date not null default current_date, tested_level text not null,
  score numeric, source text, notes text, passed boolean generated always as (coalesce(score,0) >= 80) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_learning_career_goals (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, title text not null, description text, target_date date,
  area_ids jsonb not null default '[]'::jsonb, target_progress numeric not null default 0,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_learning_vocabulary (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, area_id uuid references uos_areas(id) on delete set null,
  lesson_id uuid references uos_learning_lessons(id) on delete set null, word text not null, meaning text, part_of_speech text,
  level text, skill text, status text not null default 'new', review_date date, example_sentence text, pronunciation text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_learning_dashboard_settings (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, daily_goal_minutes int not null default 60,
  minimum_streak_minutes int not null default 10, weekly_goal_minutes int not null default 300,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id, project_id)
);

-- ============================================================
-- PROJECTS OS
-- ============================================================
create table if not exists uos_project_outputs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid not null references uos_projects(id) on delete cascade, task_id uuid references uos_tasks(id) on delete set null,
  title text not null, output_type text not null default 'document', approval_status text not null default 'draft',
  file_url text, external_url text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_project_work_sessions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid not null references uos_projects(id) on delete cascade, task_id uuid references uos_tasks(id) on delete set null,
  session_date date not null default current_date, minutes int not null default 0, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_project_risks (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid not null references uos_projects(id) on delete cascade, title text not null, description text,
  probability int not null default 1 check (probability between 1 and 5), impact int not null default 1 check (impact between 1 and 5),
  status text not null default 'open', mitigation text, owner_id uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_project_issues (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid not null references uos_projects(id) on delete cascade, title text not null, description text,
  severity text not null default 'normal', priority text not null default 'normal', status text not null default 'open',
  due_date date, owner_id uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_project_contacts (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid not null references uos_projects(id) on delete cascade, name text not null, company text, role text,
  email text, phone text, communication_status text not null default 'no_contact', notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_project_okrs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete cascade, objective text not null, period_start date, period_end date,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_project_key_results (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  okr_id uuid not null references uos_project_okrs(id) on delete cascade, title text not null, kind text not null default 'numeric',
  start_value numeric, current_value numeric, target_value numeric, project_ids jsonb not null default '[]'::jsonb,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace view uos_project_health as
select p.*,
  coalesce(t.total_leaf,0) total_leaf_tasks,
  coalesce(t.done_leaf,0) done_leaf_tasks,
  case when coalesce(t.total_leaf,0)=0 then 0 else round(coalesce(t.done_leaf,0)::numeric/t.total_leaf::numeric*100,1) end progress_percent,
  coalesce(t.overdue_leaf,0) overdue_leaf_tasks,
  coalesce(r.open_high_risks,0) open_high_risks,
  coalesce(i.open_critical_issues,0) open_critical_issues,
  case when coalesce(i.open_critical_issues,0)>0 or coalesce(r.open_high_risks,0)>0 or coalesce(t.overdue_leaf,0)>0 or (p.target_date is not null and p.target_date < current_date and coalesce(t.done_leaf,0)<coalesce(t.total_leaf,0)) then 'red'
       when p.target_date is not null and p.target_date <= current_date + interval '14 days' and coalesce(t.total_leaf,0)>0 and (coalesce(t.done_leaf,0)::numeric/nullif(t.total_leaf,0))<0.70 then 'yellow'
       else 'green' end health
from uos_projects p
left join lateral (
  select count(*) filter(where not exists(select 1 from uos_tasks c where c.parent_task_id=x.id)) total_leaf,
         count(*) filter(where not exists(select 1 from uos_tasks c where c.parent_task_id=x.id) and x.status='done') done_leaf,
         count(*) filter(where not exists(select 1 from uos_tasks c where c.parent_task_id=x.id) and x.status<>'done' and x.due_date < current_date) overdue_leaf
  from uos_tasks x where x.project_id=p.id
) t on true
left join lateral (
  select count(*) filter(where status='open' and probability*impact >= 15) open_high_risks from uos_project_risks r where r.project_id=p.id
) r on true
left join lateral (
  select count(*) filter(where status='open' and severity='critical') open_critical_issues from uos_project_issues i where i.project_id=p.id
) i on true;

-- RLS: all new tables are workspace-owned.
do $$ declare t text; begin foreach t in array array[
  'uos_habit_relapses','uos_habit_journal','uos_habit_books','uos_habit_weekly_focus','uos_habit_achievements',
  'uos_learning_level_tests','uos_learning_career_goals','uos_learning_vocabulary','uos_learning_dashboard_settings',
  'uos_project_outputs','uos_project_work_sessions','uos_project_risks','uos_project_issues','uos_project_contacts','uos_project_okrs','uos_project_key_results'
] loop
  execute format('alter table %I enable row level security',t);
  execute format('drop policy if exists %I_member_all on %I',t,t);
  execute format('create policy %I_member_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))',t,t);
end loop; end $$;

create index if not exists idx_uos_habit_relapses_ws on uos_habit_relapses(workspace_id,occurred_at desc);
create index if not exists idx_uos_habit_journal_ws on uos_habit_journal(workspace_id,entry_date desc);
create index if not exists idx_uos_habit_books_ws on uos_habit_books(workspace_id,status);
create index if not exists idx_uos_habit_focus_ws on uos_habit_weekly_focus(workspace_id,week_start desc);
create index if not exists idx_uos_habit_ach_ws on uos_habit_achievements(workspace_id,achieved);
create index if not exists idx_uos_level_tests_ws on uos_learning_level_tests(workspace_id,test_date desc);
create index if not exists idx_uos_career_goals_ws on uos_learning_career_goals(workspace_id,status);
create index if not exists idx_uos_vocab_ws on uos_learning_vocabulary(workspace_id,status,review_date);
create index if not exists idx_uos_learning_settings_ws on uos_learning_dashboard_settings(workspace_id,project_id);
create index if not exists idx_uos_project_outputs_ws on uos_project_outputs(workspace_id,project_id);
create index if not exists idx_uos_project_sessions_ws on uos_project_work_sessions(workspace_id,project_id,session_date desc);
create index if not exists idx_uos_project_risks_ws on uos_project_risks(workspace_id,project_id,status);
create index if not exists idx_uos_project_issues_ws on uos_project_issues(workspace_id,project_id,status);
create index if not exists idx_uos_project_contacts_ws on uos_project_contacts(workspace_id,project_id);
create index if not exists idx_uos_project_okrs_ws on uos_project_okrs(workspace_id,project_id,status);
create index if not exists idx_uos_project_krs_okr on uos_project_key_results(okr_id,status);

-- ============================================================
-- PROJECT/CORE RECURRENCE + TODAY helpers
-- ============================================================
create or replace view uos_today_summary as
select p.id workspace_id,
  (select count(*) from uos_tasks t where t.workspace_id=p.id and t.status <> 'done' and t.due_date = current_date) tasks_today,
  (select count(*) from uos_tasks t where t.workspace_id=p.id and t.status <> 'done' and t.due_date < current_date) overdue_tasks,
  (select count(*) from uos_habit_logs h where h.workspace_id=p.id and h.log_date=current_date and h.status='done') habits_done,
  (select count(*) from uos_learning_study_sessions s where s.workspace_id=p.id and date(s.scheduled_at)=current_date and s.status not in ('completed','cancelled','skipped')) study_pending,
  (select count(*) from uos_home_maintenance m where m.workspace_id=p.id and m.status not in ('completed','closed') and (m.due_date=current_date or m.due_date < current_date)) home_attention,
  (select count(*) from uos_home_shopping s where s.workspace_id=p.id and not s.purchased) shopping_pending,
  (select count(*) from uos_events e where e.workspace_id=p.id and e.starts_at::date=current_date) meetings_today
from uos_workspaces p;
