from pathlib import Path

root=Path('/mnt/data/phase16')

# 1) Add Phase 16 migration.
sql=root/'sql/019_personal_home_fitness_habits.sql'
sql.write_text(r'''-- Phase 16 — Complete Personal OS: Home + Fitness + Habits.
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
''')

# 2) Project modules registry.
pm=root/'src/lib/projectModules.js'
s=pm.read_text()
s=s.replace("defaultModules: ['Tasks','Goals','Calendar','Knowledge','Learning']", "defaultModules: ['Tasks','Goals','Calendar','Knowledge','Learning','Habits','Fitness','Home']", 1)
s=s.replace("  { key: 'Learning', label: 'Learning', group: 'Core', route: '/learning' },", "  { key: 'Learning', label: 'Learning', group: 'Core', route: '/learning' },\n  { key: 'Habits', label: 'Habits', group: 'Personal', route: '/habits' },\n  { key: 'Fitness', label: 'Fitness', group: 'Personal', route: '/fitness' },\n  { key: 'Home', label: 'Home', group: 'Personal', route: '/home' },")
s=s.replace("export const MODULE_GROUPS = ['Core','Content','Growth','Product','Operations','Commerce']", "export const MODULE_GROUPS = ['Core','Personal','Content','Growth','Product','Operations','Commerce']")
pm.write_text(s)

# 3) ProjectDetail links.
pd=root/'src/pages/ProjectDetail.jsx'
s=pd.read_text()
s=s.replace("  if(module.key==='Learning') return <Link className=\"chip selected\" to={`/projects/${projectId}/learning`}>{module.label} ↗</Link>\n  return <span className=\"chip\">{module.label}</span>", "  if(module.key==='Learning') return <Link className=\"chip selected\" to={`/projects/${projectId}/learning`}>{module.label} ↗</Link>\n  if(module.key==='Habits') return <Link className=\"chip selected\" to={`/projects/${projectId}/habits`}>{module.label} ↗</Link>\n  if(module.key==='Fitness') return <Link className=\"chip selected\" to={`/projects/${projectId}/fitness`}>{module.label} ↗</Link>\n  if(module.key==='Home') return <Link className=\"chip selected\" to={`/projects/${projectId}/home`}>{module.label} ↗</Link>\n  return <span className=\"chip\">{module.label}</span>")
pd.write_text(s)

# 4) main routes.
main=root/'src/main.jsx'
s=main.read_text()
s=s.replace("              <Route path=\"/habits\" element={<Habits />} />", "              <Route path=\"/habits\" element={<Habits />} />\n              <Route path=\"/projects/:id/habits\" element={<Habits />} />")
s=s.replace("              <Route path=\"/fitness\" element={<Fitness />} />", "              <Route path=\"/fitness\" element={<Fitness />} />\n              <Route path=\"/projects/:id/fitness\" element={<Fitness />} />")
s=s.replace("              <Route path=\"/home\" element={<HomeOS />} />", "              <Route path=\"/home\" element={<HomeOS />} />\n              <Route path=\"/projects/:id/home\" element={<HomeOS />} />")
main.write_text(s)

