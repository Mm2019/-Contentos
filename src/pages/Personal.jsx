import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEntities } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

const cards=[['/parity','Notion OS Parity','Full parity: Habit + Learning + Home + Projects + Today'],['/habits','Habits','Habit Master + Daily Log + Weekly Reviews'],['/learning','Learning','Courses + Lessons + Skills + Study Sessions'],['/fitness','Fitness','Programs + Workouts + Recovery + Measurements'],['/home','Home','Rooms + Maintenance + Inventory + Shopping'],['/tasks','Personal Tasks','Shared Core task system'],['/goals','Goals','Vision → Goal → Objective → Milestone → Task'],['/calendar','Calendar','Personal events and study sessions']]
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
