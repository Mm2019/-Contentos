import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createEntity, deleteEntity, listEntities, updateEntity } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

const HABIT_LEVELS = ['growth', 'maintenance', 'automatic', 'deferred']
const HABIT_STATUSES = ['done', 'partial', 'missed', 'skipped']
const TODAY = () => new Date().toISOString().slice(0, 10)

function weekStart() {
  const d = new Date()
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}
function weekEnd() {
  const d = new Date(weekStart())
  d.setDate(d.getDate() + 6)
  return d.toISOString().slice(0, 10)
}
function toNumber(v) { return v === '' || v == null ? null : Number(v) }
function formatMinutes(n) { const x = Number(n || 0); return `${Math.floor(x / 60)}h ${x % 60}m` }

function computeStreak(habit, logs) {
  const map = new Map(logs.filter(x => x.habit_id === habit.id).map(x => [x.log_date, x.status]))
  let current = 0
  let best = Number(habit.best_clean_streak || 0)
  let clean = 0
  for (let i = 0; i < 120; i += 1) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const s = map.get(d.toISOString().slice(0, 10))
    if (s === 'done' || s === 'skipped') current += 1
    else if (s === 'partial' || s === 'missed' || !s) break
  }
  let run = 0
  for (let i = 0; i < 120; i += 1) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const s = map.get(d.toISOString().slice(0, 10))
    if (habit.type === 'bad') {
      if (s === 'missed') break
      run += 1
    } else {
      if (s === 'done' || s === 'skipped') run += 1
      else break
    }
    best = Math.max(best, run)
  }
  clean = habit.type === 'bad' ? run : 0
  return { current, best, clean }
}

function CrudPanel({ title, table, workspaceId, projectId, fields, initial = {}, filterRows = x => x }) {
  const [rows, setRows] = useState([])
  const [value, setValue] = useState(initial)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    if (!workspaceId) return
    try {
      const all = await listEntities(table, workspaceId)
      setRows(filterRows(all))
    } catch (e) { setError(e.message || 'تعذر التحميل') }
  }
  useEffect(() => { load() }, [workspaceId, projectId])

  const reset = () => { setEditing(null); setValue({ ...initial }) }
  const edit = row => {
    const next = { ...initial }
    fields.forEach(([key]) => { next[key] = row[key] ?? '' })
    if (projectId && next.project_id === undefined) next.project_id = projectId
    setEditing(row.id)
    setValue(next)
  }
  const save = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const payload = { ...value }
      fields.forEach(([key, , type]) => { if (type === 'number') payload[key] = toNumber(payload[key]) })
      if (projectId && payload.project_id === undefined) payload.project_id = projectId
      if (editing) await updateEntity(table, editing, payload)
      else await createEntity(table, { workspace_id: workspaceId, ...payload })
      reset(); await load()
    } catch (e) { setError(e.message || 'تعذر الحفظ') }
    finally { setBusy(false) }
  }
  const remove = async id => {
    if (!window.confirm('حذف السجل؟')) return
    setBusy(true); setError('')
    try { await deleteEntity(table, id); await load() }
    catch (e) { setError(e.message || 'تعذر الحذف') }
    finally { setBusy(false) }
  }

  return <div className="card">
    <div className="section-head"><h3>{title}</h3>{editing && <button className="secondary" onClick={reset}>إلغاء</button>}</div>
    {error && <div className="error">{error}</div>}
    <form className="form-grid" onSubmit={save}>
      {fields.map(([key, label, type = 'text', options]) => type === 'select'
        ? <select key={key} value={value[key] ?? ''} onChange={e => setValue(v => ({ ...v, [key]: e.target.value }))}><option value="">{label}</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
        : <input key={key} type={type} placeholder={label} value={value[key] ?? ''} onChange={e => setValue(v => ({ ...v, [key]: e.target.value }))} />
      )}
      <button className="primary" disabled={busy}>{editing ? 'حفظ التعديل' : 'إضافة'}</button>
    </form>
    <div style={{ marginTop: 12 }}>
      {rows.slice(0, 10).map(row => <div className="list-row between" key={row.id}>
        <div><strong>{row.title || row.name || row.word || row.issue || row.item || row.objective}</strong><div className="muted">{row.status || row.description || row.notes || ''}</div></div>
        <div className="actions"><button className="secondary" onClick={() => edit(row)}>تعديل</button><button className="danger" onClick={() => remove(row.id)}>حذف</button></div>
      </div>)}
      {!rows.length && <div className="muted">لا توجد سجلات.</div>}
    </div>
  </div>
}

