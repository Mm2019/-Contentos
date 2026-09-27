-- Phase 6 — Project Profiles + Enabled Modules
-- This is configuration metadata above Shared Core. It does not duplicate ContentOS data.
create table if not exists uos_project_profiles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null unique,
  default_modules jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_project_module_catalog (
  key text primary key,
  label text not null,
  module_group text not null,
  route text,
  subsystem boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table uos_projects add column if not exists project_profile_id uuid references uos_project_profiles(id) on delete set null;
alter table uos_projects add column if not exists module_config_version int not null default 1;

insert into uos_project_profiles(key,name,default_modules) values
('personal_research','Personal / Research','["Tasks","Goals","Calendar","Knowledge"]'::jsonb),
('app_saas','App / SaaS','["Tasks","Goals","Calendar","Product","PRD","Features","Releases","QA","Support","Analytics","Finance","Team"]'::jsonb),
('marketplace','Marketplace','["Tasks","Goals","Calendar","Marketplace","Analytics","Finance","Marketing","Support","Team","ContentOS"]'::jsonb),
('ecommerce','E-commerce','["Tasks","Goals","Calendar","Product","Marketplace","Analytics","Finance","Marketing","ContentOS"]'::jsonb),
('content_creator','Content / Creator','["Tasks","Goals","Calendar","ContentOS","Analytics","Marketing","Finance","Affiliate"]'::jsonb),
('blog_seo','Blog / SEO','["Tasks","Goals","Calendar","ContentOS","Knowledge","Analytics","Marketing"]'::jsonb),
('affiliate','Affiliate','["Tasks","Goals","Calendar","ContentOS","Analytics","Marketing","Finance","Affiliate"]'::jsonb),
('digital_product','Digital Product','["Tasks","Goals","Calendar","Product","ContentOS","Analytics","Finance","Marketing"]'::jsonb),
('delivery_logistics','Delivery / Logistics','["Tasks","Goals","Calendar","Operations","Analytics","Finance","Support"]'::jsonb),
('service_business','Service Business','["Tasks","Goals","Calendar","Customers","Operations","Finance","Analytics","Support","ContentOS"]'::jsonb),
('internal_tool','Internal Tool','["Tasks","Goals","Calendar","Product","PRD","Features","Releases","QA","Knowledge"]'::jsonb),
('community','Community','["Tasks","Goals","Calendar","ContentOS","Marketing","Analytics","Support","Team"]'::jsonb),
('media','Media','["Tasks","Goals","Calendar","ContentOS","Publishing","Analytics","Marketing","Finance","Team"]'::jsonb),
('hybrid','Hybrid','["Tasks","Goals","Calendar","Analytics","Finance"]'::jsonb)
on conflict (key) do update set name=excluded.name, default_modules=excluded.default_modules, updated_at=now();

insert into uos_project_module_catalog(key,label,module_group,route,subsystem) values
('Tasks','Tasks','Core','/tasks',false),
('Goals','Goals','Core','/goals',false),
('Calendar','Calendar','Core','/calendar',false),
('Finance','Finance','Core','/finance',false),
('Knowledge','Knowledge','Core','/resources',false),
('Team','Team','Core','/projects',false),
('ContentOS','ContentOS','Content','/contentos',true),
('Publishing','Publishing','Content','/contentos',false),
('Marketing','Marketing','Growth','/projects',false),
('Analytics','Analytics','Growth','/projects',false),
('Affiliate','Affiliate','Growth','/projects',false),
('Product','Product','Product','/projects',false),
('PRD','PRD','Product','/projects',false),
('Features','Features','Product','/projects',false),
('Releases','Releases','Product','/projects',false),
('QA','QA','Product','/projects',false),
('Support','Support','Operations','/projects',false),
('Customers','Customers','Operations','/projects',false),
('Operations','Operations','Operations','/projects',false),
('Marketplace','Marketplace','Commerce','/projects',false),
('Commerce','Commerce','Commerce','/projects',false)
on conflict (key) do update set label=excluded.label,module_group=excluded.module_group,route=excluded.route,subsystem=excluded.subsystem,updated_at=now();

update uos_projects p
set project_profile_id = pp.id
from uos_project_profiles pp
where p.project_profile_id is null and p.project_profile = pp.name;

alter table uos_project_profiles enable row level security;
alter table uos_project_module_catalog enable row level security;

drop policy if exists uos_project_profiles_read on uos_project_profiles;
create policy uos_project_profiles_read on uos_project_profiles for select to authenticated using (active);

drop policy if exists uos_project_module_catalog_read on uos_project_module_catalog;
create policy uos_project_module_catalog_read on uos_project_module_catalog for select to authenticated using (active);

create index if not exists idx_uos_projects_profile on uos_projects(project_profile_id);

create or replace function uos_sync_project_profile_id() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.project_profile is not null then
    select id into new.project_profile_id
    from uos_project_profiles
    where name = new.project_profile and active
    limit 1;
  end if;
  return new;
end $$;

drop trigger if exists trg_uos_projects_sync_profile on uos_projects;
create trigger trg_uos_projects_sync_profile
before insert or update of project_profile on uos_projects
for each row execute function uos_sync_project_profile_id();
