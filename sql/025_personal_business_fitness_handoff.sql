-- Phase 24 — Personal + Business + Fitness OS handoff implementation.
-- Adds execution-grade models on top of Unified OS Shared Core.
-- Existing ContentOS remains untouched and remains its own source of truth.
create extension if not exists pgcrypto;

-- ============================================================
-- 1) FINANCE: native recurring payment / idempotency
-- ============================================================
alter table if exists uos_fin_recurring add column if not exists currency text not null default 'EGP';
alter table if exists uos_fin_recurring add column if not exists last_payment date;
alter table if exists uos_fin_recurring add column if not exists frequency_interval int not null default 1 check (frequency_interval > 0);
alter table if exists uos_fin_recurring add column if not exists source_entity_type text;
alter table if exists uos_fin_recurring add column if not exists source_entity_id text;

create or replace function uos_next_recurring_date(p_base date, p_frequency text, p_interval int)
returns date language plpgsql immutable as $$
begin
  return case lower(coalesce(p_frequency,''))
    when 'daily' then p_base + make_interval(days => p_interval)
    when 'weekly' then p_base + make_interval(days => 7 * p_interval)
    when 'monthly' then (p_base + make_interval(months => p_interval))::date
    when 'quarterly' then (p_base + make_interval(months => 3 * p_interval))::date
    when 'yearly' then (p_base + make_interval(years => p_interval))::date
    else (p_base + make_interval(months => p_interval))::date
  end;
end $$;

create or replace function uos_log_recurring_payment(p_recurring_id uuid, p_idempotency_key text)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  r uos_fin_recurring%rowtype;
  existing_id uuid;
  tx_id uuid;
  due_date date;
begin
  select * into r from uos_fin_recurring where id=p_recurring_id for update;
  if not found then raise exception 'Recurring item not found'; end if;
  if not uos_is_member(r.workspace_id) then raise exception 'Forbidden'; end if;
  if coalesce(trim(p_idempotency_key),'') = '' then raise exception 'Idempotency key is required'; end if;

  select id into existing_id
  from uos_fin_transactions
  where workspace_id=r.workspace_id
    and source_entity_type='finance_recurring'
    and source_entity_id=r.id::text
    and external_id=p_idempotency_key
  limit 1;
  if existing_id is not null then return existing_id; end if;

  if r.next_due is null then due_date=current_date; else due_date=r.next_due; end if;
  insert into uos_fin_transactions(
    workspace_id, occurred_at, amount, type, from_account_id, to_account_id,
    category_id, description, recurring_source_id, source_entity_type, source_entity_id,
    external_id, sync_status
  ) values (
    r.workspace_id,
    coalesce(due_date::timestamptz, now()),
    r.amount,
    r.type,
    case when r.type='expense' then r.account_id else null end,
    case when r.type='income' then r.account_id else null end,
    r.category_id,
    r.name,
    r.id,
    'finance_recurring', r.id::text,
    p_idempotency_key,
    'synced'
  ) returning id into tx_id;

  update uos_fin_recurring
  set last_payment=coalesce(due_date,current_date),
      next_due=uos_next_recurring_date(coalesce(due_date,current_date), r.frequency, r.frequency_interval),
      source_entity_type=coalesce(source_entity_type,'finance_recurring'),
      source_entity_id=coalesce(source_entity_id,id::text),
      updated_at=now()
  where id=r.id;
  return tx_id;
end $$;

-- ============================================================
-- 2) HOME: asset lifecycle / maintenance scheduling
-- ============================================================
alter table if exists uos_home_inventory add column if not exists purchase_date date;
alter table if exists uos_home_inventory add column if not exists warranty_until date;
alter table if exists uos_home_inventory add column if not exists model text;
alter table if exists uos_home_inventory add column if not exists serial_number text;
alter table if exists uos_home_inventory add column if not exists last_service_date date;
alter table if exists uos_home_inventory add column if not exists home_room_id uuid references uos_home_rooms(id) on delete set null;
alter table if exists uos_home_maintenance add column if not exists maintenance_type text not null default 'repair';
alter table if exists uos_home_maintenance add column if not exists recurrence_interval_days int;
alter table if exists uos_home_maintenance add column if not exists last_completed_at timestamptz;
alter table if exists uos_home_maintenance add column if not exists next_due_date date;
alter table if exists uos_home_maintenance add column if not exists warning_days int not null default 7;