# 5) Enhanced Habits.jsx
hab=root/'src/pages/Habits.jsx'
hab.write_text(r'''import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createEntity, deleteEntity, listEntities } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

const STATUSES=['done','partial','missed','skipped']
function weekStart(){ const d=new Date(); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return d.toISOString().slice(0,10) }
function weekEnd(){ const d=new Date(weekStart()); d.setDate(d.getDate()+6); return d.toISOString().slice(0,10) }

export default function Habits(){
 const {id:projectId}=useParams(); const {workspace}=useWorkspace()
 const [rows,setRows]=useState([]),[logs,setLogs]=useState([]),[reviews,setReviews]=useState([]),[error,setError]=useState('')
 const [log,setLog]=useState({}),[form,setForm]=useState({name:'',type:'boolean',frequency:'daily',target:'',category:'',start_date:'',goal:''})
 const [review,setReview]=useState({summary:'',wins:'',misses:'',blockers:'',next_focus:''})
 async function load(){if(!workspace)return;try{const [h,l,r]=await Promise.all([listEntities('uos_habits',workspace.id),listEntities('uos_habit_logs',workspace.id,'log_date'),listEntities('uos_habit_weekly_reviews',workspace.id,'week_start')]);setRows(projectId?h.filter(x=>x.project_id===projectId||!x.project_id):h);setLogs(l);setReviews(projectId?r.filter(x=>x.project_id===projectId||!x.project_id):r);setLog(Object.fromEntries(l.filter(x=>x.log_date===new Date().toISOString().slice(0,10)).map(x=>[x.habit_id,x.status])))}catch(e){setError(e.message)}}
 useEffect(()=>{load()},[workspace?.id,projectId])
 async function submit(e){e.preventDefault();try{await createEntity('uos_habits',{workspace_id:workspace.id,project_id:projectId||null,...form,target:form.target?Number(form.target):null});setForm({name:'',type:'boolean',frequency:'daily',target:'',category:'',start_date:'',goal:''});load()}catch(e){setError(e.message)}}
 async function mark(h,status){try{const today=new Date().toISOString().slice(0,10);const existing=logs.find(x=>x.habit_id===h.id&&x.log_date===today);if(existing) await (await import('../lib/core')).updateEntity('uos_habit_logs',existing.id,{status,actual_value:h.target||1});else await createEntity('uos_habit_logs',{workspace_id:workspace.id,project_id:projectId||null,habit_id:h.id,log_date:today,status,actual_value:h.target||1});load()}catch(e){setError(e.message)}}
 async function saveReview(e){e.preventDefault();try{await createEntity('uos_habit_weekly_reviews',{workspace_id:workspace.id,project_id:projectId||null,week_start:weekStart(),week_end:weekEnd(),...review});setReview({summary:'',wins:'',misses:'',blockers:'',next_focus:''});load()}catch(e){setError(e.message)}}
 const completion=useMemo(()=>{const mine=logs.filter(l=>rows.some(h=>h.id===l.habit_id)); return {done:mine.filter(l=>l.status==='done').length, total:mine.length}},[logs,rows])
 return <div><header className="page-head"><div><div className="eyebrow">PERSONAL OS · HABIT</div><h1>Habits</h1><p className="muted">Habit Master + Daily Log + Weekly Review. العادة ليست Task.</p><div className="chip-row"><span className="chip selected">{projectId?'Project-scoped':'Workspace-wide'}</span><span className="chip">Today: {completion.done}/{completion.total || rows.length} done</span></div></div></header>{error&&<div className="error">{error}</div>}
 <div className="card"><form onSubmit={submit}><div className="form-grid"><input placeholder="العادة" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><select value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}><option>daily</option><option>weekly</option><option>custom</option></select><input placeholder="الهدف" type="number" value={form.target} onChange={e=>setForm({...form,target:e.target.value})}/><input placeholder="الفئة" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><input placeholder="تاريخ البداية" type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})}/><input placeholder="الهدف الأكبر" value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}/><button className="primary">إضافة</button></div></form></div>
 <section className="section"><div className="grid grid-2">{rows.map(h=><div className="card" key={h.id}><div className="between"><strong>{h.name}</strong><button className="danger" onClick={()=>deleteEntity('uos_habits',h.id).then(load)}>حذف</button></div><div className="muted">{h.frequency} · {h.category||'بدون فئة'}{h.goal?` · ${h.goal}`:''}</div><div className="actions" style={{marginTop:10}}>{STATUSES.map(s=><button key={s} className="secondary" onClick={()=>mark(h,s)}>{s}</button>)}<span className="chip">{log[h.id]||'لم يسجل اليوم'}</span></div></div>)}{!rows.length&&<div className="card muted">لا توجد عادات بعد.</div>}</div></section>
 <section className="section grid grid-2"><div className="card"><h3>Weekly Review</h3><form className="form-stack" onSubmit={saveReview}><textarea rows="2" placeholder="ملخص الأسبوع" value={review.summary} onChange={e=>setReview({...review,summary:e.target.value})}/><textarea rows="2" placeholder="Wins" value={review.wins} onChange={e=>setReview({...review,wins:e.target.value})}/><textarea rows="2" placeholder="Misses" value={review.misses} onChange={e=>setReview({...review,misses:e.target.value})}/><textarea rows="2" placeholder="Blockers" value={review.blockers} onChange={e=>setReview({...review,blockers:e.target.value})}/><textarea rows="2" placeholder="Next focus" value={review.next_focus} onChange={e=>setReview({...review,next_focus:e.target.value})}/><button className="primary">حفظ مراجعة الأسبوع</button></form></div><div className="card"><h3>Recent Reviews</h3>{reviews.slice(0,8).map(r=><div className="list-row" key={r.id}><strong>{r.week_start} → {r.week_end}</strong><div className="muted">{r.summary||r.next_focus||'بدون ملخص'}</div></div>)}{!reviews.length&&<div className="muted">لا توجد مراجعات أسبوعية بعد.</div>}</div></div></section>
 </div>
}
''')

