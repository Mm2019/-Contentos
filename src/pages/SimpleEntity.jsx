import { useEffect, useState } from 'react'
import { createEntity, deleteEntity, listEntities, updateEntity } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

function blankFromFields(fields, defaults){
  const value={...defaults}
  for(const [key] of fields) if(value[key]===undefined) value[key]=''
  return value
}

export default function SimpleEntity({table,title,placeholder,fields=[],defaults={}}){
 const {workspace}=useWorkspace(); const [rows,setRows]=useState([]); const [value,setValue]=useState(blankFromFields(fields,defaults)); const [editing,setEditing]=useState(null); const [busy,setBusy]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
 const load=async()=>{if(!workspace)return;setLoading(true);try{setRows(await listEntities(table,workspace.id))}catch(e){setError(e.message||'تعذر تحميل السجلات')}finally{setLoading(false)}};
 useEffect(()=>{load()},[workspace?.id]);
 function startEdit(row){setEditing(row.id);const next={...defaults};for(const [key] of fields) next[key]=row[key]??'';setValue(next);setError('')}
 function reset(){setEditing(null);setValue(blankFromFields(fields,defaults))}
 async function submit(e){e.preventDefault();if(!workspace)return;setBusy(true);setError('');try{if(editing)await updateEntity(table,editing,value);else await createEntity(table,{workspace_id:workspace.id,...value});reset();await load()}catch(e){setError(e.message||'تعذر حفظ السجل')}finally{setBusy(false)}}
 async function remove(id){if(!window.confirm('حذف السجل؟'))return;setBusy(true);setError('');try{await deleteEntity(table,id);if(editing===id)reset();await load()}catch(e){setError(e.message||'تعذر حذف السجل')}finally{setBusy(false)}}
 return <div><header className="page-head"><div><div className="eyebrow">SHARED CORE · CRUD</div><h1>{title}</h1><p className="muted">مصدر بيانات مشترك للأنظمة، مع إضافة وتعديل وحذف مباشر.</p></div></header>{error&&<div className="error" style={{marginBottom:12}}>{error}</div>}<div className="card"><div className="section-head"><h2>{editing?'تعديل سجل':'إضافة سجل'}</h2>{editing&&<button className="secondary" onClick={reset}>إلغاء</button>}</div><form onSubmit={submit}><div className="form-grid">{fields.map(([key,label,type='text'])=>type==='select'?<select key={key} value={value[key]??''} onChange={e=>setValue(v=>({...v,[key]:e.target.value}))}>{label.map(o=><option value={o} key={o}>{o}</option>)}</select>:<input key={key} type={type} placeholder={type==='date'||type==='datetime-local'?'':label} value={value[key]??''} onChange={e=>setValue(v=>({...v,[key]:e.target.value}))} required={key==='title'}/>) }<button className="primary" disabled={busy}>{busy?'جاري الحفظ…':editing?'حفظ التعديل':'إضافة'}</button></div></form></div><section className="section"><div className="card">{loading?<div className="muted">جاري التحميل…</div>:rows.map(r=><div className="list-row between" key={r.id}><div><strong>{r.title||r.name}</strong><div className="muted">{r.status||r.description||r.due_date||''}</div></div><div className="actions"><button className="secondary" onClick={()=>startEdit(r)}>تعديل</button><button className="danger" onClick={()=>remove(r.id)} disabled={busy}>حذف</button></div></div>)}{!loading&&!rows.length&&<div className="muted">لا توجد سجلات.</div>}</div></section></div>
}