export default function NotionParity() {
  const { id: projectId } = useParams()
  const { workspace } = useWorkspace()
  const [active, setActive] = useState('overview')
  const [error, setError] = useState('')
  const [data, setData] = useState({
    habits: [], habitLogs: [], relapses: [], books: [], journal: [], focus: [], achievements: [],
    inventory: [], maintenance: [], courses: [], modules: [], lessons: [], sessions: [], skills: [], tests: [], career: [], vocab: [],
    projects: [], tasks: [], outputs: [], work: [], risks: [], issues: [], contacts: [], okrs: [], krs: [], events: []
  })

  const load = async () => {
    if (!workspace) return
    try {
      const tables = {
        habits: 'uos_habits', habitLogs: 'uos_habit_logs', relapses: 'uos_habit_relapses', books: 'uos_habit_books', journal: 'uos_habit_journal', focus: 'uos_habit_weekly_focus', achievements: 'uos_habit_achievements',
        inventory: 'uos_home_inventory_health', maintenance: 'uos_home_maintenance',
        courses: 'uos_learning_courses', modules: 'uos_learning_modules', lessons: 'uos_learning_lessons', sessions: 'uos_learning_study_sessions', skills: 'uos_learning_skills', tests: 'uos_learning_level_tests', career: 'uos_learning_career_goals', vocab: 'uos_learning_vocabulary',
        projects: 'uos_projects', tasks: 'uos_tasks', outputs: 'uos_project_outputs', work: 'uos_project_work_sessions', risks: 'uos_project_risks', issues: 'uos_project_issues', contacts: 'uos_project_contacts', okrs: 'uos_project_okrs', krs: 'uos_project_key_results', events: 'uos_events'
      }
      const entries = await Promise.all(Object.entries(tables).map(async ([key, table]) => [key, await listEntities(table, workspace.id)]))
      const next = Object.fromEntries(entries)
      if (projectId) {
        const scoped = ['habits','relapses','books','journal','focus','achievements','inventory','maintenance','courses','lessons','sessions','skills','tests','career','vocab','outputs','work','risks','issues','contacts','okrs','events']
        scoped.forEach(key => { next[key] = (next[key] || []).filter(row => row.project_id === projectId || !row.project_id) })
        next.tasks = (next.tasks || []).filter(row => row.project_id === projectId)
      }
      setData(next)
    } catch (e) { setError(e.message || 'تعذر تحميل parity data') }
  }
  useEffect(() => { load() }, [workspace?.id, projectId])

  const habitStats = useMemo(() => data.habits.map(h => {
    const logs = data.habitLogs.filter(x => x.habit_id === h.id)
    const done = logs.filter(x => x.status === 'done').length
    const total = logs.filter(x => x.status !== 'skipped').length
    return { ...h, ...computeStreak(h, logs), successRate: total ? Math.min(100, Math.round(done / total * 100)) : 0 }
  }), [data.habits, data.habitLogs])

  const learningStats = useMemo(() => {
    const duration = data.lessons.reduce((s, l) => s + Number(l.duration_minutes || 0), 0)
    const watched = data.lessons.reduce((s, l) => s + Math.min(Number(l.watched_minutes || 0), Number(l.duration_minutes || 0)), 0)
    const day = TODAY()
    const todayActual = data.sessions.filter(s => String(s.scheduled_at || '').slice(0, 10) === day).reduce((s, x) => s + Number(x.actual_minutes || 0), 0)
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 6)
    const weekly = data.sessions.filter(s => new Date(s.scheduled_at || s.created_at) >= cutoff).reduce((s, x) => s + Number(x.actual_minutes || 0), 0)
    const highest = [...data.tests].filter(t => t.passed).sort((a, b) => Number(b.score || 0) - Number(a.score || 0))[0]?.tested_level || '—'
    return { duration, watched, remaining: Math.max(0, duration - watched), progress: duration ? Math.round(watched / duration * 100) : 0, todayActual, weekly, highest }
  }, [data.lessons, data.sessions, data.tests])

  const projectStats = useMemo(() => data.projects.map(project => {
    const tasks = data.tasks.filter(t => t.project_id === project.id)
    const leaves = tasks.filter(t => !tasks.some(c => c.parent_task_id === t.id))
    const done = leaves.filter(t => t.status === 'done').length
    const overdue = leaves.filter(t => t.status !== 'done' && t.due_date && t.due_date < TODAY()).length
    const risks = data.risks.filter(r => r.project_id === project.id && r.status === 'open' && Number(r.probability) * Number(r.impact) >= 15).length
    const issues = data.issues.filter(i => i.project_id === project.id && i.status === 'open' && i.severity === 'critical').length
    const health = overdue || risks || issues ? 'red' : 'green'
    return { ...project, progress: leaves.length ? Math.round(done / leaves.length * 100) : 0, overdue, risks, issues, health }
  }), [data.projects, data.tasks, data.risks, data.issues])

  const inventoryAlerts = data.inventory.filter(item => item.low_stock === true)

  return <div>
    <header className="page-head">
      <div><div className="eyebrow">NOTION OS FULL PARITY</div><h1>{projectId ? 'Project OS Parity' : 'Personal Operating System Parity'}</h1><p className="muted">تم نقل الوظائف الموثقة في Notion إلى Unified OS مع استخدام Shared Core كـSource of Truth.</p></div>
      <div className="actions"><Link className="secondary" to="/today">Today</Link><Link className="secondary" to="/personal">Personal OS</Link></div>
    </header>
    {error && <div className="error">{error}</div>}
    <div className="chip-row">
      {[['overview','Overview'],['habits','Habit OS'],['learning','Learning OS'],['home','Home OS'],['projects','Projects OS'],['today','Today']].map(([key, label]) => <button key={key} className={`chip selectable ${active === key ? 'selected' : ''}`} onClick={() => setActive(key)}>{label}</button>)}
    </div>

    {active === 'overview' && <section className="section"><div className="grid grid-4">
      <Metric title="Habit success" value={`${Math.round(habitStats.reduce((s, h) => s + h.successRate, 0) / (habitStats.length || 1))}%`} />
      <Metric title="Learning progress" value={`${learningStats.progress}%`} />
      <Metric title="Inventory alerts" value={inventoryAlerts.length} alert={inventoryAlerts.length > 0} />
      <Metric title="Projects needing attention" value={projectStats.filter(p => p.health === 'red').length} alert={projectStats.some(p => p.health === 'red')} />
    </div><div className="grid grid-3 section">
      <Link className="card hover" to="/today"><div className="project-title">📅 Today</div><div className="muted">Habits + Learning + Home + Projects + Events</div></Link>
      <button className="card hover action-card" onClick={() => setActive('habits')}><div className="project-title">🧠 Habit parity</div><div className="muted">Relapses, Journal, Books, Focus, Achievements, streaks</div></button>
      <button className="card hover action-card" onClick={() => setActive('projects')}><div className="project-title">🚀 Project parity</div><div className="muted">Outputs, work sessions, risks, issues, contacts, OKRs</div></button>
    </div></section>}

    {active === 'habits' && <section className="section">
      <div className="grid grid-4">{habitStats.slice(0, 8).map(h => <div className="metric" key={h.id}><div className="muted">{h.name}</div><strong>{h.successRate}%</strong><div className="muted">Current {h.current} · Best {h.best}{h.type === 'bad' ? ` · Clean ${h.clean}` : ''}</div></div>)}</div>
      <div className="grid grid-2 section">
        <CrudPanel title="Habit Library — advanced" table="uos_habits" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['name','اسم العادة'],['type','نوع','select',['good','bad']],['level','Level','select',HABIT_LEVELS],['frequency','Frequency','select',['daily','weekly','custom']],['unit','Unit'],['target','Target','number'],['minimum_target','Minimum','number'],['weight','Weight','number'],['priority','Priority','select',['low','normal','high']],['preferred_time','Preferred time','time'],['why','Why'],['reward','Reward'],['common_triggers','Common triggers'],['recovery_plan','Recovery plan']
        ]} initial={{ type:'good', level:'maintenance', frequency:'daily', weight:1, priority:'normal' }} />
        <CrudPanel title="Relapses" table="uos_habit_relapses" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['habit_id','Habit ID'],['occurred_at','Date/time','datetime-local'],['severity','Severity','number'],['triggers','Triggers'],['what_happened','What happened'],['recovery_plan_24h','24h plan'],['outcome','Outcome']
        ]} initial={{ severity:1 }} />
      </div>
      <div className="grid grid-3 section">
        <CrudPanel title="Journal" table="uos_habit_journal" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['entry_date','Date','date'],['habit_id','Habit ID'],['mood','Mood','number'],['energy','Energy','number'],['gratitude','Gratitude'],['biggest_win','Biggest win'],['learned','Learned'],['bothering_me','Bothering me'],['tomorrow_plan','Tomorrow plan']
        ]} initial={{ entry_date: TODAY() }} />
        <CrudPanel title="Books" table="uos_habit_books" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['title','Book title'],['author','Author'],['status','Status','select',['to_read','reading','finished','abandoned']],['pages','Pages','number'],['current_page','Current page','number'],['start_date','Start','date'],['finish_date','Finish','date'],['rating','Rating','number'],['key_idea','Key idea'],['notes','Notes']
        ]} initial={{ status:'to_read', current_page:0 }} />
        <CrudPanel title="Achievements" table="uos_habit_achievements" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['name','Achievement'],['habit_id','Habit ID'],['condition_type','Condition','select',['clean_days','completed_days','total_quantity']],['target_value','Target','number'],['current_value','Current','number']
        ]} initial={{ condition_type:'completed_days', current_value:0 }} />
      </div>
      <CrudPanel title="Weekly Focus" table="uos_habit_weekly_focus" workspaceId={workspace?.id} projectId={projectId} fields={[
        ['week_start','Week start','date'],['week_end','Week end','date'],['status','Status','select',['active','completed','adjusted']],['habit_ids','3–5 Habit IDs'],['what_worked','What worked'],['what_failed','What failed'],['weekly_rating','Rating','number'],['next_week_adjustment','Next week']
      ]} initial={{ week_start: weekStart(), week_end: weekEnd(), status:'active' }} />
    </section>}

    {active === 'learning' && <section className="section">
      <div className="grid grid-4"><Metric title="Progress" value={`${learningStats.progress}%`} /><Metric title="Remaining" value={formatMinutes(learningStats.remaining)} /><Metric title="Today" value={`${learningStats.todayActual}m`} /><Metric title="Proven level" value={learningStats.highest} /></div>
      <div className="grid grid-2 section">
        <CrudPanel title="Level Tests" table="uos_learning_level_tests" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['title','Test'],['area_id','Area ID'],['test_date','Date','date'],['tested_level','Level'],['score','Score','number'],['source','Source'],['notes','Notes']
        ]} initial={{ test_date: TODAY() }} />
        <CrudPanel title="Professional Goals" table="uos_learning_career_goals" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['title','Career goal'],['target_date','Target date','date'],['status','Status','select',['active','paused','completed']],['area_ids','Area IDs'],['description','Description']
        ]} initial={{ status:'active' }} />
      </div>
      <div className="grid grid-2 section">
        <CrudPanel title="Vocabulary" table="uos_learning_vocabulary" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['word','Word'],['meaning','Meaning'],['part_of_speech','Part of speech'],['level','Level'],['skill','Skill'],['status','Status','select',['new','learning','mastered']],['review_date','Review date','date'],['example_sentence','Example'],['pronunciation','Pronunciation']
        ]} initial={{ status:'new' }} />
        <CrudPanel title="Learning Dashboard Settings" table="uos_learning_dashboard_settings" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['daily_goal_minutes','Daily goal','number'],['minimum_streak_minutes','Minimum streak','number'],['weekly_goal_minutes','Weekly goal','number']
        ]} initial={{ daily_goal_minutes:60, minimum_streak_minutes:10, weekly_goal_minutes:300 }} />
      </div>
      <div className="card"><h3>Learning rollups</h3><div className="grid grid-3"><Metric title="Lessons" value={data.lessons.length} /><Metric title="Study sessions" value={data.sessions.length} /><Metric title="Vocabulary" value={data.vocab.length} /></div><div className="muted" style={{marginTop:10}}>المستوى المثبت يعتمد على أعلى Level Test ناجح؛ مشاهدة الدروس لا تعني إتقانًا.</div></div>
    </section>}

    {active === 'home' && <section className="section">
      <div className="grid grid-4"><Metric title="Inventory alerts" value={inventoryAlerts.length} alert={inventoryAlerts.length>0} /><Metric title="Warranty expiring" value={data.inventory.filter(i => i.warranty_status === 'expiring').length} /><Metric title="Warranty expired" value={data.inventory.filter(i => i.warranty_status === 'expired').length} alert={data.inventory.some(i => i.warranty_status === 'expired')} /><Metric title="Maintenance open" value={data.maintenance.filter(m => !['completed','closed'].includes(m.status)).length} /></div>
      <div className="grid grid-2 section">
        <CrudPanel title="Home Inventory — warranty + assets" table="uos_home_inventory" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['name','Name'],['kind','Kind','select',['consumable','asset','appliance','furniture','tool','electronics','clothing','document']],['quantity','Quantity','number'],['reorder_point','Reorder point','number'],['min_stock','Minimum stock','number'],['room_id','Room ID'],['purchase_date','Purchase date','date'],['warranty_until','Warranty until','date'],['model','Model'],['serial_number','Serial'],['last_service_date','Last service','date']
        ]} initial={{ kind:'asset', quantity:1 }} />
        <CrudPanel title="Maintenance — preventive / repair" table="uos_home_maintenance" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['issue','Issue'],['room_id','Room ID'],['maintenance_type','Type','select',['preventive','repair']],['priority','Priority','select',['low','normal','high','critical']],['status','Status','select',['open','in_progress','completed','closed']],['recurrence_interval_days','Every X days','number'],['last_completed_at','Last completed','date'],['due_date','Due date','date'],['next_due_date','Next due','date'],['estimated_cost','Estimated cost','number']
        ]} initial={{ maintenance_type:'repair', priority:'normal', status:'open' }} />
      </div>
      <div className="card"><h3>Home intelligence</h3>{inventoryAlerts.slice(0,12).map(i => <div className="list-row between" key={i.id}><span>{i.name}</span><span className="badge warning">Qty {i.quantity} / Min {i.min_stock ?? i.reorder_point}</span></div>)}{!inventoryAlerts.length&&<div className="muted">لا توجد تنبيهات مخزون.</div>}</div>
    </section>}

    {active === 'projects' && <section className="section">
      <div className="grid grid-4">{projectStats.slice(0, 8).map(p => <div className="metric" key={p.id}><div className="muted">{p.name}</div><strong>{p.progress}%</strong><div className="muted">{p.health} · overdue {p.overdue} · risks {p.risks} · issues {p.issues}</div></div>)}</div>
      <div className="grid grid-2 section">
        <CrudPanel title="Project Outputs" table="uos_project_outputs" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['title','Output'],['task_id','Task ID'],['output_type','Type','select',['design','code','document','sample','video','other']],['approval_status','Status','select',['draft','review','approved_final']],['file_url','File URL','url'],['external_url','External URL','url'],['notes','Notes']
        ]} initial={{ output_type:'document', approval_status:'draft' }} />
        <CrudPanel title="Work Sessions" table="uos_project_work_sessions" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['session_date','Date','date'],['task_id','Task ID'],['minutes','Minutes','number'],['notes','Notes']
        ]} initial={{ session_date:TODAY(), minutes:0 }} />
      </div>
      <div className="grid grid-3 section">
        <CrudPanel title="Risk Register" table="uos_project_risks" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['title','Risk'],['description','Description'],['probability','Probability 1–5','number'],['impact','Impact 1–5','number'],['status','Status','select',['open','mitigated','closed']],['mitigation','Mitigation']
        ]} initial={{ probability:1, impact:1, status:'open' }} />
        <CrudPanel title="Issues" table="uos_project_issues" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['title','Issue'],['description','Description'],['severity','Severity','select',['normal','high','critical']],['priority','Priority','select',['low','normal','high']],['status','Status','select',['open','in_progress','resolved','closed']],['due_date','Due','date']
        ]} initial={{ severity:'normal', priority:'normal', status:'open' }} />
        <CrudPanel title="Contacts" table="uos_project_contacts" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['name','Name'],['company','Company'],['role','Role'],['email','Email','email'],['phone','Phone'],['communication_status','Communication','select',['needs_attention','soon','in_contact','no_contact']],['notes','Notes']
        ]} initial={{ communication_status:'no_contact' }} />
      </div>
      <div className="grid grid-2 section">
        <CrudPanel title="OKRs" table="uos_project_okrs" workspaceId={workspace?.id} projectId={projectId} fields={[
          ['objective','Objective'],['period_start','Start','date'],['period_end','End','date'],['status','Status','select',['active','paused','completed']]
        ]} initial={{ status:'active' }} />
        <CrudPanel title="Key Results" table="uos_project_key_results" workspaceId={workspace?.id} fields={[
          ['okr_id','OKR ID'],['title','Key result'],['kind','Kind','select',['numeric','project_based']],['start_value','Start','number'],['current_value','Current','number'],['target_value','Target','number'],['status','Status','select',['active','completed','paused']]
        ]} initial={{ kind:'numeric', status:'active' }} />
      </div>
    </section>}

    {active === 'today' && <TodayPanel data={data} habitStats={habitStats} learningStats={learningStats} projectStats={projectStats} inventoryAlerts={inventoryAlerts} />}
  </div>
}

