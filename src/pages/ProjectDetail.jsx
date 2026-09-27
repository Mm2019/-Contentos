import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listEntities, updateEntity } from '../lib/core'
import { useWorkspace } from '../lib/workspace'
import { PROJECT_PROFILES, PROJECT_MODULES, MODULE_GROUPS, normalizeModules, profileByName } from '../lib/projectModules'
import { listExistingContentAccounts, listProjectContentLinks, linkProjectContentAccount, unlinkProjectContentAccount } from '../lib/contentosBridge'

export default function ProjectDetail(){
  const {id}=useParams();
  const {workspace}=useWorkspace();
  const [project,setProject]=useState(null),[tasks,setTasks]=useState([]),[goals,setGoals]=useState([]),[editing,setEditing]=useState(false),[saving,setSaving]=useState(false)
  const [profile,setProfile]=useState('Personal / Research');
  const [modules,setModules]=useState([])
  const [contentAccounts,setContentAccounts]=useState([])
  const [contentLinks,setContentLinks]=useState([])
  const [contentSelected,setContentSelected]=useState('');
  const [error,setError]=useState('')

  useEffect(()=>{
    if(!workspace) return
    Promise.all([
      listEntities('uos_projects',workspace.id),
      listEntities('uos_tasks',workspace.id),
      listEntities('uos_goals',workspace.id),
      listExistingContentAccounts(),
      listProjectContentLinks(workspace.id,id)
    ]).then(([p,t,g,content,links])=>{
      const found=p.find(x=>x.id===id)||null
      setProject(found)
      setTasks(t.filter(x=>x.project_id===id))
      setGoals(g.filter(x=>x.project_id===id))
      setContentAccounts(content.accounts); setContentLinks(links)
      if(found){ setProfile(found.project_profile || 'Personal / Research'); setModules(normalizeModules(found.enabled_modules)) }
    }).catch(e=>setError(e.message))
  },[workspace?.id,id])

  const grouped = useMemo(()=>MODULE_GROUPS.map(group=>({group, items:PROJECT_MODULES.filter(m=>m.group===group)})),[])
  const toggleModule = key => setModules(current=>current.includes(key)?current.filter(x=>x!==key):[...current,key])
  const applyProfile = name => { setProfile(name); setModules(normalizeModules(profileByName(name).defaultModules)) }

  async function save(){
    if(!project || !workspace) return
    setSaving(true); setError('')
    try{
      const payload={project_profile:profile,enabled_modules:modules,module_config_version:Number(project.module_config_version||1)+1}
      const updated=await updateEntity('uos_projects',project.id,payload)
      setProject(updated); setModules(normalizeModules(updated.enabled_modules)); setEditing(false)
    }catch(e){setError(e.message)}finally{setSaving(false)}
  }

  if(!project)return <div className="card">{error||'المشروع غير موجود أو لم يتم تحميله بعد.'}</div>
  const enabled=normalizeModules(project.enabled_modules)

  return <div>
    <Link className="muted" to="/projects">← كل المشاريع</Link>
    <header className="page-head"><div><div className="eyebrow">PROJECT PROFILE</div><h1>{project.name}</h1><p className="muted">{project.project_profile} · {project.status}</p></div><div className="actions">{enabled.includes('ContentOS')&&<Link className="primary" to={`/projects/${id}/contentos`}>فتح ContentOS</Link>}<button className="secondary" onClick={()=>setEditing(v=>!v)}>{editing?'إلغاء':'Configure Project'}</button><Link className="secondary" to={`/projects/${id}/parity`}>Notion Parity</Link></div></header>
    {error&&<div className="error">{error}</div>}

    {editing&&<section className="card project-config">
      <div className="section-head"><div><div className="eyebrow">PROJECT CONFIGURATION</div><h2>Profile + Enabled Modules</h2></div><button className="primary" onClick={save} disabled={saving}>{saving?'جاري الحفظ…':'حفظ التكوين'}</button></div>
      <div className="form-grid project-profile-grid"><label>Profile<select value={profile} onChange={e=>applyProfile(e.target.value)}>{PROJECT_PROFILES.map(p=><option key={p.key} value={p.name}>{p.name}</option>)}</select></label><div className="muted">Profile يحدد طبيعة المشروع فقط. لا ينشئ Project جديدًا ولا ينسخ أي بيانات.</div><div className="muted">Module config version: {project.module_config_version||1}</div></div>
      <div className="module-group-grid">{grouped.map(({group,items})=><div className="module-group card" key={group}><div className="project-title">{group}</div><div className="chip-picker">{items.map(m=><button type="button" key={m.key} className={`chip selectable ${modules.includes(m.key)?'selected':''}`} onClick={()=>toggleModule(m.key)}>{m.label}</button>)}</div></div>)}</div>
    </section>}

    <section className="grid grid-4"><Metric title="Profile" value={project.project_profile}/><Metric title="Modules" value={enabled.length}/><Metric title="Tasks" value={enabled.includes('Tasks')?tasks.length:'—'}/><Metric title="Goals" value={enabled.includes('Goals')?goals.length:'—'}/></section>

    <section className="section"><div className="section-head"><h2>Enabled Modules</h2><span className="muted">{enabled.length} active</span></div><div className="module-group-grid">{MODULE_GROUPS.map(group=>{const items=PROJECT_MODULES.filter(m=>m.group===group&&enabled.includes(m.key)); if(!items.length)return null; return <div className="card" key={group}><div className="eyebrow">{group}</div><div className="chip-row">{items.map(m=><ModuleLink key={m.key} module={m} projectId={id}/>)}</div></div>})}</div></section>

    {enabled.includes('ContentOS')&&<section className="section card"><div className="section-head"><div><div className="eyebrow">CONTENTOS BRIDGE</div><h2>Linked Content Accounts</h2></div><Link to={`/projects/${id}/contentos`}>إدارة ↗</Link></div><div className="chip-row">{contentLinks.map(row=>{const a=contentAccounts.find(x=>x.id===row.content_account_id);return <span className="chip selected" key={row.id}>{a?.name||a?.handle||row.content_account_id}</span>})}{!contentLinks.length&&<span className="muted">لا توجد حسابات مرتبطة. افتح إدارة ContentOS لربط حساب موجود.</span>}</div></section>}

    <section className="section"><div className="grid grid-2">
      {enabled.includes('Tasks')&&<div className="card"><div className="section-head"><h3>Tasks</h3><Link to={`/tasks?project=${id}`}>فتح ↗</Link></div>{tasks.slice(0,8).map(t=><div className="list-row" key={t.id}>{t.title}</div>)}{!tasks.length&&<div className="muted">لا توجد مهام مرتبطة.</div>}</div>}
      {enabled.includes('Goals')&&<div className="card"><div className="section-head"><h3>Goals</h3><Link to={`/goals?project=${id}`}>فتح ↗</Link></div>{goals.slice(0,8).map(g=><div className="list-row" key={g.id}>{g.title}</div>)}{!goals.length&&<div className="muted">لا توجد أهداف مرتبطة.</div>}</div>}
    </div></section>

    {!enabled.length&&<div className="section card"><div className="muted">لا توجد Modules مفعّلة. افتح Configure Project واختر الوحدات المطلوبة.</div></div>}
  </div>
}

