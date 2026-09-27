import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { listExistingContentAccounts, listProjectContentLinks, linkProjectContentAccount, unlinkProjectContentAccount } from '../lib/contentosBridge'
import { useWorkspace } from '../lib/workspace'

export default function ContentOSPage(){
  const { id } = useParams()
  const [params] = useSearchParams()
  const projectId = id || params.get('projectId')
  const { workspace } = useWorkspace()
  const [accounts,setAccounts]=useState([])
  const [links,setLinks]=useState([])
  const [source,setSource]=useState('')
  const [selected,setSelected]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')

  async function load(){
    if(!workspace||!projectId)return
    setBusy(true);setError('')
    try{
      const [available,mapped]=await Promise.all([listExistingContentAccounts(),listProjectContentLinks(workspace.id,projectId)])
      setAccounts(available.accounts);setSource(available.source);setLinks(mapped)
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  useEffect(()=>{load()},[workspace?.id,projectId])

  const linkedIds=useMemo(()=>new Set(links.map(x=>x.content_account_id)),[links])
  async function connect(){
    if(!selected||!workspace||!projectId)return
    setBusy(true);setError('')
    try{await linkProjectContentAccount(workspace.id,projectId,selected);setSelected('');await load()}catch(e){setError(e.message)}finally{setBusy(false)}
  }
  async function disconnect(row){
    setBusy(true);setError('')
    try{await unlinkProjectContentAccount(row.id);await load()}catch(e){setError(e.message)}finally{setBusy(false)}
  }

  const iframeSrc = projectId ? `/contentos/index.html?unifiedProjectId=${encodeURIComponent(projectId)}` : '/contentos/index.html'

  return <div className="contentos-page">
    <div className="contentos-bar">
      <div>
        <div className="eyebrow">CONTENT ENGINE · PHASE 7</div>
        <h1>ContentOS</h1>
        <p className="muted">الـContentOS الأصلي هو Source of Truth. Unified OS يحفظ فقط علاقة المشروع بالحسابات الموجودة داخله، ولا ينسخ بيانات الحساب.</p>
      </div>
      <Link className="secondary" to={projectId?`/projects/${projectId}`:'/projects'}>← العودة للمشروع</Link>
    </div>

    {projectId&&<section className="card contentos-context">
      <div className="section-head"><div><div className="eyebrow">PROJECT ↔ CONTENTOS BRIDGE</div><h2>Content Accounts</h2></div><span className="chip">Source: {source||'—'}</span></div>
      {error&&<div className="error">{error}</div>}
      <div className="form-grid">
        <select value={selected} onChange={e=>setSelected(e.target.value)} disabled={busy||!accounts.length}>
          <option value="">اختر Account موجود في ContentOS</option>
          {accounts.filter(a=>!linkedIds.has(a.id)).map(a=><option key={a.id} value={a.id}>{a.name||a.handle||a.id} · {a.id}</option>)}
        </select>
        <button className="primary" disabled={!selected||busy} onClick={connect}>ربط الحساب بالمشروع</button>
      </div>
      <div className="linked-account-list">
        {links.map(row=>{const acc=accounts.find(a=>a.id===row.content_account_id);return <div className="list-row between" key={row.id}><div><strong>{acc?.name||acc?.handle||row.content_account_id}</strong><span className="muted"> · {row.content_account_id}</span></div><button className="secondary" disabled={busy} onClick={()=>disconnect(row)}>إلغاء الربط</button></div>})}
        {!links.length&&<div className="muted">لا توجد Accounts مرتبطة بهذا المشروع بعد. التفاصيل نفسها تظل داخل ContentOS.</div>}
      </div>
      {source==='localStorage'&&<div className="warning">تم استخدام localStorage كـfallback للقراءة فقط لأن مصدر Supabase الأصلي لم يكن متاحًا في هذه الجلسة. لا يتم إنشاء نسخة منه.</div>}
    </section>}

    <div className="legacy-frame"><iframe title="Existing ContentOS" src={iframeSrc} /></div>
  </div>
}
