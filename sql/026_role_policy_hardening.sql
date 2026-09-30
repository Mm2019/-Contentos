-- Phase 26 — Security hardening (already applied directly to the live database
-- in an earlier session; this file exists so the migration history in the repo
-- matches what is actually live in Supabase).
--
-- What it did:
--  1) Revoked EXECUTE on every SECURITY DEFINER uos_* function from
--     public/anon, granted it to authenticated + service_role only.
--  2) Pinned search_path on uos_role_rank, uos_recovery_excluded_table,
--     uos_next_recurring_date.
--  3) Set security_invoker = true on all 7 uos_* views so they respect the
--     caller's RLS instead of running as the view owner.
--  4) Granted authenticated real table privileges (select/insert/update/delete)
--     on every public table (RLS policies, already enabled on all 145 tables,
--     are what actually restrict which rows each user can see/touch).
--  5) Revoked all table privileges from anon.

do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'uos\_%' and p.prosecdef
  loop
    execute format('revoke execute on function %s from public, anon', r.sig);
    execute format('grant execute on function %s to authenticated, service_role', r.sig);
  end loop;
end $$;

alter function public.uos_role_rank set search_path = public, pg_temp;
alter function public.uos_recovery_excluded_table set search_path = public, pg_temp;
alter function public.uos_next_recurring_date set search_path = public, pg_temp;

alter view public.uos_commerce_inventory_available set (security_invoker = true);
alter view public.uos_fin_account_balances        set (security_invoker = true);
alter view public.uos_fitness_video_coverage      set (security_invoker = true);
alter view public.uos_home_inventory_health       set (security_invoker = true);
alter view public.uos_knowledge_inbox             set (security_invoker = true);
alter view public.uos_project_health              set (security_invoker = true);
alter view public.uos_today_summary               set (security_invoker = true);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
revoke all on all tables in schema public from anon;