function ModuleLink({module,projectId}){
  if(module.key==='ContentOS') return <Link className="chip selected" to={`/projects/${projectId}/contentos`}>{module.label} ↗</Link>
  if(['Product','PRD','Features','Releases','QA','Support'].includes(module.key)) return <Link className="chip selected" to={`/projects/${projectId}/product`}>{module.label} ↗</Link>
  if(module.key==='Commerce') return <Link className="chip selected" to={`/projects/${projectId}/commerce`}>{module.label} ↗</Link>
  if(module.key==='Marketplace') return <Link className="chip selected" to={`/projects/${projectId}/marketplace`}>{module.label} ↗</Link>
  if(['Knowledge','Ideas','Notes','Resources'].includes(module.key)) return <Link className="chip selected" to={`/projects/${projectId}/knowledge`}>{module.label} ↗</Link>
  if(module.key==='Learning') return <Link className="chip selected" to={`/projects/${projectId}/learning`}>{module.label} ↗</Link>
  if(module.key==='Habits') return <Link className="chip selected" to={`/projects/${projectId}/habits`}>{module.label} ↗</Link>
  if(module.key==='Fitness') return <Link className="chip selected" to={`/projects/${projectId}/fitness`}>{module.label} ↗</Link>
  if(module.key==='Home') return <Link className="chip selected" to={`/projects/${projectId}/home`}>{module.label} ↗</Link>
  if(['CRM','Marketing','SEO','Affiliate','DigitalProducts','CreatorBusiness'].includes(module.key)) return <Link className="chip selected" to={`/projects/${projectId}/business`}>{module.label} ↗</Link>
  return <span className="chip">{module.label}</span>
}
function Metric({title,value}){return <div className="metric"><div className="muted">{title}</div><strong className="metric-value-wrap">{value}</strong></div>}
