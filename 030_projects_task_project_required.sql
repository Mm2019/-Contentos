-- Phase 30 — Projects OS: "every task MUST retain an explicit Project
-- relationship" (Master Reference §8). project_id was nullable, so tasks
-- could exist with no project at all. Fixed non-destructively:
--   1) Give every workspace an "Inbox" catch-all project (created lazily).
--   2) Backfill existing project-less tasks into it.
--   3) A BEFORE INSERT trigger auto-assigns the Inbox project to any new
--      task created without one, so the column can safely become NOT NULL
--      without requiring an immediate frontend change.

create or replace function uos_get_or_create_inbox_project(p_workspace_id uuid) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  select id into v_id from uos_projects
    where workspace_id = p_workspace_id and name = 'Inbox' and project_type = 'system_inbox'
    limit 1;
  if v_id is not null then return v_id; end if;

  insert into uos_projects (workspace_id, name, project_type, status, description)
    values (p_workspace_id, 'Inbox', 'system_inbox', 'active', 'Default holder for tasks created without a project.')
    returning id into v_id;
  return v_id;
end $$;

-- Backfill: every existing task without a project moves into that workspace's Inbox.
do $$
declare r record;
begin
  for r in select distinct workspace_id from uos_tasks where project_id is null loop
    update uos_tasks set project_id = uos_get_or_create_inbox_project(r.workspace_id)
      where workspace_id = r.workspace_id and project_id is null;
  end loop;
end $$;

-- Going forward: auto-assign Inbox if a task is inserted without a project.
create or replace function uos_default_task_project() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.project_id is null then
    new.project_id := uos_get_or_create_inbox_project(new.workspace_id);
  end if;
  return new;
end $$;

drop trigger if exists trg_default_task_project on uos_tasks;
create trigger trg_default_task_project
  before insert on uos_tasks
  for each row execute function uos_default_task_project();

-- Now safe: every row has a project, and every future insert will too.
alter table uos_tasks alter column project_id set not null;

grant execute on function uos_get_or_create_inbox_project(uuid) to authenticated, service_role;
revoke execute on function uos_get_or_create_inbox_project(uuid) from public, anon;
