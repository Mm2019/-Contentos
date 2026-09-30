-- Phase 28 — Habit OS: current_streak becomes a DERIVED value.
-- Previously uos_habits.best_clean_streak was a plain editable column with no
-- calculation behind it at all. This adds a real current_streak, computed from
-- uos_habit_logs on every insert/update/delete, using the exact rule from the
-- Master Reference: 'done' and 'skipped' (vacation/preserved day) keep the
-- streak going; 'partial' and 'missed' break it.

alter table uos_habits add column if not exists current_streak int not null default 0;

create or replace function uos_calc_habit_streak(p_habit_id uuid) returns int
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_day date;
  v_status text;
  v_streak int := 0;
  v_guard int := 0;
begin
  -- Start from today; if today has no log yet, that's not a break (day isn't over) — start from yesterday.
  select status into v_status from uos_habit_logs where habit_id = p_habit_id and log_date = current_date;
  v_day := case when v_status is null then current_date - 1 else current_date end;

  loop
    v_guard := v_guard + 1;
    exit when v_guard > 3650; -- 10-year safety cap, never loop forever

    select status into v_status from uos_habit_logs where habit_id = p_habit_id and log_date = v_day;

    exit when v_status is null;                    -- no entry that day → streak ends
    exit when v_status in ('partial', 'missed');    -- explicit break

    v_streak := v_streak + 1;                       -- 'done' or 'skipped' (vacation) → keep going
    v_day := v_day - 1;
  end loop;

  return v_streak;
end $$;

create or replace function uos_recalc_habit_streak() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_habit_id uuid; v_streak int;
begin
  v_habit_id := coalesce(new.habit_id, old.habit_id);
  v_streak := uos_calc_habit_streak(v_habit_id);
  update uos_habits
    set current_streak = v_streak,
        best_clean_streak = greatest(best_clean_streak, v_streak),
        updated_at = now()
    where id = v_habit_id;
  return null;
end $$;

drop trigger if exists trg_recalc_habit_streak on uos_habit_logs;
create trigger trg_recalc_habit_streak
  after insert or update or delete on uos_habit_logs
  for each row execute function uos_recalc_habit_streak();
