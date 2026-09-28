import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/auth'
import { useWorkspace } from '../lib/workspace'
import { createEntity, listEntities, updateEntity } from '../lib/core'
import { supabase } from '../lib/supabase'

const ROLES = ['viewer','contributor','editor','manager','admin']

export default function SecurityAudit() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const [context, setContext] = useState(null)
  const [members, setMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [audit, setAudit] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [memberForm, setMemberForm] = useState({ user_id:'', role:'viewer' })
  const [selectedProject, setSelectedProject] = useState('')
  const [projectMemberForm, setProjectMemberForm] = useState({ user_id:'', role:'viewer' })
  const [financeTarget, setFinanceTarget] = useState({ user_id:'', can_view:true, can_edit:false, can_export:false })
  const [financePermissions, setFinancePermissions] = useState([])

  async function load() {
    if (!workspace) return
    setError(''); setMessage('')
    try {
      const nextContext = supabase
        ? (await supabase.rpc('uos_security_context', { p_workspace: workspace.id })).data
        : { workspaceId: workspace.id, role:'local', canRead:true, canWrite:true, canDelete:true, canManage:false, canViewFinance:true, canEditFinance:true, canExportFinance:false, canViewAudit:false }
      setContext(nextContext)
      const [m,p] = await Promise.all([
        listEntities('uos_workspace_members', workspace.id),
        listEntities('uos_projects', workspace.id),
      ])
      setMembers(m); setProjects(p)
      if (selectedProject) setProjectMembers(await listEntities('uos_project_members', workspace.id))
      else setProjectMembers(await listEntities('uos_project_members', workspace.id))
      if (nextContext?.canViewAudit) setAudit(await listEntities('uos_audit_log', workspace.id, 'created_at'))
      if (nextContext?.canManage) setFinancePermissions(await listEntities('uos_finance_permissions', workspace.id))
    } catch (e) { setError(e.message || String(e)) }
  }

  useEffect(() => { load() }, [workspace?.id, selectedProject])

  const currentUserMember = useMemo(() => members.find(m => m.user_id === user?.id), [members, user?.id])
  const visibleProjectMembers = useMemo(() => selectedProject ? projectMembers.filter(m => m.project_id === selectedProject) : projectMembers, [projectMembers, selectedProject])

  async function addWorkspaceMember() {
    if (!workspace || !memberForm.user_id.trim() || !context?.canManage) return
    try {
      await createEntity('uos_workspace_members', { workspace_id:workspace.id, user_id:memberForm.user_id.trim(), role:memberForm.role, active:true })
      setMemberForm({ user_id:'', role:'viewer' }); setMessage('Workspace member added.'); await load()
    } catch (e) { setError(e.message || String(e)) }
  }

  async function saveProjectMember() {
    if (!workspace || !selectedProject || !projectMemberForm.user_id.trim() || !context?.canManage) return
    try {
      const existing = projectMembers.find(m => m.project_id===selectedProject && m.user_id===projectMemberForm.user_id.trim())
      if (existing) await updateEntity('uos_project_members', existing.id, { role:projectMemberForm.role, active:true })
      else await createEntity('uos_project_members', { workspace_id:workspace.id, project_id:selectedProject, user_id:projectMemberForm.user_id.trim(), role:projectMemberForm.role, active:true })
      setProjectMemberForm({ user_id:'', role:'viewer' }); setMessage('Project permission saved.'); await load()
    } catch (e) { setError(e.message || String(e)) }
  }

  async function saveFinancePermission() {
    if (!workspace || !financeTarget.user_id.trim() || !context?.canManage) return
    try {
      const existing = financePermissions.find(x => x.user_id === financeTarget.user_id.trim())
      if (existing) await updateEntity('uos_finance_permissions', existing.id, financeTarget)
      else await createEntity('uos_finance_permissions', { workspace_id:workspace.id, ...financeTarget })
      setFinanceTarget({ user_id:'', can_view:true, can_edit:false, can_export:false }); setMessage('Finance permission saved.'); await load()
    } catch (e) { setError(e.message || String(e)) }
  }

  return <div>
    <header className="page-head">
      <div><div className="eyebrow">PHASE 18 · SECURITY + AUDIT</div><h1>Security & Permissions</h1><p className="muted">الـbackend وRLS هما الحدّ الأمني الحقيقي. الواجهة هنا لإدارة الصلاحيات ومراجعة السجل فقط.</p></div>
    </header>
    {error && <div className="error">{error}</div>}
    {message && <div className="card" style={{borderColor:'var(--border-strong)'}}>{message}</div>}

    <section className="grid grid-4">
      <Metric label="Current role" value={context?.role || '—'} />
      <Metric label="Workspace write" value={context?.canWrite ? 'Yes' : 'No'} />
      <Metric label="Finance access" value={context?.canViewFinance ? 'Yes' : 'No'} />
      <Metric label="Audit access" value={context?.canViewAudit ? 'Yes' : 'No'} />
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">ROLE MODEL</div><h2>Workspace Membership</h2></div><span className="muted">Owner is derived from workspace owner.</span></div>
      <div className="grid grid-2">
        <div>{members.map(m => <div className="list-row" key={m.id}><div><strong>{m.user_id}</strong><div className="muted">{m.user_id===user?.id?'You':''}</div></div><span className="chip">{m.role}</span></div>)}{!members.length&&<div className="muted">No membership rows are visible to this role.</div>}</div>
        {context?.canManage && <div className="card"><h3>Add / update member</h3><div className="form-grid"><label>User ID<input value={memberForm.user_id} onChange={e=>setMemberForm(v=>({...v,user_id:e.target.value}))} placeholder="auth.users UUID" /></label><label>Role<select value={memberForm.role} onChange={e=>setMemberForm(v=>({...v,role:e.target.value}))}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></label></div><button className="primary" onClick={addWorkspaceMember}>Save member</button></div>}
      </div>
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">PROJECT PERMISSIONS</div><h2>Project Members</h2></div><span className="muted">Explicit project members override workspace defaults.</span></div>
      <div className="form-grid"><label>Project<select value={selectedProject} onChange={e=>setSelectedProject(e.target.value)}><option value="">Choose project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
      {selectedProject && <div className="grid grid-2"><div>{visibleProjectMembers.map(m=><div className="list-row" key={m.id}><span>{m.user_id}</span><span className="chip">{m.role}</span></div>)}{!visibleProjectMembers.length&&<div className="muted">No explicit project members. Workspace permissions apply.</div>}</div>{context?.canManage&&<div className="card"><h3>Grant project access</h3><div className="form-grid"><label>User ID<input value={projectMemberForm.user_id} onChange={e=>setProjectMemberForm(v=>({...v,user_id:e.target.value}))} placeholder="auth.users UUID" /></label><label>Role<select value={projectMemberForm.role} onChange={e=>setProjectMemberForm(v=>({...v,role:e.target.value}))}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></label></div><button className="primary" onClick={saveProjectMember}>Save project permission</button></div>}</div>}
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">FINANCE RESTRICTIONS</div><h2>Finance Visibility / Edit / Export</h2></div><span className="muted">Manager/Admin/Owner stay privileged by role.</span></div>
      {context?.canManage ? <><div className="card-list">{financePermissions.map(p=><div className="list-row" key={p.id}><span>{p.user_id}</span><span className="chip">view:{p.can_view?'yes':'no'} · edit:{p.can_edit?'yes':'no'} · export:{p.can_export?'yes':'no'}</span></div>)}</div><div className="card"><div className="form-grid"><label>User ID<input value={financeTarget.user_id} onChange={e=>setFinanceTarget(v=>({...v,user_id:e.target.value}))} placeholder="auth.users UUID" /></label><label className="inline-check"><input type="checkbox" checked={financeTarget.can_view} onChange={e=>setFinanceTarget(v=>({...v,can_view:e.target.checked}))}/> View</label><label className="inline-check"><input type="checkbox" checked={financeTarget.can_edit} onChange={e=>setFinanceTarget(v=>({...v,can_edit:e.target.checked}))}/> Edit</label><label className="inline-check"><input type="checkbox" checked={financeTarget.can_export} onChange={e=>setFinanceTarget(v=>({...v,can_export:e.target.checked}))}/> Export</label></div><button className="primary" onClick={saveFinancePermission}>Save finance permission</button></div></> : <div className="muted">Finance permission administration is restricted.</div>}
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">AUDIT LOG</div><h2>Recent Security-Sensitive Changes</h2></div><span className="muted">Database trigger generated</span></div>
      {context?.canViewAudit ? (audit.length ? <div className="card-list">{audit.slice(0,60).map(row=><div className="list-row" key={row.id}><div><strong>{row.action} · {row.entity_table}</strong><div className="muted">{row.entity_id} · {row.actor_id || 'system'} · {new Date(row.created_at).toLocaleString('ar-EG')}</div></div><span className="chip">{row.source}</span></div>)}</div> : <div className="muted">No audit events yet.</div>) : <div className="muted">Audit access is restricted to manager/admin/owner roles.</div>}
    </section>

    <section className="section card"><div className="eyebrow">CONTENTOS BOUNDARY</div><h3>Existing ContentOS permissions remain authoritative</h3><p className="muted">Unified OS adds project/account access overlays for the bridge, but it does not replace or rewrite ContentOS-native permissions, ownership, workflow history, snapshots, or recovery mechanisms.</p></section>
  </div>
}

function Metric({label,value}){return <div className="metric"><div className="muted">{label}</div><strong className="metric-value-wrap">{value}</strong></div>}
