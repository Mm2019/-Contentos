import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { scanContentOSIntelligence } from '../lib/contentosIntelligenceBridge'

export default function ContentOSIntelligence(){
  const [scan,setScan]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const runScan=useCallback(async()=>{
    setLoading(true);setError('')
    try{setScan(await scanContentOSIntelligence())}
    catch(e){setError(e?.message||'تعذر فحص ContentOS Intelligence.')}finally{setLoading(false)}
  },[])
  useEffect(()=>{runScan()},[runScan])
  const errors=useMemo(()=>scan?.issues?.filter(i=>i.severity==='error').length||0,[scan])
  const trend=scan?.report?.trend
  const trendLabel=trend==='up'?'↗ يتحسن':trend==='down'?'↘ يتراجع':trend==='flat'?'→ مستقر':'— غير كافٍ'
  return <div>
    <Link className="muted" to="/contentos/analytics">← ContentOS Analytics</Link>
    <header className="page-head">
      <div><div className="eyebrow">PHASE 10 · CONTENT INTELLIGENCE</div><h1>ContentOS Intelligence</h1><p className="muted">طبقة Unified OS تقرأ محرك Intelligence الموجود أصلًا داخل ContentOS: Analytics → Patterns → Learning Signals → Recommendations → Content Decisions.</p></div>
      <div className="actions"><Link className="secondary" to="/contentos/analytics">Analytics ↗</Link><button className="primary" onClick={runScan} disabled={loading}>{loading?'جاري الفحص…':'إعادة الفحص'}</button></div>
    </header>
    {error&&<div className="error" style={{marginBottom:16}}>{error}</div>}
    {loading&&!scan?<div className="card">جاري تشغيل محرك Intelligence الأصلي بوضع Read-only…</div>:null}
    {scan&&<>
      <section className="card" style={{marginBottom:16}}><div className="section-head"><div><div className="eyebrow">SOURCE OF TRUTH</div><h2>Existing ContentOS Intelligence</h2></div><span className={`status-badge ${errors?'bad':'good'}`}>{errors?`${errors} errors`:'Intelligence integrity clean'}</span></div><div className="muted" style={{lineHeight:1.8}}>لا يوجد محرك Intelligence بديل هنا. الفحص يشغل الدوال الموجودة داخل ContentOS نفسه ويقرأ learning signals من <code>cos_v8</code> بدون تعديل البيانات.</div><div className="chip-row"><span className="chip selected">Source: {scan.source}</span><span className="chip">Schema: {scan.schemaVersion||'—'}</span></div></section>
      <section className="grid grid-4"><Metric title="Analytics Records" value={scan.counts.analyticsRecords}/><Metric title="Learning Signals" value={scan.counts.learningSignals}/><Metric title="Recommendations" value={scan.counts.recommendations}/><Metric title="Trend" value={trendLabel}/></section>
      <section className="grid grid-4" style={{marginTop:16}}><Metric title="Proposed" value={scan.counts.proposed}/><Metric title="Accepted" value={scan.counts.accepted}/><Metric title="Applied" value={scan.counts.applied}/><Metric title="Rejected" value={scan.counts.rejected}/></section>
      {scan.report&&<section className="section card"><div className="section-head"><div><div className="eyebrow">ORIGINAL ENGINE OUTPUT</div><h2>Current Intelligence Snapshot</h2></div><span className="muted">Read-only</span></div><div className="grid grid-3"><Metric title="Average" value={scan.report.avg==null?'—':Number(scan.report.avg).toFixed(1)}/><Metric title="Recent Average" value={scan.report.recentAvg==null?'—':Number(scan.report.recentAvg).toFixed(1)}/><Metric title="Previous Average" value={scan.report.previousAvg==null?'—':Number(scan.report.previousAvg).toFixed(1)}/></div></section>}
      <section className="section"><div className="section-head"><div><div className="eyebrow">PIPELINE CHECKS</div><h2>Analytics → Learning → Recommendations</h2></div><span className="muted">{new Date(scan.scannedAt).toLocaleString()}</span></div><div className="card-list">{scan.checks.map(check=><div className="list-row" key={check.key}><span className={`status-dot ${check.ok?'ok':'bad'}`}></span><span style={{flex:1}}>{check.label}</span><strong>{check.ok?'PASS':'CHECK'}</strong></div>)}</div></section>
      <section className="section card"><div className="section-head"><div><div className="eyebrow">RECOMMENDATIONS</div><h2>Traceable Recommendations</h2></div><span className="muted">لا يتم تطبيق أي توصية تلقائيًا</span></div>{scan.report?.recommendations?.length?<div className="card-list">{scan.report.recommendations.slice(0,8).map((r,i)=><div className="list-row" key={`${r.type}-${i}`}><span className="badge info">{r.type}</span><div style={{flex:1}}><strong>{r.title}</strong><div className="muted" style={{marginTop:4}}>{r.text}</div></div></div>)}</div>:<div className="muted">لا توجد توصيات حاليًا من محرك ContentOS الأصلي.</div>}</section>
      <section className="section card"><div className="section-head"><div><div className="eyebrow">LEARNING LOOP</div><h2>Learning Signals</h2></div><span className="muted">Review before reuse</span></div>{scan.learning.length?<div className="card-list">{scan.learning.map(x=><div className="list-row" key={x.id}><div style={{flex:1}}><strong>{x.title}</strong><div className="muted" style={{marginTop:3}}>{x.source||'analytics'} · {x.evidenceCount} evidence items</div></div><span className={`badge ${x.status==='applied'?'info':x.status==='accepted'?'warning':x.status==='rejected'?'error':'info'}`}>{x.status}</span></div>)}</div>:<div className="muted">لا توجد Learning Signals محفوظة بعد.</div>}</section>
      <section className="section card"><div className="section-head"><div><div className="eyebrow">ISSUE REGISTER</div><h2>{scan.issues.length?`${scan.issues.length} findings`:'No findings'}</h2></div><span className="muted">Errors: {errors}</span></div>{scan.issues.length?<div className="card-list">{scan.issues.map((i,n)=><div className="list-row" key={`${i.code}-${n}`}><span className="badge error">{i.severity}</span><div style={{flex:1}}><strong>{i.code}</strong><div className="muted" style={{marginTop:3}}>{i.message}</div></div></div>)}</div>:<div className="muted">محرك Intelligence الأصلي، learning loop، وtraceability checks اجتازت الفحص البنيوي الحالي.</div>}</section>
    </>}
  </div>
}
function Metric({title,value}){return <div className="metric"><div className="muted">{title}</div><strong className="metric-value-wrap">{value}</strong></div>}