# 6) Enhanced Fitness.jsx
fit=root/'src/pages/Fitness.jsx'
fit.write_text(r'''import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createEntity, deleteEntity, listEntities } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

export default function Fitness(){
 const {id:projectId}=useParams(); const {workspace}=useWorkspace(); const [programs,setPrograms]=useState([]),[phases,setPhases]=useState([]),[sessions,setSessions]=useState([]),[workouts,setWorkouts]=useState([]),[exercises,setExercises]=useState([]),[recovery,setRecovery]=useState([]),[measurement,setMeasurement]=useState({weight_kg:'',body_fat_pct:'',resting_hr:'',notes:''});
 const [form,setForm]=useState({name:'',goal:'',status:'active'}),[phase,setPhase]=useState({name:'',program_id:'',sort_order:'0'}),[workout,setWorkout]=useState({name:'',program_id:'',phase_id:'',week_number:'',status:'planned'}),[exercise,setExercise]=useState({name:'',category:'',instructions:''}),[session,setSession]=useState({workout_id:'',duration_minutes:'',status:'completed',notes:''}),[recover,setRecover]=useState({sleep_hours:'',energy_level:'',soreness_level:'',stress_level:'',notes:''}),[error,setError]=useState('')
 async function load(){if(!workspace)return;try{const [p,ph,w,s,e,r]=await Promise.all([listEntities('uos_fitness_programs',workspace.id),listEntities('uos_fitness_phases',workspace.id),listEntities('uos_fitness_workouts',workspace.id),listEntities('uos_fitness_sessions',workspace.id,'started_at'),listEntities('uos_fitness_exercises',workspace.id),listEntities('uos_fitness_recovery',workspace.id,'recorded_at')]);const scope=a=>projectId?a.filter(x=>x.project_id===projectId||!x.project_id):a;setPrograms(scope(p));setPhases(scope(ph));setWorkouts(scope(w));setSessions(scope(s));setExercises(scope(e));setRecovery(scope(r))}catch(e){setError(e.message)}} useEffect(()=>{load()},[workspace?.id,projectId])
 async function addProgram(e){e.preventDefault();await createEntity('uos_fitness_programs',{workspace_id:workspace.id,project_id:projectId||null,...form});setForm({name:'',goal:'',status:'active'});load()}
 async function addPhase(e){e.preventDefault();if(!phase.program_id)return;await createEntity('uos_fitness_phases',{workspace_id:workspace.id,project_id:projectId||null,...phase,sort_order:Number(phase.sort_order||0)});setPhase({name:'',program_id:phase.program_id,sort_order:'0'});load()}
 async function addWorkout(e){e.preventDefault();if(!workout.program_id)return;await createEntity('uos_fitness_workouts',{workspace_id:workspace.id,project_id:projectId||null,...workout,week_number:workout.week_number?Number(workout.week_number):null,phase_id:workout.phase_id||null});setWorkout({name:'',program_id:'',phase_id:'',week_number:'',status:'planned'});load()}
 async function addExercise(e){e.preventDefault();await createEntity('uos_fitness_exercises',{workspace_id:workspace.id,project_id:projectId||null,...exercise});setExercise({name:'',category:'',instructions:''});load()}
 async function addSession(e){e.preventDefault();await createEntity('uos_fitness_sessions',{workspace_id:workspace.id,project_id:projectId||null,...session,workout_id:session.workout_id||null,duration_minutes:session.duration_minutes?Number(session.duration_minutes):null,started_at:new Date().toISOString()});setSession({workout_id:'',duration_minutes:'',status:'completed',notes:''});load()}
 async function addMeasurement(e){e.preventDefault();await createEntity('uos_fitness_measurements',{workspace_id:workspace.id,project_id:projectId||null,...measurement,weight_kg:measurement.weight_kg?Number(measurement.weight_kg):null,body_fat_pct:measurement.body_fat_pct?Number(measurement.body_fat_pct):null,resting_hr:measurement.resting_hr?Number(measurement.resting_hr):null,measured_at:new Date().toISOString().slice(0,10)});setMeasurement({weight_kg:'',body_fat_pct:'',resting_hr:'',notes:''})}
 async function addRecovery(e){e.preventDefault();await createEntity('uos_fitness_recovery',{workspace_id:workspace.id,project_id:projectId||null,...recover,sleep_hours:recover.sleep_hours?Number(recover.sleep_hours):null,energy_level:recover.energy_level?Number(recover.energy_level):null,soreness_level:recover.soreness_level?Number(recover.soreness_level):null,stress_level:recover.stress_level?Number(recover.stress_level):null});setRecover({sleep_hours:'',energy_level:'',soreness_level:'',stress_level:'',notes:''});load()}
 const filteredPhases=phases.filter(x=>!workout.program_id||x.program_id===workout.program_id)
 return <div><header className="page-head"><div><div className="eyebrow">PERSONAL OS · FITNESS</div><h1>Fitness OS</h1><p className="muted">Program → Phase → Week → Workout → Exercise، مع Sessions + Recovery + Measurements.</p><div className="chip-row"><span className="chip selected">{projectId?'Project-scoped':'Workspace-wide'}</span><span className="chip">Recovery منفصل عن Tasks</span></div></div></header>{error&&<div className="error">{error}</div>}
 <div className="grid grid-3"><Card title="New Program"><form className="form-stack" onSubmit={addProgram}><input placeholder="اسم البرنامج" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><input placeholder="الهدف" value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}/><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>active</option><option>paused</option><option>completed</option></select><button className="primary">إضافة برنامج</button></form></Card><Card title="Recovery"><form className="form-stack" onSubmit={addRecovery}><div className="form-grid"><input type="number" step="0.1" placeholder="Sleep hours" value={recover.sleep_hours} onChange={e=>setRecover({...recover,sleep_hours:e.target.value})}/><input type="number" min="1" max="10" placeholder="Energy 1-10" value={recover.energy_level} onChange={e=>setRecover({...recover,energy_level:e.target.value})}/><input type="number" min="1" max="10" placeholder="Soreness 1-10" value={recover.soreness_level} onChange={e=>setRecover({...recover,soreness_level:e.target.value})}/></div><input type="number" min="1" max="10" placeholder="Stress 1-10" value={recover.stress_level} onChange={e=>setRecover({...recover,stress_level:e.target.value})}/><textarea rows="2" placeholder="Notes" value={recover.notes} onChange={e=>setRecover({...recover,notes:e.target.value})}/><button className="primary">حفظ Recovery</button></form></Card><Card title="Measurement"><form className="form-stack" onSubmit={addMeasurement}><div className="form-grid"><input type="number" step="0.1" placeholder="Weight kg" value={measurement.weight_kg} onChange={e=>setMeasurement({...measurement,weight_kg:e.target.value})}/><input type="number" step="0.1" placeholder="Body fat %" value={measurement.body_fat_pct} onChange={e=>setMeasurement({...measurement,body_fat_pct:e.target.value})}/><input type="number" placeholder="Resting HR" value={measurement.resting_hr} onChange={e=>setMeasurement({...measurement,resting_hr:e.target.value})}/></div><input placeholder="Notes" value={measurement.notes} onChange={e=>setMeasurement({...measurement,notes:e.target.value})}/><button className="primary">حفظ القياس</button></form></Card></div>
 <section className="section grid grid-2"><Card title="Phase + Workout"><form className="form-stack" onSubmit={addPhase}><input placeholder="اسم Phase" value={phase.name} onChange={e=>setPhase({...phase,name:e.target.value})} required/><select value={phase.program_id} onChange={e=>setPhase({...phase,program_id:e.target.value})}><option value="">اختر Program</option>{programs.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input type="number" placeholder="Order" value={phase.sort_order} onChange={e=>setPhase({...phase,sort_order:e.target.value})}/><button className="secondary">إضافة Phase</button></form><hr/><form className="form-stack" onSubmit={addWorkout}><input placeholder="اسم الـWorkout" value={workout.name} onChange={e=>setWorkout({...workout,name:e.target.value})} required/><div className="form-grid"><select value={workout.program_id} onChange={e=>setWorkout({...workout,program_id:e.target.value,phase_id:''})}><option value="">Program</option>{programs.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select><select value={workout.phase_id} onChange={e=>setWorkout({...workout,phase_id:e.target.value})}><option value="">Phase</option>{filteredPhases.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select><input type="number" placeholder="Week" value={workout.week_number} onChange={e=>setWorkout({...workout,week_number:e.target.value})}/></div><button className="primary">إضافة Workout</button></form></Card><Card title="Exercise + Session"><form className="form-stack" onSubmit={addExercise}><div className="form-grid"><input placeholder="Exercise" value={exercise.name} onChange={e=>setExercise({...exercise,name:e.target.value})} required/><input placeholder="Category" value={exercise.category} onChange={e=>setExercise({...exercise,category:e.target.value})}/><input placeholder="Instructions" value={exercise.instructions} onChange={e=>setExercise({...exercise,instructions:e.target.value})}/></div><button className="secondary">إضافة Exercise</button></form><hr/><form className="form-stack" onSubmit={addSession}><select value={session.workout_id} onChange={e=>setSession({...session,workout_id:e.target.value})}><option value="">Workout اختياري</option>{workouts.map(w=><option value={w.id} key={w.id}>{w.name}</option>)}</select><div className="form-grid"><input type="number" placeholder="Duration minutes" value={session.duration_minutes} onChange={e=>setSession({...session,duration_minutes:e.target.value})}/><select value={session.status} onChange={e=>setSession({...session,status:e.target.value})}><option>completed</option><option>planned</option><option>skipped</option></select><input placeholder="Notes" value={session.notes} onChange={e=>setSession({...session,notes:e.target.value})}/></div><button className="primary">تسجيل Session</button></form></Card></section>
 <section className="section"><div className="grid grid-2"><Card title="Programs / Phases / Workouts">{programs.map(p=><div className="list-row" key={p.id}><strong>{p.name}</strong><div className="muted">{p.goal||'بدون هدف'} · {p.status}</div>{phases.filter(x=>x.program_id===p.id).slice(0,6).map(ph=><div className="list-row" key={ph.id}>↳ {ph.name}</div>)}{workouts.filter(x=>x.program_id===p.id).slice(0,6).map(w=><div className="list-row" key={w.id}>↳ {w.name} · Week {w.week_number||'—'}</div>)}</div>)}{!programs.length&&<div className="muted">لا توجد برامج.</div>}</Card><Card title="Recovery / Sessions / Exercises"><h4>Recovery</h4>{recovery.slice(0,6).map(r=><div className="list-row" key={r.id}>{r.recorded_at} · Sleep {r.sleep_hours??'—'}h · Energy {r.energy_level??'—'} · Stress {r.stress_level??'—'}</div>)}{!recovery.length&&<div className="muted">لا توجد Recovery logs.</div>}<h4 style={{marginTop:16}}>Sessions</h4>{sessions.slice(0,6).map(s=><div className="list-row" key={s.id}>{new Date(s.started_at).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})} · {s.status} · {s.duration_minutes||'—'}m</div>)}<h4 style={{marginTop:16}}>Exercises</h4>{exercises.slice(0,6).map(x=><div className="list-row" key={x.id}>{x.name} · {x.category||'—'}</div>)}{!sessions.length&&!exercises.length&&<div className="muted">لا توجد سجلات إضافية.</div>}</Card></div></section>
 </div>
}
function Card({title,children}){return <div className="card"><h3>{title}</h3>{children}</div>}
''')