create or replace view uos_home_inventory_health as
select
  i.id, i.workspace_id, i.project_id, i.name, i.kind, i.quantity, i.stock_status,
  i.purchase_date, i.warranty_until, i.model, i.serial_number, i.last_service_date,
  case when i.warranty_until is not null and i.warranty_until < current_date then 'expired'
       when i.warranty_until is not null and i.warranty_until <= current_date + 30 then 'expiring'
       else 'ok' end as warranty_status
from uos_home_inventory i;

-- ============================================================
-- 3) FITNESS: program hierarchy
-- ============================================================
create table if not exists uos_fitness_cycles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  program_id uuid not null references uos_fitness_programs(id) on delete cascade,
  name text not null,
  number int,
  goal text,
  start_week int,
  end_week int,
  status text not null default 'planned' check(status in ('planned','active','completed','archived')),
  program_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table if exists uos_fitness_phases add column if not exists cycle_id uuid references uos_fitness_cycles(id) on delete cascade;
alter table if exists uos_fitness_phases add column if not exists phase_type text default 'training';
alter table if exists uos_fitness_phases add column if not exists is_deload boolean not null default false;

create table if not exists uos_fitness_weeks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  program_id uuid not null references uos_fitness_programs(id) on delete cascade,
  cycle_id uuid references uos_fitness_cycles(id) on delete cascade,
  phase_id uuid references uos_fitness_phases(id) on delete cascade,
  week_number int not null,
  label text,
  start_date date,
  end_date date,
  status text not null default 'planned' check(status in ('planned','active','completed','skipped')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id, program_id, week_number)
);

create table if not exists uos_fitness_workout_days (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  week_id uuid references uos_fitness_weeks(id) on delete set null,
  template_id uuid,
  scheduled_date date,
  day_ordinal int,
  day_name text,
  status text not null default 'not_started' check(status in ('not_started','in_progress','completed','skipped')),
  intensity text check(intensity in ('easy','moderate','hard')),
  difficulty text,
  energy_level int check(energy_level is null or energy_level between 1 and 10),
  reminder text,
  notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ============================================================
-- 4) FITNESS: exercises + YouTube + routines
-- ============================================================
create table if not exists uos_fitness_videos (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  name text not null,
  source_url text not null,
  video_id text not null,
  embed_url text not null,
  verification_status text not null default 'needs_verification' check(verification_status in ('verified','needs_verification','broken','replaced')),
  last_verified_at timestamptz,
  backup_video_id uuid references uos_fitness_videos(id) on delete set null,
  category text,
  difficulty text,
  channel text,
  favorite boolean not null default false,
  notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id, video_id)
);

alter table if exists uos_fitness_exercises add column if not exists slug text;
alter table if exists uos_fitness_exercises add column if not exists primary_muscle text;
alter table if exists uos_fitness_exercises add column if not exists secondary_muscles jsonb not null default '[]'::jsonb;
alter table if exists uos_fitness_exercises add column if not exists movement_pattern text;
alter table if exists uos_fitness_exercises add column if not exists equipment jsonb not null default '[]'::jsonb;
alter table if exists uos_fitness_exercises add column if not exists difficulty text;
alter table if exists uos_fitness_exercises add column if not exists form_cues jsonb not null default '[]'::jsonb;
alter table if exists uos_fitness_exercises add column if not exists common_mistakes jsonb not null default '[]'::jsonb;
alter table if exists uos_fitness_exercises add column if not exists default_sets int;
alter table if exists uos_fitness_exercises add column if not exists default_reps int;
alter table if exists uos_fitness_exercises add column if not exists default_duration int;
alter table if exists uos_fitness_exercises add column if not exists rest_seconds int;
alter table if exists uos_fitness_exercises add column if not exists progression text;
alter table if exists uos_fitness_exercises add column if not exists regression text;
alter table if exists uos_fitness_exercises add column if not exists safety_notes text;
alter table if exists uos_fitness_exercises add column if not exists primary_video_id uuid references uos_fitness_videos(id) on delete set null;
alter table if exists uos_fitness_exercises add column if not exists backup_video_id uuid references uos_fitness_videos(id) on delete set null;
alter table if exists uos_fitness_exercises add column if not exists archived_at timestamptz;

