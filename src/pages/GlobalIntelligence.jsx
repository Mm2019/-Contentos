import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../lib/workspace'
import { collectGlobalIntelligence, listPersistedIntelligence, persistIntelligenceFindings, updateIntelligenceStatus } from '../lib/globalIntelligence'

const severityOrder = { critical: 0, high: 1, medium: 2, info: 3 }
const severityLabel = { critical: 'Critical', high: 'High', medium: 'Medium', info: 'Info' }

export default function GlobalIntelligence() {
  const { workspace } = useWorkspace()
  const [analysis, setAnalysis] = useState(null)
  const [persisted, setPersisted] = useState([])
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [contentScan, setContentScan] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  async function refreshPersisted() {
    if (!workspace) return
    try { setPersisted(await listPersistedIntelligence(workspace.id)) } catch (e) { setError(e.message) }
  }

  useEffect(() => { refreshPersisted() }, [workspace?.id])

  async function runAnalysis() {
    if (!workspace) return
    setRunning(true); setError(''); setSelected(null)
    try { setAnalysis(await collectGlobalIntelligence(workspace.id, { includeContentOS: contentScan })) }
    catch (e) { setError(e.message) }
    finally { setRunning(false) }
  }

  async function saveFindings() {
    if (!workspace || !analysis?.signals?.length) return
    setSaving(true); setError('')
    try { await persistIntelligenceFindings(workspace.id, analysis.signals); await refreshPersisted() }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function setStatus(id, status) {
    try { await updateIntelligenceStatus(id, status); await refreshPersisted() }
    catch (e) { setError(e.message) }
  }

  const visibleSignals = useMemo(() => [...(analysis?.signals || [])].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]), [analysis])
  const openPersisted = persisted.filter(x => x.status === 'open')

  return <div>
    <header className="page-head">
      <div>
        <div className="eyebrow">PHASE 17 · GLOBAL INTELLIGENCE</div>
        <h1>Global Intelligence</h1>
        <p className="muted">تحليل عابر للأنظمة مبني فقط على البيانات الموجودة فعليًا. لا يتم تعديل أي Source of Truth تلقائيًا.</p>
      </div>
      <div className="actions">
        <label className="secondary" style={{gap:8,cursor:'pointer'}}><input type="checkbox" checked={contentScan} onChange={e=>setContentScan(e.target.checked)} /> فحص ContentOS</label>
        <button className="primary" onClick={runAnalysis} disabled={running}>{running ? 'جاري التحليل…' : 'تشغيل التحليل'}</button>
        <button className="secondary" onClick={saveFindings} disabled={saving || !analysis?.signals?.length}>{saving ? 'جاري الحفظ…' : 'حفظ الإشارات'}</button>
      </div>
    </header>
    {error && <div className="error">{error}</div>}

    {analysis ? <>
      <section className="grid grid-4">
        <Metric label="Signals" value={analysis.signals.length}/>
        <Metric label="Critical / High" value={analysis.signals.filter(x=>['critical','high'].includes(x.severity)).length}/>
        <Metric label="Overdue Tasks" value={analysis.meta.overdueTasks}/>
        <Metric label="Budget Alerts" value={analysis.meta.openBudgetAlerts}/>
        <Metric label="Inventory Risk" value={analysis.meta.criticalInventory}/>
        <Metric label="Pending Orders" value={analysis.meta.pendingOrders}/>
        <Metric label="Active Returns" value={analysis.meta.activeReturns}/>
        <Metric label="Business Revenue Δ" value={analysis.meta.businessRevenueChangePercent === null ? 'insufficient data' : `${analysis.meta.businessRevenueChangePercent}%`}/>
      </section>

      <section className="section card">
        <div className="section-head"><div><div className="eyebrow">DATA-DERIVED FINDINGS</div><h2>Current Signals</h2></div><span className="muted">Generated {new Date(analysis.generatedAt).toLocaleString('ar-EG')}</span></div>
        {!visibleSignals.length ? <div className="muted">لا توجد إشارات تستوفي قواعد Phase 17 الحالية.</div> : <div className="card-list">{visibleSignals.map(signal => <button key={signal.fingerprint} className={`list-row intelligence-row ${signal.severity}`} onClick={()=>setSelected(signal)}><div><span className={`badge ${signal.severity==='critical'?'error':signal.severity==='high'?'warning':'info'}`}>{severityLabel[signal.severity]}</span><strong>{signal.title}</strong></div><div className="muted">{signal.summary}</div><div className="muted">Confidence: {signal.confidence} · Sources: {signal.sourceEntities.join(', ')}</div></button>)}</div>}
      </section>

      {analysis.content && <section className="section card">
        <div className="section-head"><div><div className="eyebrow">EXISTING CONTENTOS</div><h2>Content Intelligence Snapshot</h2></div><Link to="/contentos/intelligence">فتح ContentOS Intelligence ↗</Link></div>
        {analysis.content.unavailable ? <div className="error">تعذر فحص ContentOS: {analysis.content.error}</div> : <div className="grid grid-3"><Metric label="Trend" value={analysis.content.trend || '—'}/><Metric label="Recommendations" value={analysis.content.recommendations.length}/><Metric label="Anomalies" value={analysis.content.anomalies.length}/></div>}
      </section>}
    </> : <section className="card"><div className="eyebrow">READY</div><h2>شغّل Global Intelligence</h2><p className="muted">سيتم تحليل الـFinance والـProjects والـTasks والـGoals والـCommerce، ومع خيار فحص ContentOS الأصلي.</p></section>}

    <section className="section">
      <div className="section-head"><div><div className="eyebrow">PERSISTED</div><h2>Open Intelligence Events</h2></div><span className="muted">{openPersisted.length} open</span></div>
      {!persisted.length ? <div className="card muted">لا توجد نتائج محفوظة بعد.</div> : <div className="grid grid-2">{persisted.slice(0,20).map(item=><div className="card" key={item.id}><div className="between"><div><span className={`badge ${item.severity==='critical'?'error':item.severity==='high'?'warning':'info'}`}>{severityLabel[item.severity] || item.severity}</span><strong>{item.title}</strong></div><span className="chip">{item.status}</span></div><p className="muted">{item.summary}</p><div className="actions"><button className="secondary" onClick={()=>setSelected(item)}>Evidence</button>{item.status==='open'&&<button className="secondary" onClick={()=>setStatus(item.id,'acknowledged')}>Acknowledge</button>}{item.status!=='dismissed'&&<button className="danger" onClick={()=>setStatus(item.id,'dismissed')}>Dismiss</button>}</div></div>)}</div>}
    </section>

    {selected && <section className="section card"><div className="section-head"><div><div className="eyebrow">EVIDENCE</div><h2>{selected.title}</h2></div><button className="secondary" onClick={()=>setSelected(null)}>إغلاق</button></div><p className="muted">{selected.summary}</p><div className="grid grid-2"><div><div className="eyebrow">Sources</div>{(selected.sourceEntities||[]).map(s=><div className="list-row" key={s}>{s}</div>)}</div><div><div className="eyebrow">Evidence</div>{(selected.evidence||[]).map((x,i)=><pre className="card" key={i} style={{overflow:'auto',marginTop:8}}>{JSON.stringify(x,null,2)}</pre>)}</div></div></section>}
  </div>
}
function Metric({label,value}){return <div className="metric"><div className="muted">{label}</div><strong className="metric-value-wrap">{value}</strong></div>}
