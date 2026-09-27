import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { scanContentOSConfiguration } from '../lib/contentosConfigBridge'

const severityClass = (severity) => severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info'

export default function ContentOSConfig(){
  const [scan,setScan] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')

  const runScan = useCallback(async()=>{
    setLoading(true)
    setError('')
    try { setScan(await scanContentOSConfiguration()) }
    catch(e){ setError(e?.message || 'تعذر فحص ContentOS.') }
    finally { setLoading(false) }
  },[])

  useEffect(()=>{ runScan() },[runScan])

  const errorCount = useMemo(()=>scan?.issues?.filter(i=>i.severity==='error').length||0,[scan])
  const warningCount = useMemo(()=>scan?.issues?.filter(i=>i.severity==='warning').length||0,[scan])

  return <div>
    <Link className="muted" to="/contentos">← ContentOS</Link>
    <header className="page-head">
      <div>
        <div className="eyebrow">PHASE 8 · CONFIGURATION ENGINE</div>
        <h1>ContentOS Configuration Integrity</h1>
        <p className="muted">فحص مباشر للـContentOS الأصلي. لا يتم إنشاء نسخة من الحسابات أو الـworkflow أو الـKPIs.</p>
      </div>
      <div className="actions">
        <Link className="secondary" to="/contentos">فتح ContentOS</Link><Link className="secondary" to="/contentos/analytics">Analytics Integrity ↗</Link>
        <button className="primary" onClick={runScan} disabled={loading}>{loading ? 'جاري الفحص…' : 'إعادة الفحص'}</button>
      </div>
    </header>

    <div className="card" style={{marginBottom:16}}>
      <div className="section-head"><div><div className="eyebrow">SOURCE OF TRUTH</div><h2>Existing ContentOS</h2></div><span className={`status-badge ${errorCount ? 'bad' : 'good'}`}>{errorCount ? `${errorCount} errors` : 'No configuration errors'}</span></div>
      <div className="muted" style={{lineHeight:1.7}}>المسح يستخدم وظائف ContentOS الأصلية مثل <code>loadData()</code> و<code>getEffectiveContentConfig()</code>. الـUnified OS لا يكتب على مصدر ContentOS من هذه الشاشة.</div>
      {scan?.source&&<div className="chip-row" style={{marginTop:12}}><span className="chip selected">Source: {scan.source}</span>{scan.updatedAt&&<span className="chip">Updated: {new Date(scan.updatedAt).toLocaleString()}</span>}</div>}
    </div>

    {error&&<div className="error" style={{marginBottom:16}}>{error}</div>}

    {scan&&<>
      <section className="grid grid-4">
        <Metric title="Accounts" value={scan.counts.accounts}/>
        <Metric title="Config Entries" value={scan.counts.configEntries}/>
        <Metric title="Workflow Snapshots" value={scan.counts.snapshotPosts}/>
        <Metric title="Custom Overrides" value={scan.counts.customOverrides}/>
      </section>
      <section className="grid grid-4" style={{marginTop:16}}>
        <Metric title="Approval Stages" value={scan.counts.approvalStages}/>
        <Metric title="Analytics Entries" value={scan.counts.analyticsEntries}/>
        <Metric title="Definition Snapshots" value={scan.counts.analyticsSnapshots}/>
        <Metric title="Warnings" value={warningCount}/>
      </section>

      <section className="section">
        <div className="section-head"><div><div className="eyebrow">INHERITANCE + SNAPSHOTS</div><h2>Engine Checks</h2></div><span className="muted">{new Date(scan.scannedAt).toLocaleString()}</span></div>
        <div className="card-list">{scan.checks.map(check=><div className="list-row" key={check.key}><span className={`status-dot ${check.ok?'ok':'bad'}`}></span><span style={{flex:1}}>{check.label}</span><strong>{check.ok?'PASS':'CHECK'}</strong></div>)}</div>
      </section>

      <section className="section card">
        <div className="section-head"><div><div className="eyebrow">ISSUE REGISTER</div><h2>{scan.issues.length ? `${scan.issues.length} findings` : 'No findings'}</h2></div><span className="muted">Errors: {errorCount} · Warnings: {warningCount}</span></div>
        {scan.issues.length===0 ? <div className="muted">Inheritance, overrides, workflow snapshots, approvals, and analytics snapshot metadata passed the current structural checks.</div> : <div className="card-list">{scan.issues.map((item,index)=><div className="list-row" key={`${item.code}-${index}`}><span className={`badge ${severityClass(item.severity)}`}>{item.severity}</span><div style={{flex:1}}><strong>{item.code}</strong><div className="muted" style={{marginTop:3}}>{item.message}</div></div></div>)}</div>}
      </section>

      <section className="card">
        <div className="section-head"><div><div className="eyebrow">SAFETY RULE</div><h2>Historical behavior stays frozen</h2></div></div>
        <p className="muted" style={{lineHeight:1.8}}>الـworkflow snapshot الخاص بالمنشور القديم لا يتم إعادة اشتقاقه من إعداد الحساب الحالي. تغييرات Account configuration تُستخدم للمحتوى الجديد، بينما التاريخ يحتفظ بالـsnapshot الموجود في ContentOS.</p>
        <div className="chip-row"><span className="chip">Legacy posts without snapshots: {scan.counts.legacyPosts}</span><span className="chip">Snapshots present: {scan.counts.snapshotPosts}</span></div>
      </section>
    </>}
  </div>
}

function Metric({title,value}){ return <div className="metric"><div className="muted">{title}</div><strong className="metric-value-wrap">{value}</strong></div> }