create unique index if not exists idx_uos_fitness_exercise_slug on uos_fitness_exercises(workspace_id, slug) where slug is not null;

create or replace view uos_fitness_video_coverage as
select
  e.id as exercise_id,
  e.workspace_id,
  e.project_id,
  e.name,
  e.primary_video_id,
  e.backup_video_id,
  pv.verification_status as primary_status,
  bv.verification_status as backup_status,
  case when e.archived_at is null and e.primary_video_id is null and e.backup_video_id is null then true else false end as needs_video
from uos_fitness_exercises e
left join uos_fitness_videos pv on pv.id=e.primary_video_id
left join uos_fitness_videos bv on bv.id=e.backup_video_id;

create table if not exists uos_fitness_accessory_routines (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  name text not null,
  type text not null default 'mobility',
  duration_minutes int,
  frequency text,
  ordered_exercise_ids jsonb not null default '[]'::jsonb,
  primary_video_id uuid references uos_fitness_videos(id) on delete set null,
  backup_video_id uuid references uos_fitness_videos(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_accessory_completions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  routine_id uuid not null references uos_fitness_accessory_routines(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  date date not null default current_date,
  completed boolean not null default false,
  duration_actual int,
  notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id, routine_id, date)
);

-- ============================================================
-- 5) FITNESS: template + immutable versioning + plan execution
-- ============================================================
create table if not exists uos_fitness_workout_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  template_key text not null,
  name text not null,
  type text not null default 'strength',
  muscle_group text,
  base_duration int,
  program_version int not null default 1,
  cycle_id uuid references uos_fitness_cycles(id) on delete set null,
  phase_id uuid references uos_fitness_phases(id) on delete set null,
  version_notes text,
  attached_video_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id, template_key, program_version)
);

create table if not exists uos_fitness_template_exercise_blocks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  template_id uuid not null references uos_fitness_workout_templates(id) on delete cascade,
  exercise_id uuid not null references uos_fitness_exercises(id) on delete restrict,
  block_order int not null default 0,
  sets int,
  target_reps int,
  target_duration int,
  rest_seconds int,
  notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_template_accessory_blocks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  template_id uuid not null references uos_fitness_workout_templates(id) on delete cascade,
  routine_id uuid not null references uos_fitness_accessory_routines(id) on delete restrict,
  block_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table if exists uos_fitness_workout_days add column if not exists template_id uuid references uos_fitness_workout_templates(id) on delete set null;
alter table if exists uos_fitness_sessions add column if not exists workout_day_id uuid references uos_fitness_workout_days(id) on delete set null;
alter table if exists uos_fitness_sessions add column if not exists program_version int not null default 1;
alter table if exists uos_fitness_sessions add column if not exists ended_at timestamptz;
alter table if exists uos_fitness_sessions add column if not exists rpe numeric;
alter table if exists uos_fitness_sessions add column if not exists energy int check (energy is null or energy between 1 and 10);
alter table if exists uos_fitness_sessions add column if not exists completion_percent numeric check (completion_percent is null or completion_percent between 0 and 100);
alter table if exists uos_fitness_sessions add column if not exists plan_snapshot jsonb not null default '{}'::jsonb;

create table if not exists uos_fitness_set_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  session_id uuid not null references uos_fitness_sessions(id) on delete cascade,
  exercise_id uuid not null references uos_fitness_exercises(id) on delete restrict,
  set_number int not null,
  reps int,
  weight_load numeric,
  duration int,
  rpe numeric,
  rest_seconds int,
  completed boolean not null default true,
  notes text,
  idempotency_key text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id, idempotency_key)
);

create table if not exists uos_fitness_cardio_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  session_id uuid not null references uos_fitness_sessions(id) on delete cascade,
  type text not null check(type in ('LISS','HIIT','Running','Walking','Shadow Boxing','Other')),
  duration int,
  distance numeric,
  pace numeric,
  speed numeric,
  heart_rate int,
  rpe numeric,
  notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ============================================================
