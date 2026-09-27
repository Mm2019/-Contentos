import { useEffect, useMemo, useState } from 'react'
import { useWorkspace } from '../lib/workspace'
import { supabase } from '../lib/supabase'

export default function VersioningRecovery() {
  const { workspace } = useWorkspace()
  const [context, setContext] = useState(null)
  const [migrations, setMigrations] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [runs, setRuns] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedSnapshot, setSelectedSnapshot] = useState('')
  const [restoreName, setRestoreName] = useState('Restored Workspace')
  const [restoredWorkspaceId, setRestoredWorkspaceId] = useState('')

  async function load() {
    if (!workspace || !supabase) return
    setError(''); setMessage('')
    try {
      const [ctx, mig, snap, run] = await Promise.all([
        supabase.rpc('uos_recovery_context', { p_workspace: workspace.id }),
        supabase.from('uos_migration_log').select('*').order('version', { ascending: true }),
        supabase.from('uos_recovery_snapshots').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false }).limit(40),
        supabase.from('uos_recovery_runs').select('*').eq('workspace_id', workspace.id).order('started_at', { ascending: false }).limit(40),
      ])
      if (ctx.error) throw ctx.error
      if (mig.error) throw mig.error
      if (snap.error) throw snap.error
      if (run.error) throw run.error
      setContext(ctx.data || null)
      setMigrations(mig.data || [])
      setSnapshots(snap.data || [])
      setRuns(run.data || [])
    } catch (e) { setError(e.message || String(e)) }
  }

  useEffect(() => { load() }, [workspace?.id])

  const current = context?.currentSchemaVersion || '—'
  const compatibility = context?.minimumCompatibleVersion ? `≥ ${context.minimumCompatibleVersion}` : '—'
  const selected = useMemo(() => snapshots.find(s => s.id === selectedSnapshot), [snapshots, selectedSnapshot])

  async function createSnapshot(kind='manual') {
    if (!workspace || !context?.canManage) return
    try {
      const { data, error: e } = await supabase.rpc('uos_create_recovery_snapshot', { p_workspace: workspace.id, p_snapshot_type: kind })
      if (e) throw e
      setSelectedSnapshot(data)
      setMessage(`Snapshot ${data} created successfully.`)
      await load()
    } catch (e) { setError(e.message || String(e)) }
  }

  async function validateSnapshot() {
    if (!selectedSnapshot) return
    try {
      const { data, error: e } = await supabase.rpc('uos_validate_recovery_snapshot', { p_snapshot: selectedSnapshot })
      if (e) throw e
      setMessage(JSON.stringify(data, null, 2))
    } catch (e) { setError(e.message || String(e)) }
  }

  async function exportSnapshot() {
    if (!selectedSnapshot) return
    try {
      const { data: itemRows, error: e1 } = await supabase.from('uos_recovery_items').select('table_name,row_count,payload,checksum').eq('snapshot_id', selectedSnapshot).order('table_name')
      if (e1) throw e1
      const pkg = { format:'unified-os-recovery-v1', snapshot:selected, items:itemRows || [] }
      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type:'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `unified-os-${selectedSnapshot}.json`; a.click(); URL.revokeObjectURL(url)
      setMessage('Recovery backup downloaded as JSON. ContentOS native recovery remains separate.')
    } catch (e) { setError(e.message || String(e)) }
  }

  async function restoreSnapshot() {
    if (!selectedSnapshot || !context?.canManage) return
    try {
      const { data, error: e } = await supabase.rpc('uos_restore_snapshot_as_new_workspace', { p_snapshot: selectedSnapshot, p_new_name: restoreName })
      if (e) throw e
      setRestoredWorkspaceId(data || '')
      setMessage(`Safe restore completed into new workspace: ${data}`)
      await load()
    } catch (e) { setError(e.message || String(e)) }
  }

  async function rollbackRestoredWorkspace() {
    if (!restoredWorkspaceId) return
    try {
      const { data, error: e } = await supabase.rpc('uos_rollback_restored_workspace', { p_workspace: restoredWorkspaceId })
      if (e) throw e
      if (!data) throw new Error('Rollback did not complete.')
      setRestoredWorkspaceId('')
      setMessage('Restored workspace rolled back and removed.')
      await load()
    } catch (e) { setError(e.message || String(e)) }
  }

  return <div>
    <header className="page-head">
      <div><div className="eyebrow">PHASE 19 · VERSIONING + RECOVERY</div><h1>Versioning & Recovery</h1><p className="muted">Unified OS has its own schema/migration/recovery control plane. Existing ContentOS keeps its native backup, snapshot, restore and recovery mechanisms.</p></div>
    </header>
    {error && <div className="error">{error}</div>}
    {message && <pre className="card" style={{whiteSpace:'pre-wrap'}}>{message}</pre>}

    <section className="grid grid-4">
      <Metric label="Current schema" value={current} />
      <Metric label="Minimum compatible" value={compatibility} />
      <Metric label="Snapshots" value={String(snapshots.length)} />
      <Metric label="Last run" value={runs[0]?.status || '—'} />
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">RECOVERY CONTROL PLANE</div><h2>Snapshot / Backup</h2></div><span className="chip">Role: {context?.role || '—'}</span></div>
      <p className="muted">Snapshots cover Unified OS tables that belong to the selected workspace. ContentOS data is intentionally excluded because the original ContentOS remains the authoritative recovery boundary.</p>
      <div className="actions-row">
        <button className="primary" disabled={!context?.canManage} onClick={() => createSnapshot('manual')}>Create Snapshot</button>
        <button disabled={!context?.canManage} onClick={() => createSnapshot('pre_migration')}>Create Pre-Migration Snapshot</button>
      </div>
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">SNAPSHOTS</div><h2>Available Backups</h2></div><span className="muted">Checksum + schema version stored with every snapshot</span></div>
      <div className="card-list">{snapshots.map(s => <div className={`list-row ${selectedSnapshot===s.id?'selected-row':''}`} key={s.id} onClick={() => setSelectedSnapshot(s.id)} style={{cursor:'pointer'}}><div><strong>{s.snapshot_type} · {s.id}</strong><div className="muted">schema {s.schema_version} · {s.table_count} tables · {s.row_count} rows · {new Date(s.created_at).toLocaleString('ar-EG')}</div></div><span className="chip">{s.status}</span></div>)}{!snapshots.length && <div className="muted">No snapshots yet.</div>}</div>
      {selected && <div className="card" style={{marginTop:12}}><strong>Selected snapshot</strong><div className="muted">{selected.id}</div><div className="actions-row" style={{marginTop:10}}><button onClick={validateSnapshot}>Validate Compatibility</button><button onClick={exportSnapshot}>Download JSON Backup</button></div></div>}
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">SAFE RESTORE</div><h2>Restore as a New Workspace</h2></div><span className="muted">Original workspace is never overwritten.</span></div>
      <p className="muted">The safe restore path clones a validated Unified OS snapshot into a new workspace. This makes rollback deterministic: deleting the restored workspace leaves the source workspace untouched.</p>
      <div className="form-grid"><label>New workspace name<input value={restoreName} onChange={e=>setRestoreName(e.target.value)} /></label></div>
      <div className="actions-row"><button className="primary" disabled={!selectedSnapshot || !context?.canManage} onClick={restoreSnapshot}>Restore Selected Snapshot</button>{restoredWorkspaceId && <button onClick={rollbackRestoredWorkspace}>Rollback Restored Workspace</button>}</div>
      {restoredWorkspaceId && <div className="card" style={{marginTop:12}}><strong>Restored workspace</strong><div className="muted">{restoredWorkspaceId}</div></div>}
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">MIGRATIONS</div><h2>Applied Schema Migrations</h2></div><span className="muted">Migration history is append-only metadata</span></div>
      <div className="card-list">{migrations.map(m=><div className="list-row" key={m.version}><div><strong>{m.version} · {m.migration_name}</strong><div className="muted">{m.checksum} · {m.applied_at ? new Date(m.applied_at).toLocaleString('ar-EG') : ''}</div></div><span className="chip">{m.status}</span></div>)}</div>
    </section>

    <section className="section card">
      <div className="section-head"><div><div className="eyebrow">RECOVERY RUNS</div><h2>Execution History</h2></div></div>
      <div className="card-list">{runs.map(r=><div className="list-row" key={r.id}><div><strong>{r.action} · {r.id}</strong><div className="muted">{new Date(r.started_at).toLocaleString('ar-EG')} · {r.summary ? JSON.stringify(r.summary) : ''}</div></div><span className="chip">{r.status}</span></div>)}</div>
    </section>

    <section className="section card"><div className="eyebrow">CONTENTOS BOUNDARY</div><h3>Do not duplicate ContentOS recovery</h3><p className="muted">The original ContentOS keeps its own native snapshot/backup/restore/recovery pipeline. Unified OS stores only the project/account bridge and its own shared-core recovery state.</p></section>
  </div>
}

function Metric({label,value}){return <div className="metric"><div className="muted">{label}</div><strong className="metric-value-wrap">{value}</strong></div>}
