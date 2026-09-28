import { useEffect, useMemo, useState } from 'react'
import { createTableRecord, deleteTableRecord, listTableRecords, updateTableRecord } from '../lib/core'
import { useWorkspace } from '../lib/workspace'
import { UOS_SCHEMA } from '../lib/schemaRegistry'

const HIDDEN = new Set(['id','workspace_id','created_at','updated_at'])
const SYSTEM_GROUPS = new Set(['uos_audit_log','uos_migration_log','uos_schema_registry','uos_recovery_items','uos_recovery_runs','uos_recovery_snapshots','uos_workspaces','uos_workspace_members'])

function labelize(name){return name.replace(/^uos_/,'').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase())}
function inputType(type){
  if(type==='boolean') return 'checkbox'
  if(type==='date') return 'date'
  if(type.startsWith('timestamp')) return 'datetime-local'
  if(/numeric|decimal|real|double|int|bigint|smallint/.test(type)) return 'number'
  return 'text'
}
function initialValue(col){
  if(col.default){
    const d=col.default
    if(d.includes("'[]'::jsonb")) return '[]'
    if(d.includes("'{}'::jsonb")) return '{}'
    if(/\btrue\b/i.test(d) && !/::/.test(d)) return true
    if(/\bfalse\b/i.test(d) && !/::/.test(d)) return false
    const lit=d.match(/^'([^']*)'/); if(lit) return lit[1]
    const num=d.match(/^-?\d+(?:\.\d+)?/); if(num) return num[0]
  }
  if(col.type==='boolean') return false
  if(col.type==='jsonb') return '{}'
  return ''
}
function valueForInput(type,value){
  if(value == null) return type==='checkbox' ? false : ''
  if(type==='datetime-local' && typeof value==='string') return value.length>=16 ? value.slice(0,16) : value
  return value
}
function parseValue(col, raw){
  if(raw==='' && !col.required) return null
  if(col.type==='boolean') return Boolean(raw)
  if(/numeric|decimal|real|double|int|bigint|smallint/.test(col.type)) return raw==='' ? null : Number(raw)
  if(col.type==='jsonb'){
    if(raw==='' && !col.required) return null
    try{return typeof raw==='string' ? JSON.parse(raw) : raw}catch(e){throw new Error(`${labelize(col.name)}: JSON غير صحيح`)}
  }
  return raw
}
function editorRows(columns){return columns.filter(c=>!HIDDEN.has(c.name))}
function preview(row, columns){
  return editorRows(columns).slice(0,4).map(c=>{
    const v=row[c.name]
    const value=typeof v==='object' && v!==null ? JSON.stringify(v) : String(v ?? '')
    return `${labelize(c.name)}: ${value.slice(0,60)}`
  }).join(' · ')
}