# 7) Enhanced HomeOS.jsx with project scope and finance sync controls.
home=root/'src/pages/HomeOS.jsx'
home.write_text(r'''import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createEntity, listEntities, updateEntity } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

export default function HomeOS(){
 const {id:projectId}=useParams(); const {workspace}=useWorkspace(); const [rooms,setRooms]=useState([]),[maintenance,setMaintenance]=useState([]),[inventory,setInventory]=useState([]),[shopping,setShopping]=useState([]),[accounts,setAccounts]=useState([]),[categories,setCategories]=useState([]); const [room,setRoom]=useState({name:'',type:'custom'}),[shop,setShop]=useState({item:'',quantity:'1',estimated_cost:'',category_id:'',account_id:''}),[item,setItem]=useState({name:'',kind:'asset',quantity:'1',stock_status:'good',reorder_point:'',min_stock:''}),[issue,setIssue]=useState({issue:'',priority:'normal',status:'open',estimated_cost:'',due_date:''}),[error,setError]=useState('')
 async function load(){if(!workspace)return;try{const [r,m,i,s,a,c]=await Promise.all([listEntities('uos_home_rooms',workspace.id),listEntities('uos_home_maintenance',workspace.id),listEntities('uos_home_inventory',workspace.id),listEntities('uos_home_shopping',workspace.id),listEntities('uos_fin_accounts',workspace.id),listEntities('uos_fin_categories',workspace.id)]);const scope=x=>projectId?x.filter(v=>v.project_id===projectId||!v.project_id):x;setRooms(scope(r));setMaintenance(scope(m));setInventory(scope(i));setShopping(scope(s));setAccounts(a);setCategories(c)}catch(e){setError(e.message)}} useEffect(()=>{load()},[workspace?.id,projectId])
 async function addRoom(e){e.preventDefault();try{await createEntity('uos_home_rooms',{workspace_id:workspace.id,project_id:projectId||null,...room});setRoom({name:'',type:'custom'});load()}catch(e){setError(e.message)}}
 async function addItem(e){e.preventDefault();try{await createEntity('uos_home_inventory',{workspace_id:workspace.id,project_id:projectId||null,...item,quantity:Number(item.quantity||1),reorder_point:item.reorder_point?Number(item.reorder_point):null,min_stock:item.min_stock?Number(item.min_stock):null});setItem({name:'',kind:'asset',quantity:'1',stock_status:'good',reorder_point:'',min_stock:''});load()}catch(e){setError(e.message)}}
 async function addShop(e){e.preventDefault();try{await createEntity('uos_home_shopping',{workspace_id:workspace.id,project_id:projectId||null,...shop,quantity:Number(shop.quantity||1),estimated_cost:shop.estimated_cost?Number(shop.estimated_cost):null,sync_status:'pending'});setShop({item:'',quantity:'1',estimated_cost:'',category_id:'',account_id:''});load()}catch(e){setError(e.message)}}
 async function addIssue(e){e.preventDefault();try{await createEntity('uos_home_maintenance',{workspace_id:workspace.id,project_id:projectId||null,...issue,estimated_cost:issue.estimated_cost?Number(issue.estimated_cost):null,due_date:issue.due_date||null});setIssue({issue:'',priority:'normal',status:'open',estimated_cost:'',due_date:''});load()}catch(e){setError(e.message)}}
 async function purchase(item){try{if(!item.estimated_cost||!item.account_id||!item.category_id){setError('اختر مبلغًا + حسابًا + تصنيفًا قبل إنشاء الحركة المالية.');return}const existing=await listEntities('uos_fin_transactions',workspace.id,'occurred_at');const source=existing.find(t=>t.source_entity_type==='home_shopping'&&t.source_entity_id===item.id);let tx=source;if(!source){tx=await createEntity('uos_fin_transactions',{workspace_id:workspace.id,project_id:projectId||null,occurred_at:new Date().toISOString(),amount:Number(item.estimated_cost),type:'expense',from_account_id:item.account_id,category_id:item.category_id,description:`Home Shopping: ${item.item}`,shopping_item_id:item.id,source_entity_type:'home_shopping',source_entity_id:item.id,sync_status:'synced'})}await updateEntity('uos_home_shopping',item.id,{purchased:true,purchased_at:new Date().toISOString(),linked_transaction_id:tx.id,sync_status:'synced'});load()}catch(e){setError(e.message)}}
 return <div><header className="page-head"><div><div className="eyebrow">PERSONAL OS · HOME</div><h1>Home OS</h1><p className="muted">Rooms + Maintenance + Inventory + Shopping. Home Shopping يستخدم الـFinancial Ledger نفسه.</p><div className="chip-row"><span className="chip selected">{projectId?'Project-scoped':'Workspace-wide'}</span><span className="chip">No duplicate transactions</span></div></div></header>{error&&<div className="error">{error}</div>}
 <div className="grid grid-2"><div className="card"><h3>Room / Zone</h3><form onSubmit={addRoom}><div className="form-grid"><input placeholder="اسم الغرفة" value={room.name} onChange={e=>setRoom({...room,name:e.target.value})} required/><select value={room.type} onChange={e=>setRoom({...room,type:e.target.value})}><option>custom</option><option>bedroom</option><option>living_room</option><option>kitchen</option><option>bathroom</option><option>office</option><option>storage</option><option>balcony</option><option>outdoor</option></select><button className="primary">إضافة</button></div></form></div><div className="card"><h3>Inventory</h3><form className="form-stack" onSubmit={addItem}><input placeholder="الصنف" value={item.name} onChange={e=>setItem({...item,name:e.target.value})} required/><div className="form-grid"><select value={item.kind} onChange={e=>setItem({...item,kind:e.target.value})}><option>asset</option><option>consumable</option><option>appliance</option><option>furniture</option><option>tool</option><option>electronics</option></select><input type="number" placeholder="الكمية" value={item.quantity} onChange={e=>setItem({...item,quantity:e.target.value})}/><select value={item.stock_status} onChange={e=>setItem({...item,stock_status:e.target.value})}><option>good</option><option>low</option><option>critical</option><option>out</option></select></div><div className="form-grid"><input type="number" placeholder="Reorder point" value={item.reorder_point} onChange={e=>setItem({...item,reorder_point:e.target.value})}/><input type="number" placeholder="Min stock" value={item.min_stock} onChange={e=>setItem({...item,min_stock:e.target.value})}/></div><button className="primary">إضافة Inventory</button></form></div><div className="card"><h3>Maintenance</h3><form className="form-stack" onSubmit={addIssue}><input placeholder="المشكلة" value={issue.issue} onChange={e=>setIssue({...issue,issue:e.target.value})} required/><div className="form-grid"><select value={issue.priority} onChange={e=>setIssue({...issue,priority:e.target.value})}><option>normal</option><option>high</option><option>critical</option></select><select value={issue.status} onChange={e=>setIssue({...issue,status:e.target.value})}><option>open</option><option>in_progress</option><option>completed</option></select><input type="number" placeholder="Estimated cost" value={issue.estimated_cost} onChange={e=>setIssue({...issue,estimated_cost:e.target.value})}/></div><input type="date" value={issue.due_date} onChange={e=>setIssue({...issue,due_date:e.target.value})}/><button className="primary">إضافة Maintenance</button></form></div><div className="card"><h3>Shopping</h3><form className="form-stack" onSubmit={addShop}><input placeholder="العنصر" value={shop.item} onChange={e=>setShop({...shop,item:e.target.value})} required/><div className="form-grid"><input type="number" placeholder="الكمية" value={shop.quantity} onChange={e=>setShop({...shop,quantity:e.target.value})}/><input type="number" step="0.01" placeholder="Estimated cost" value={shop.estimated_cost} onChange={e=>setShop({...shop,estimated_cost:e.target.value})}/><select value={shop.account_id} onChange={e=>setShop({...shop,account_id:e.target.value})}><option value="">حساب</option>{accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></div><select value={shop.category_id} onChange={e=>setShop({...shop,category_id:e.target.value})}><option value="">Expense category</option>{categories.filter(c=>c.kind!=='income').map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><button className="primary">إضافة Shopping</button></form></div></div>
 <section className="section"><div className="grid grid-2"><div className="card"><h3>Maintenance</h3>{maintenance.slice(0,10).map(m=><div className="list-row between" key={m.id}><div><strong>{m.issue}</strong><div className="muted">{m.priority} · {m.status} · {m.due_date||'بدون موعد'}</div></div></div>)}{!maintenance.length&&<div className="muted">لا توجد أعمال صيانة.</div>}</div><div className="card"><h3>Shopping</h3>{shopping.slice(0,10).map(s=><div className="list-row between" key={s.id}><div><strong>{s.item}</strong><div className="muted">{s.purchased?'Purchased':'Pending'} · {s.sync_status}</div></div>{!s.purchased&&<button className="secondary" onClick={()=>purchase({...s,account_id:accounts[0]?.id,category_id:categories.find(c=>c.kind!=='income')?.id})}>Purchase + Finance</button>}</div>)}{!shopping.length&&<div className="muted">لا توجد عناصر تسوق.</div>}</div></div></section>
 <section className="section"><div className="grid grid-2"><div className="card"><h3>Rooms</h3>{rooms.map(r=><div className="list-row" key={r.id}>{r.name} · {r.type}</div>)}{!rooms.length&&<div className="muted">لا توجد غرف/مناطق.</div>}</div><div className="card"><h3>Inventory Alerts</h3>{inventory.filter(i=>['low','critical','out'].includes(i.stock_status)).map(i=><div className="list-row" key={i.id}><strong>{i.name}</strong> · {i.stock_status} · Qty {i.quantity}</div>)}{!inventory.some(i=>['low','critical','out'].includes(i.stock_status))&&<div className="muted">لا توجد تنبيهات مخزون.</div>}</div></div></section>
 </div>
}
''')

