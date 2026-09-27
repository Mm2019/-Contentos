import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { scanContentOSAnalytics } from '../lib/contentosAnalyticsBridge'

const severityClass = (severity) => severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info'

export default function ContentOSAnalytics(){
  const [scan,setScan]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const runScan=useCallback(async()=>{
    setLoading(true);setError('')
    try{setScan(await scanContentOSAnalytics())}catch(e){setError(e?.message||'تعذر فحص Analytics في ContentOS.')}finally{setLoading(false)}
  },[])
  useEffect(()=>{runScan()},[runScan])
  const errors=useMemo(()=>scan?.issues?.filter(i=>i.severity==='error').length||0,[scan])
  const warnings=useMemo(()=>scan?.issues?.filter(i=>i.severity==='warning').length||0,[scan])
  return <div>
    <Link className="muted" to="/contentos">← ContentOS</Link>
    <header className="page-head">
      <div><div className="eyebrow">PHASE 9 · ANALYTICS ENGINE</div><h1>ContentOS Analytics Integrity</h1><p className="muted">طبقة تحقق فوق Analytics الموجود أصلًا داخل ContentOS: Raw Metrics → KPIs → Targets / Benchmarks → History / Snapshots.</p></div>
      <div className="actions"><Link className="secondary" to="/contentos/configuration">Configuration ↗</Link><button className="primary" onClick={runScan} disabled={loading}>{loading?'جاري الفحص…':'إعادة الفحص'}</button></div>
    </header>
    {error&&<div className="error" style={{marginBottom:16}}>{error}</div>}
    {loading&&!scan?<div className="card">جاري قراءة ContentOS الأصلي…</div>:null}
    {scan&&<>
      <section className="card" style={{marginBottom:16}}><div className="section-head"><div><div className="eyebrow">SOURCE OF TRUTH</div><h2>Existing ContentOS</h2></div><span className={`status-badge ${errors?'bad':'good'}`}>{errors?`${errors} errors`:'Analytics integrity clean'}</span></div><div className="muted">الفحص Read-only. لا يتم نقل Raw Metrics أو KPIs أو History إلى Unified OS، ولا يتم تعديل السجلات التاريخية.</div><div className="chip-row"><span className="chip selected">Source: {scan.source}</span>{scan.updatedAt&&<span className="chip">Updated: {new Date(scan.updatedAt).toLocaleString()}</span>}<span className="chip">Warnings: {warnings}</span></div></section>
      <section className="grid grid-4">
        <Metric title="Raw Metrics" value={scan.counts.rawMetricDefs}/><Metric title="Platform Metrics" value={scan.counts.platformMetricDefs}/><Metric title="Canonical Metrics" value={scan.counts.canonicalMetricDefs}/><Metric title="KPI Definitions" value={scan.counts.kpiDefs}/>
      </section>
      <section className="grid grid-4" style={{marginTop:16}}>
        <Metric title="Formula KPIs" value={scan.counts.formulaDefs}/><Metric title="Target Configs" value={scan.counts.targetDefs}/><Metric title="Benchmarks" value={scan.counts.benchmarkDefs}/><Metric title="Analytics Entries" value={scan.counts.analyticsEntries}/>
      </section>
      <section className="grid grid-4" style={{marginTop:16}}>
        <Metric title="With Snapshots" value={`${scan.counts.entriesWithSnapshot}/${scan.counts.analyticsEntries||0}`}/><Metric title="With Revisions" value={`${scan.counts.entriesWithRevision}/${scan.counts.analyticsEntries||0}`}/><Metric title="Platform Mapped" value={scan.counts.mappedPlatformMetrics}/><Metric title="Unmapped" value={scan.counts.unmappedPlatformMetrics}/>
      </section>
      <section className="section"><div className="section-head"><div><div className="eyebrow">ENGINE CHECKS</div><h2>Analytics Architecture</h2></div><span className="muted">{new Date(scan.scannedAt).toLocaleString()}</span></div><div className="card-list">{scan.checks.map(check=><div className="list-row" key={check.key}><span className={`status-dot ${check.ok?'ok':'bad'}`}></span><span style={{flex:1}}>{check.label}</span><strong>{check.ok?'PASS':'CHECK'}</strong></div>)}</div></section>
      <section className="section card"><div className="section-head"><div><div className="eyebrow">HISTORY SAFETY</div><h2>Historical Measurements Stay Frozen</h2></div></div><p className="muted" style={{lineHeight:1.8}}>كل measurement قديم يجب أن يحتفظ بـ revision وrecordedAt وsource وdefinitionSnapshot. تغيير KPI أو target أو canonical mapping لاحقًا لا يعيد كتابة القياس التاريخي.</p><div className="chip-row"><span className="chip">History arrays: {scan.counts.entriesWithHistory}/{scan.counts.analyticsEntries||0}</span><span className="chip">Definition snapshots: {scan.counts.entriesWithSnapshot}/{scan.counts.analyticsEntries||0}</span></div></section>
      <section className="section card"><div className="section-head"><div><div className="eyebrow">ISSUE REGISTER</div><h2>{scan.issues.length?`${scan.issues.length} findings`:'No findings'}</h2></div><span className="muted">Errors: {errors} · Warnings: {warnings}</span></div>{scan.issues.length?<div className="card-list">{scan.issues.map((i,n)=><div className="list-row" key={`${i.code}-${n}`}><span className={`badge ${severityClass(i.severity)}`}>{i.severity}</span><div style={{flex:1}}><strong>{i.code}</strong><div className="muted" style={{marginTop:3}}>{i.message}</div></div></div>)}</div>:<div className="muted">Raw Metrics, platform metrics, canonical mapping, KPI formulas, targets, scoring, history, and definition snapshots passed the current structural checks.</div>}</section>
    </>}
  </div>
}
function Metric({title,value}){return <div className="metric"><div className="muted">{title}</div><strong className="metric-value-wrap">{value}</strong></div>}
