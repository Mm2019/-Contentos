-- Unified OS security hardening. Run after migrations 010-025.
-- Replaces permissive member-wide policies on every public table with workspace role policies.
do $$
declare r record; pol record;
begin
  for r in
    select c.table_schema, c.table_name
    from information_schema.columns c
    join information_schema.tables t on t.table_schema=c.table_schema and t.table_name=c.table_name
    where c.table_schema='public' and c.column_name='workspace_id' and t.table_type='BASE TABLE'
      and c.table_name not in ('uos_workspaces','uos_workspace_members','uos_project_members','uos_finance_permissions','uos_audit_log','uos_recovery_items','uos_recovery_runs','uos_recovery_snapshots','uos_migration_log','uos_schema_registry')
  loop
    for pol in select policyname from pg_policies where schemaname=r.table_schema and tablename=r.table_name loop
      execute format('drop policy if exists %I on %I.%I', pol.policyname, r.table_schema, r.table_name);
    end loop;
    execute format('alter table %I.%I enable row level security',r.table_schema,r.table_name);
    execute format('create policy uos_role_read on %I.%I for select using (uos_can_read_workspace(workspace_id))',r.table_schema,r.table_name);
    execute format('create policy uos_role_insert on %I.%I for insert with check (uos_can_write_workspace(workspace_id))',r.table_schema,r.table_name);
    execute format('create policy uos_role_update on %I.%I for update using (uos_can_write_workspace(workspace_id)) with check (uos_can_write_workspace(workspace_id))',r.table_schema,r.table_name);
    execute format('create policy uos_role_delete on %I.%I for delete using (uos_can_delete_workspace(workspace_id))',r.table_schema,r.table_name);
  end loop;
end $$;

-- Add a workspace member by email without exposing auth.users to the client.
create or replace function public.uos_add_workspace_member_by_email(p_workspace uuid, p_email text, p_role text default 'viewer')
returns uuid language plpgsql security definer set search_path=public, auth as $$
declare v_user uuid;
begin
  if not uos_can_manage_workspace(p_workspace) then raise exception 'Forbidden'; end if;
  if p_role not in ('viewer','contributor','editor','manager','admin') then raise exception 'Invalid role'; end if;
  select id into v_user from auth.users where lower(email)=lower(trim(p_email)) limit 1;
  if v_user is null then raise exception 'No registered user found with that email'; end if;
  insert into public.uos_workspace_members(workspace_id,user_id,role,active)
  values(p_workspace,v_user,p_role,true)
  on conflict (workspace_id,user_id) do update set role=excluded.role, active=true;
  return v_user;
end $$;
revoke all on function public.uos_add_workspace_member_by_email(uuid,text,text) from public;
grant execute on function public.uos_add_workspace_member_by_email(uuid,text,text) to authenticated;