# 8) Personal dashboard summary page.
personal=root/'src/pages/Personal.jsx'
personal.write_text(r'''import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEntities } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

const cards=[['/habits','Habits','Habit Master + Daily Log + Weekly Reviews'],['/learning','Learning','Courses + Lessons + Skills + Study Sessions'],['/fitness','Fitness','Programs + Workouts + Recovery + Measurements'],['/home','Home','Rooms + Maintenance + Inventory + Shopping'],['/tasks','Personal Tasks','Shared Core task system'],['/goals','Goals','Vision → Goal → Objective → Milestone → Task'],['/calendar','Calendar','Personal events and study sessions']]
export default function Personal(){
 const {workspace}=useWorkspace(); const [data,setData]=useState({tasks:[],goals:[],habits:[],logs:[],courses:[],sessions:[],maintenance:[],shopping:[],inventory:[]})
 useEffect(()=>{if(!workspace)return;Promise.all([listEntities('uos_tasks',workspace.id),listEntities('uos_goals',workspace.id),listEntities('uos_habits',workspace.id),listEntities('uos_habit_logs',workspace.id),listEntities('uos_learning_courses',workspace.id),listEntities('uos_learning_study_sessions',workspace.id),listEntities('uos_home_maintenance',workspace.id),listEntities('uos_home_shopping',workspace.id),listEntities('uos_home_inventory',workspace.id)]).then(([tasks,goals,habits,logs,courses,sessions,maintenance,shopping,inventory])=>setData({tasks,goals,habits,logs,courses,sessions,maintenance,shopping,inventory})).catch(()=>{})},[workspace?.id])
 const today=new Date().toISOString().slice(0,10); const todayDone=data.logs.filter(l=>l.log_date===today&&l.status==='done').length
 const dueTasks=data.tasks.filter(t=>t.status!=='done'&&t.due_date&&t.due_date<=today).length
 const pendingShop=data.shopping.filter(x=>!x.purchased).length
 const lowStock=data.inventory.filter(x=>['low','critical','out'].includes(x.stock_status)).length
 const plannedStudy=data.sessions.filter(x=>x.scheduled_at&&String(x.scheduled_at).slice(0,10)===today&&x.status!=='completed').length
 const openMaintenance=data.maintenance.filter(x=>!['completed','closed'].includes(x.status)).length
 return <div><header className="page-head"><div><div className="eyebrow">PERSONAL OS</div><h1>الحياة الشخصية</h1><p className="muted">Personal Dashboard فوق الـShared Core. لا توجد قواعد بيانات بديلة للـTasks / Goals / Calendar / Finance.</p></div><div className="actions"><Link className="primary" to="/tasks">+ مهمة</Link><Link className="secondary" to="/goals">+ هدف</Link><Link className="secondary" to="/calendar">+ حدث</Link></div></header>
 <section className="grid grid-4"><Metric title="Due Tasks" value={dueTasks}/><Metric title="Habits Done Today" value={todayDone}/><Metric title="Study Today" value={plannedStudy}/><Metric title="Attention" value={openMaintenance+pendingShop+lowStock} alert={openMaintenance+pendingShop+lowStock>0}/></section>
 <section className="section"><div className="section-head"><h2>Personal Systems</h2></div><div className="grid grid-3">{cards.map(([to,title,desc])=><Link className="card hover" to={to} key={to}><div className="project-title">{title}</div><div className="muted">{desc}</div></Link>)}</div></section>
 <section className="section grid grid-3"><div className="card"><h3>Today</h3><div className="list-row">Habits completed: <strong>{todayDone}</strong></div><div className="list-row">Study sessions remaining: <strong>{plannedStudy}</strong></div><div className="list-row">Due tasks: <strong>{dueTasks}</strong></div></div><div className="card"><h3>Home Attention</h3><div className="list-row">Maintenance: <strong>{openMaintenance}</strong></div><div className="list-row">Shopping pending: <strong>{pendingShop}</strong></div><div className="list-row">Stock alerts: <strong>{lowStock}</strong></div></div><div className="card"><h3>Boundaries</h3><div className="muted">Goals وTasks وEvents تستخدم Shared Core. Finance يستخدم الـLedger الموحد. Learning / Habits / Fitness / Home تضيف lifecycle متخصصًا فقط.</div></div></section>
 </div>
}
function Metric({title,value,alert}){return <div className={`metric ${alert?'alert':''}`}><div className="muted">{title}</div><strong>{value}</strong></div>}
''')