export default function DataManager(){
  const {workspace}=useWorkspace()
  const [table,setTable]=useState('uos_projects')
  const [rows,setRows]=useState([])
  const [loading,setLoading]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [notice,setNotice]=useState('')
  const [query,setQuery]=useState('')
  const [editing,setEditing]=useState(null)
  const [draft,setDraft]=useState({})

  const defs=Object.entries(UOS_SCHEMA.tables)
    .filter(([name])=>!SYSTEM_GROUPS.has(name))
    .sort(([a],[b])=>a.localeCompare(b))
  const def=UOS_SCHEMA.tables[table]
  const cols=def?.columns||[]
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase()
    if(!q) return rows
    return rows.filter(r=>JSON.stringify(r).toLowerCase().includes(q))
  },[rows,query])

  async function load(){
    if(!workspace || !def) return
    setLoading(true);setError('');
    try{
      const data=await listTableRecords(table,{workspaceId:workspace.id,workspaceScoped:def.workspaceScoped})
      setRows(data)
    }catch(e){setError(e.message||'تعذر تحميل السجلات')}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[table,workspace?.id])

  function newRecord(){
    if(def.readOnly){setError('هذا الجدول للقراءة فقط.');return}
    const next={}
    for(const col of cols){
      if(HIDDEN.has(col.name)) continue
      if(col.name==='workspace_id') continue
      next[col.name]=initialValue(col)
    }
    setEditing({mode:'create',id:null});setDraft(next);setError('');setNotice('')
  }
  function editRecord(row){
    if(def.readOnly){setError('هذا الجدول للقراءة فقط.');return}
    const next={}
    for(const col of editorRows(cols)) next[col.name]=valueForInput(inputType(col.type),row[col.name])
    setEditing({mode:'edit',id:row.id});setDraft(next);setError('');setNotice('')
  }
  async function save(){
    setBusy(true);setError('');setNotice('')
    try{
      const payload={}
      for(const col of editorRows(cols)) payload[col.name]=parseValue(col,draft[col.name])
      if(editing.mode==='create') await createTableRecord(table,payload,{workspaceId:workspace?.id,workspaceScoped:def.workspaceScoped})
      else await updateTableRecord(table,editing.id,payload)
      setEditing(null);setDraft({});setNotice(editing.mode==='create'?'تمت الإضافة بنجاح':'تم التعديل بنجاح');await load()
    }catch(e){setError(e.message||'تعذر حفظ السجل')}
    finally{setBusy(false)}
  }
  async function remove(row){
    if(def.readOnly || def.protectedDelete){setError('هذا الجدول محمي من التعديل/الحذف المباشر.');return}
    if(!window.confirm('هل أنت متأكد من حذف السجل؟ العملية لا يمكن التراجع عنها من هذه الشاشة.')) return
    setBusy(true);setError('');setNotice('')
    try{await deleteTableRecord(table,row.id);setNotice('تم حذف السجل بنجاح');await load()}
    catch(e){setError(e.message||'تعذر حذف السجل')}
    finally{setBusy(false)}
  }

  return <div>
    <header className="page-head">
      <div><div className="eyebrow">CRUD COMPLETION · PHASE 21</div><h1>Data Manager</h1><p className="muted">إدارة CRUD كاملة لسجلات Unified OS. الـContentOS الأصلي لا يُعدل من هنا.</p></div>
      <div className="actions"><button className="primary" disabled={def?.readOnly} onClick={newRecord}>+ سجل جديد</button></div>
    </header>
    {error&&<div className="error" style={{marginBottom:12}}>{error}</div>}
    {notice&&<div className="card" style={{marginBottom:12,borderColor:'#abefc6',color:'#067647'}}>{notice}</div>}
    <div className="card" style={{marginBottom:14}}>
      <div className="form-grid">
        <label className="muted">Entity / Table<select value={table} onChange={e=>{setTable(e.target.value);setEditing(null);setQuery('')}}>{defs.map(([name,d])=><option key={name} value={name}>{labelize(name)} {d.protectedDelete?'· Protected':''}</option>)}</select></label>
        <label className="muted">Search records<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث في السجلات…"/></label>
        <div className="muted" style={{alignSelf:'end'}}>Records: <strong>{filtered.length}</strong> · Scope: {def?.workspaceScoped?'Workspace':'Global'} · {def?.readOnly?'Read only':'CRUD enabled'}</div>
      </div>
    </div>
    {editing&&<div className="card" style={{marginBottom:14,borderColor:'#bfd4ff'}}>
      <div className="section-head"><h2>{editing.mode==='create'?'إضافة سجل':'تعديل سجل'}</h2><button className="secondary" onClick={()=>setEditing(null)}>إلغاء</button></div>
      <div className="form-stack">
        {editorRows(cols).map(col=>{
          const t=inputType(col.type)
          const v=draft[col.name]
          if(t==='checkbox') return <label key={col.name} className="muted" style={{flexDirection:'row',alignItems:'center',gap:8}}><input type="checkbox" checked={Boolean(v)} onChange={e=>setDraft(d=>({...d,[col.name]:e.target.checked}))}/>{labelize(col.name)}</label>
          if(t==='text' && col.type==='jsonb') return <label key={col.name} className="muted">{labelize(col.name)}<textarea rows="4" value={v??''} required={col.required} onChange={e=>setDraft(d=>({...d,[col.name]:e.target.value}))}/></label>
          return <label key={col.name} className="muted">{labelize(col.name)} {col.required?'*':''}<input type={t} value={v??''} required={col.required} onChange={e=>setDraft(d=>({...d,[col.name]:e.target.value}))}/></label>
        })}
      </div>
      <div className="actions" style={{marginTop:12}}><button className="primary" disabled={busy} onClick={save}>{busy?'جاري الحفظ…':'حفظ'}</button></div>
    </div>}
    <section className="section"><div className="card"><div className="section-head"><h2>{labelize(table)}</h2><span className="muted">{filtered.length} سجل</span></div>{loading?<div className="muted">جاري التحميل…</div>:filtered.length?filtered.map(row=><div className="list-row" key={row.id||JSON.stringify(row)}><div className="between" style={{alignItems:'center'}}><div style={{minWidth:0}}><strong>{row.name||row.title||row.id||'Record'}</strong><div className="muted" style={{wordBreak:'break-word'}}>{preview(row,cols)}</div></div><div className="actions" style={{flexShrink:0}}><button className="secondary" disabled={def.readOnly} onClick={()=>editRecord(row)}>تعديل</button><button className="danger" disabled={def.readOnly || def.protectedDelete} onClick={()=>remove(row)}>حذف</button></div></div></div>):<div className="muted">لا توجد سجلات.</div>}</div></section>
  </div>
}