function TodayPanel({ data, habitStats, learningStats, projectStats, inventoryAlerts }) {
  const day = TODAY()
  const todayTasks = data.tasks.filter(t => t.status !== 'done' && t.due_date === day)
  const overdue = data.tasks.filter(t => t.status !== 'done' && t.due_date && t.due_date < day)
  const sessions = data.sessions.filter(s => String(s.scheduled_at || '').slice(0, 10) === day)
  const events = data.events.filter(e => String(e.starts_at || '').slice(0, 10) === day)
  const maintenance = data.maintenance.filter(m => m.status !== 'completed' && (m.due_date === day || (m.due_date && m.due_date < day)))
  return <section className="section">
    <div className="grid grid-4"><Metric title="Tasks today" value={todayTasks.length} /><Metric title="Overdue" value={overdue.length} alert={overdue.length > 0} /><Metric title="Habits logged" value={data.habitLogs.filter(l => l.log_date === day).length} /><Metric title="Study minutes" value={sessions.reduce((s, x) => s + Number(x.actual_minutes || 0), 0)} /></div>
    <div className="grid grid-3 section">
      <div className="card"><h3>🧠 Habits</h3>{habitStats.slice(0, 8).map(h => <div className="list-row between" key={h.id}><span>{h.name}</span><span className="badge info">{h.current}</span></div>)}</div>
      <div className="card"><h3>🎓 Learning</h3><div className="list-row">Today: <strong>{learningStats.todayActual}m</strong></div><div className="list-row">7-day: <strong>{learningStats.weekly}m</strong></div><div className="list-row">Proven: <strong>{learningStats.highest}</strong></div></div>
      <div className="card"><h3>🏠 Home</h3><div className="list-row">Inventory alerts: <strong>{inventoryAlerts.length}</strong></div><div className="list-row">Maintenance: <strong>{maintenance.length}</strong></div></div>
    </div>
    <div className="grid grid-2 section">
      <div className="card"><h3>🚀 Projects needing attention</h3>{projectStats.filter(p => p.health === 'red').map(p => <div className="list-row" key={p.id}><strong>{p.name}</strong><div className="muted">{p.progress}% · overdue {p.overdue} · risks {p.risks} · issues {p.issues}</div></div>)}{!projectStats.some(p => p.health === 'red') && <div className="muted">لا توجد مشاريع تحتاج انتباه.</div>}</div>
      <div className="card"><h3>📅 Calendar</h3>{events.slice(0, 8).map(e => <div className="list-row" key={e.id}>{e.title}</div>)}{!events.length && <div className="muted">لا توجد أحداث اليوم.</div>}</div>
    </div>
  </section>
}

function Metric({ title, value, alert }) { return <div className={`metric ${alert ? 'alert' : ''}`}><div className="muted">{title}</div><strong>{value}</strong></div> }