-- 6) FITNESS: progress/reviews/photos/assessments
-- ============================================================
create table if not exists uos_fitness_progress_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  week_id uuid references uos_fitness_weeks(id) on delete set null,
  measured_at date not null default current_date,
  weight numeric, chest numeric, waist numeric, thigh numeric, arm numeric,
  energy numeric, stress numeric, average_sleep numeric, max_push_ups int,
  running_distance numeric, running_time int, plank_time int, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists uos_fitness_progress_photos (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  date date not null default current_date,
  type text not null check(type in ('Front','Side','Back')),
  file_url text not null,
  week_id uuid references uos_fitness_weeks(id) on delete set null,
  phase_id uuid references uos_fitness_phases(id) on delete set null,
  cycle_id uuid references uos_fitness_cycles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists uos_fitness_weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  week_id uuid references uos_fitness_weeks(id) on delete cascade,
  title text not null,
  skipped_workouts int not null default 0,
  strength_score int check(strength_score is null or strength_score between 0 and 10),
  cardio_score int check(cardio_score is null or cardio_score between 0 and 10),
  mobility_score int check(mobility_score is null or mobility_score between 0 and 10),
  recovery_score int check(recovery_score is null or recovery_score between 0 and 10),
  mma_score int check(mma_score is null or mma_score between 0 and 10),
  energy_score int check(energy_score is null or energy_score between 0 and 10),
  improved text, difficult text, next_week_change text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id,week_id)
);