# 9) Phase 16 docs.
docs=root/'docs'
docs.mkdir(exist_ok=True)
(docs/'PHASE_16_REPORT.md').write_text('''# Phase 16 — Home + Fitness + Habits\n\nStatus: IMPLEMENTED\n\n## Scope\n- Home OS: rooms, maintenance, inventory, shopping, inventory thresholds and Finance Ledger sync.\n- Habits: master, daily logs, weekly reviews, project scoping.\n- Fitness: programs, phases, workouts, exercises, sessions, recovery, measurements, project scoping.\n- Personal Dashboard: cross-system summary over Shared Core.\n- Project module routes for Home/Fitness/Habits.\n\n## Source-of-truth guarantees\n- Tasks remain `uos_tasks`.\n- Goals remain `uos_goals`.\n- Calendar remains `uos_events`.\n- Finance remains `uos_fin_transactions`.\n- Home shopping creates at most one source-linked transaction using `home_shopping` + item id.\n- No ContentOS tables or runtime were reimplemented.\n\n## Skipped\nPhase 14 Operations/Delivery remains SKIPPED by user instruction.\n\n## Runtime validation\nStatic validation can be executed locally. Browser/Vite runtime and live Supabase migration remain NOT VERIFIED when dependencies/backend are unavailable.\n''')

print('patched')
