import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createEntity, listEntities } from '../lib/core'
import { useWorkspace } from '../lib/workspace'
import { PROJECT_MODULES, PROJECT_PROFILES, MODULE_GROUPS, profileByName, normalizeModules } from '../lib/projectModules'

export default function Projects(){
 const {workspace}=useWorkspace(); const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 const [form,setForm]=useState({name:'',profile:'Personal / Research',modules:profileByName('Personal / Research').defaultModules})
 const grouped=useMemo(()=>MODULE_GROUPS.map(group=>({group,items:PROJECT_MODULES.filter(m=>m.group===group)})),[])
 async function load(){if(!workspace)return;setLoading(true);try{setItems(await listEntities('uos_projects',workspace.id))}catch(e){setError(e.message)}finally{setLoading(false)}} useEffect(()=>{load()},[workspace?.id])
 async function create(e){e.preventDefault();if(!form.name||!workspace)return;try{await createEntity('uos_projects',{workspace_id:workspace.id,name:form.name,project_type:form.profile==='App / SaaS'?'saas':'other',project_profile:form.profile,status:'idea',enabled_modules:normalizeModules(form.modules),module_config_version:1});setForm({name:'',profile:'Personal / Research',modules:profileByName('Personal / Research').defaultModules});load()}catch(err){setError(err.message)}}
 const toggle=m=>setForm(f=>({...f,modules:f.modules.includes(m)?f.modules.filter(x=>x!==m):[...f.modules,m]}))
 const applyProfile=p=>setForm(f=>({...f,profile:p,modules:profileByName(p).defaultModules}))
 return <div><header className="page-head"><div><div className="eyebrow">PROJECT ENGINE · PHASE 6</div><h1>Projects</h1><p className="muted">Project instance + Profile + Enabled Modules. كل مشروع يرى فقط ما تم تفعيله.</p></div></header>
 {error&&<div className="error">{error}</div>}
 <div className="card"><form onSubmit={create}><div className="form-grid"><input placeholder="اسم المشروع" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><select value={form.profile} onChange={e=>applyProfile(e.target.value)}>{PROJECT_PROFILES.map(p=><option key={p.key}>{p.name}</option>)}</select><button className="primary">إنشاء</button></div><div className="profile-hint"><span className="eyebrow">DEFAULT MODULES FOR PROFILE</span><div className="chip-row">{form.modules.map(m=><span className="chip selected" key={m}>{m}</span>)}</div></div><details className="module-picker-details"><summary>Customize enabled modules</summary><div className="module-group-grid">{grouped.map(({group,items})=><div className="module-group card" key={group}><div className="project-title">{group}</div><div className="chip-picker">{items.map(m=><button type="button" key={m.key} className={`chip selectable ${form.modules.includes(m.key)?'selected':''}`} onClick={()=>toggle(m.key)}>{m.label}</button>)}</div></div>)}</div></details></form></div>
 <section className="section">{loading?<div className="card">جاري التحميل…</div>:<div className="grid grid-2">{items.map(p=><Link className="card hover" to={`/projects/${p.id}`} key={p.id}><div className="between"><div><div className="project-title">{p.name}</div><div className="muted">{p.project_profile} · {p.status}</div></div><span className="chip">{normalizeModules(p.enabled_modules).length} modules</span></div><div className="chip-row">{normalizeModules(p.enabled_modules).map(m=><span className="chip" key={m}>{m}</span>)}</div></Link>)}</div>}</section>
 </div>
}