create table if not exists uos_fitness_cycle_assessments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  cycle_id uuid not null references uos_fitness_cycles(id) on delete cascade,
  completion_percent numeric,
  max_push_ups int, weight numeric, running_distance numeric, running_time int,
  strength_notes text, cardio_notes text, mma_footwork_score numeric,
  energy numeric, difficulty numeric, flexibility numeric, recovery numeric,
  what_worked text, what_needs_change text, next_cycle_plan text,
  start_progress_id uuid references uos_fitness_progress_records(id) on delete set null,
  end_progress_id uuid references uos_fitness_progress_records(id) on delete set null,
  start_photo_id uuid references uos_fitness_progress_photos(id) on delete set null,
  end_photo_id uuid references uos_fitness_progress_photos(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ============================================================
-- 7) BUSINESS modules missing from the current surface
-- ============================================================
create table if not exists uos_business_customers (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  name text not null, email text, phone text, company text,
  stage text not null default 'new' check(stage in ('new','contacted','qualified','proposal','negotiation','won','lost')),
  source text, notes text, last_contact_at timestamptz, next_follow_up_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_customer_stage_history (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  customer_id uuid not null references uos_business_customers(id) on delete cascade,
  from_stage text, to_stage text not null, changed_at timestamptz not null default now(), note text
);
create table if not exists uos_business_marketing_campaigns (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, name text not null, channel text,
  audience text, creative text, status text not null default 'draft', spend numeric default 0,
  clicks int default 0, impressions int default 0, conversions int default 0, revenue numeric default 0,
  started_at date, ended_at date, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_seo_keywords (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, keyword text not null, intent text, search_volume numeric,
  difficulty numeric, target_url text, status text not null default 'research', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_seo_content (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, title text not null, content_url text, keyword_id uuid references uos_business_seo_keywords(id) on delete set null,
  status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_seo_tasks (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, title text not null, type text, status text not null default 'todo',
  due_date date, related_content_id uuid references uos_business_seo_content(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_seo_snapshots (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, keyword_id uuid references uos_business_seo_keywords(id) on delete set null,
  captured_at date not null default current_date, position numeric, clicks numeric, impressions numeric, ctr numeric, notes text,
  created_at timestamptz not null default now()
);
create table if not exists uos_business_affiliate_programs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, name text not null, network text, terms text, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_affiliate_merchants (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, program_id uuid references uos_business_affiliate_programs(id) on delete set null, name text not null, website text, commission_rate numeric,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_affiliate_links (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, merchant_id uuid references uos_business_affiliate_merchants(id) on delete set null, label text not null, tracking_url text, external_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_affiliate_conversions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, link_id uuid references uos_business_affiliate_links(id) on delete set null, occurred_at timestamptz not null default now(), order_ref text, revenue numeric default 0, commission numeric default 0, status text not null default 'pending',
  unique(workspace_id, order_ref)
);
create table if not exists uos_business_affiliate_payouts (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, program_id uuid references uos_business_affiliate_programs(id) on delete set null, amount numeric not null default 0, paid_at date, status text not null default 'pending', notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_digital_products (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, name text not null, description text, price numeric not null default 0, currency text not null default 'EGP', status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_digital_assets (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  product_id uuid not null references uos_business_digital_products(id) on delete cascade, name text not null, asset_type text, url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_digital_versions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  product_id uuid not null references uos_business_digital_products(id) on delete cascade, version text not null, changelog text, released_at date, status text not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id,product_id,version)
);
create table if not exists uos_business_digital_platforms (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  product_id uuid not null references uos_business_digital_products(id) on delete cascade, name text not null, url text, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists uos_business_digital_sales (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  product_id uuid not null references uos_business_digital_products(id) on delete restrict, platform_id uuid references uos_business_digital_platforms(id) on delete set null, customer text, occurred_at timestamptz not null default now(), amount numeric not null default 0, currency text not null default 'EGP', external_id text, finance_transaction_id uuid references uos_fin_transactions(id) on delete set null,
  unique(workspace_id,external_id)
);
create table if not exists uos_business_digital_refunds (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  sale_id uuid not null references uos_business_digital_sales(id) on delete cascade, amount numeric not null default 0, reason text, refunded_at timestamptz not null default now(), finance_transaction_id uuid references uos_fin_transactions(id) on delete set null, status text not null default 'requested', created_at timestamptz not null default now()
);
create table if not exists uos_business_creator_sponsorships (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null, brand text not null, deliverable text, status text not null default 'lead', agreed_fee numeric default 0, currency text not null default 'EGP', start_date date, end_date date, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Product workflow versioning: active feature records keep their originating workflow version.
create table if not exists uos_product_workflow_configs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete cascade, workflow_key text not null, version int not null default 1,
  stages jsonb not null default '[]'::jsonb, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id,project_id,workflow_key,version)
);
alter table if exists uos_product_features add column if not exists workflow_version int not null default 1;
alter table if exists uos_product_features add column if not exists workflow_snapshot jsonb not null default '{}'::jsonb;
create table if not exists uos_product_feature_status_history (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  feature_id uuid not null references uos_product_features(id) on delete cascade, workflow_version int not null, from_status text, to_status text not null, changed_at timestamptz not null default now(), actor_id uuid references auth.users(id) on delete set null
);

-- Commerce reserve/release primitives to keep inventory math server-side.
create or replace function uos_reserve_inventory(p_inventory_id uuid, p_quantity numeric)
returns numeric language plpgsql security definer set search_path=public as $$
declare r uos_commerce_inventory%rowtype; available numeric;
begin
  if p_quantity is null or p_quantity <= 0 then raise exception 'Quantity must be positive'; end if;
  select * into r from uos_commerce_inventory where id=p_inventory_id for update;
  if not found then raise exception 'Inventory not found'; end if;
  if not uos_is_member(r.workspace_id) then raise exception 'Forbidden'; end if;
  available=greatest(r.on_hand-r.reserved-r.damaged,0);
  if available < p_quantity then raise exception 'Insufficient available inventory'; end if;
  update uos_commerce_inventory set reserved=reserved+p_quantity, updated_at=now() where id=r.id;
  return available-p_quantity;
end $$;

create or replace function uos_release_inventory(p_inventory_id uuid, p_quantity numeric)
returns numeric language plpgsql security definer set search_path=public as $$
declare r uos_commerce_inventory%rowtype; new_reserved numeric;
begin
  if p_quantity is null or p_quantity <= 0 then raise exception 'Quantity must be positive'; end if;
  select * into r from uos_commerce_inventory where id=p_inventory_id for update;
  if not found then raise exception 'Inventory not found'; end if;
  if not uos_is_member(r.workspace_id) then raise exception 'Forbidden'; end if;
  new_reserved=greatest(r.reserved-p_quantity,0);
  update uos_commerce_inventory set reserved=new_reserved, updated_at=now() where id=r.id;
  return greatest(r.on_hand-new_reserved-r.damaged,0);
end $$;

-- CRM stage history trigger.
create or replace function uos_business_customer_stage_audit() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='UPDATE' and old.stage is distinct from new.stage then
    insert into uos_business_customer_stage_history(workspace_id,customer_id,from_stage,to_stage,note)
    values(new.workspace_id,new.id,old.stage,new.stage,null);
  end if;
  return new;
end $$;
drop trigger if exists trg_uos_business_customer_stage on uos_business_customers;
create trigger trg_uos_business_customer_stage after update of stage on uos_business_customers for each row execute function uos_business_customer_stage_audit();

-- Dynamic project module catalog extensions.
insert into uos_project_module_catalog(key,label,module_group,route,subsystem) values
('CRM','CRM','Operations','/business',false),('SEO','SEO','Growth','/business',false),('DigitalProducts','Digital Products','Commerce','/business',false),('CreatorBusiness','Creator Business','Growth','/business',false)
on conflict (key) do update set label=excluded.label,module_group=excluded.module_group,route=excluded.route,subsystem=excluded.subsystem,updated_at=now();

do $$ begin
  if not exists (select 1 from pg_constraint where conname='fk_uos_fitness_workout_days_template') then
    alter table uos_fitness_workout_days
      add constraint fk_uos_fitness_workout_days_template
      foreign key (template_id) references uos_fitness_workout_templates(id) on delete set null;
  end if;
end $$;

-- RLS for Phase 24 tables.
do $$ declare t text; begin foreach t in array array[
  'uos_fitness_cycles','uos_fitness_weeks','uos_fitness_workout_days','uos_fitness_videos','uos_fitness_accessory_routines','uos_fitness_accessory_completions',
  'uos_fitness_workout_templates','uos_fitness_template_exercise_blocks','uos_fitness_template_accessory_blocks','uos_fitness_set_logs','uos_fitness_cardio_logs',
  'uos_fitness_progress_records','uos_fitness_progress_photos','uos_fitness_weekly_reviews','uos_fitness_cycle_assessments',
  'uos_business_customers','uos_business_customer_stage_history','uos_business_marketing_campaigns','uos_business_seo_keywords','uos_business_seo_content','uos_business_seo_tasks','uos_business_seo_snapshots',
  'uos_business_affiliate_programs','uos_business_affiliate_merchants','uos_business_affiliate_links','uos_business_affiliate_conversions','uos_business_affiliate_payouts',
  'uos_business_digital_products','uos_business_digital_assets','uos_business_digital_versions','uos_business_digital_platforms','uos_business_digital_sales','uos_business_digital_refunds','uos_business_creator_sponsorships',
  'uos_product_workflow_configs','uos_product_feature_status_history'
] loop
  execute format('alter table %I enable row level security',t);
  execute format('drop policy if exists %I_member_all on %I',t,t);
  execute format('create policy %I_member_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))',t,t);
end loop; end $$;

-- Useful indexes.
create index if not exists idx_uos_fitness_cycles_ws on uos_fitness_cycles(workspace_id,project_id,program_id,number);
create index if not exists idx_uos_fitness_weeks_ws on uos_fitness_weeks(workspace_id,project_id,start_date,week_number);
create index if not exists idx_uos_fitness_days_date on uos_fitness_workout_days(workspace_id,project_id,scheduled_date);
create index if not exists idx_uos_fitness_videos_ws on uos_fitness_videos(workspace_id,project_id,verification_status);
create index if not exists idx_uos_fitness_sets_session on uos_fitness_set_logs(session_id,set_number);
create index if not exists idx_uos_fitness_cardio_session on uos_fitness_cardio_logs(session_id);
create index if not exists idx_uos_fitness_progress_ws on uos_fitness_progress_records(workspace_id,project_id,measured_at desc);
create index if not exists idx_uos_fitness_reviews_ws on uos_fitness_weekly_reviews(workspace_id,project_id,created_at desc);
create index if not exists idx_uos_business_customer_ws on uos_business_customers(workspace_id,project_id,stage,created_at desc);
create index if not exists idx_uos_business_marketing_ws on uos_business_marketing_campaigns(workspace_id,project_id,status);
create index if not exists idx_uos_business_seo_keyword_ws on uos_business_seo_keywords(workspace_id,project_id,status);
create index if not exists idx_uos_business_affiliate_ws on uos_business_affiliate_programs(workspace_id,project_id,status);
create index if not exists idx_uos_business_digital_product_ws on uos_business_digital_products(workspace_id,project_id,status);
create index if not exists idx_uos_business_creator_ws on uos_business_creator_sponsorships(workspace_id,project_id,status);
create index if not exists idx_uos_product_workflow_ws on uos_product_workflow_configs(workspace_id,project_id,workflow_key,version desc);
