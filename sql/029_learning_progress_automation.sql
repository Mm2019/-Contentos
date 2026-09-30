-- Phase 29 — Learning OS: lesson progress = max(watched_minutes, session minutes).
-- Previously a lesson's watched_minutes was a plain manual field with no link
-- to actual logged Study Sessions — logging a completed session never moved
-- the lesson's progress unless the user also typed the number in manually.

create or replace function uos_recalc_lesson_watched() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_lesson_id uuid; v_session_sum int; v_duration int; v_current int;
begin
  v_lesson_id := coalesce(new.lesson_id, old.lesson_id);
  if v_lesson_id is null then return null; end if;

  select coalesce(sum(actual_minutes), 0) into v_session_sum
    from uos_learning_study_sessions where lesson_id = v_lesson_id and status = 'completed';

  select watched_minutes, duration_minutes into v_current, v_duration
    from uos_learning_lessons where id = v_lesson_id;

  update uos_learning_lessons
    set watched_minutes = greatest(coalesce(v_current, 0), v_session_sum),
        status = case
          when v_duration is not null and greatest(coalesce(v_current,0), v_session_sum) >= v_duration then 'completed'
          when greatest(coalesce(v_current,0), v_session_sum) > 0 then 'in_progress'
          else status
        end
    where id = v_lesson_id;
  return null;
end $$;

drop trigger if exists trg_recalc_lesson_watched on uos_learning_study_sessions;
create trigger trg_recalc_lesson_watched
  after insert or update or delete on uos_learning_study_sessions
  for each row execute function uos_recalc_lesson_watched();
