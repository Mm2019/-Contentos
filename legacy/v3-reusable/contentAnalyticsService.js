// ContentOS analytics data-access layer (Phase G, P0 slice).
// Reuses the same inheritance-resolution pattern as contentService.js
// (global -> platform -> content_type -> account) for raw metrics and KPI
// definitions, then delegates the actual math to kpiEngine.js (ported from
// the original ContentOS formula engine).

import { supabase } from './supabaseClient'
import { safe } from './errors'
import { computeAllKpis } from './kpiEngine'

async function fetchScoped(table, workspaceId, scopes) {
  const orClauses = scopes.map(s =>
    s.scope_id ? `and(scope_type.eq.${s.scope_type},scope_id.eq.${s.scope_id})`
                : `and(scope_type.eq.${s.scope_type},scope_id.is.null)`
  ).join(',')
  return safe(supabase.from(table).select('*').eq('workspace_id', workspaceId).or(orClauses).order('position'))
}

function mergeByKey(rowsInPrecedenceOrder, keyFn) {
  const map = new Map()
  for (const rows of rowsInPrecedenceOrder) {
    for (const row of rows || []) map.set(keyFn(row), { ...row })
  }
  return [...map.values()].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

export async function ensureAnalyticsSeeded(workspaceId) {
  const [rows] = await safe(supabase.from('content_raw_metrics').select('id').eq('workspace_id', workspaceId).limit(1))
  if (rows && rows.length > 0) return
  await safe(supabase.rpc('seed_content_analytics_defaults', { p_workspace_id: workspaceId }))
}

// Global -> Platform -> Content Type -> Account, same precedence as
// contentService.resolveEffectiveConfig — read-only merge, never mutates parents.
export async function resolveEffectiveMetricsAndKpis(workspaceId, { platformId, contentTypeId, accountId }) {
  const scopes = [
    { scope_type: 'global', scope_id: null },
    { scope_type: 'platform', scope_id: platformId },
    { scope_type: 'content_type', scope_id: contentTypeId },
    { scope_type: 'account', scope_id: accountId },
  ].filter(s => s.scope_type === 'global' || s.scope_id)

  const [metricRows] = await fetchScoped('content_raw_metrics', workspaceId, scopes)
  const [kpiRows] = await fetchScoped('content_kpi_defs', workspaceId, scopes)

  const byScope = (rows, type) => (rows || []).filter(r => r.scope_type === type)
  const order = (rows) => [byScope(rows, 'global'), byScope(rows, 'platform'), byScope(rows, 'content_type'), byScope(rows, 'account')]

  return {
    rawMetrics: mergeByKey(order(metricRows), r => r.key),
    kpiDefs: mergeByKey(order(kpiRows), r => r.key),
  }
}

// ---------------------------------------------------------------------------
// Admin CRUD (global scope from the UI today; same functions work for any
// scope if a per-account override screen is built later)
// ---------------------------------------------------------------------------
export async function upsertRawMetric(workspaceId, scopeType, scopeId, metric) {
  return safe(supabase.from('content_raw_metrics')
    .upsert({ workspace_id: workspaceId, scope_type: scopeType, scope_id: scopeId, ...metric },
      { onConflict: 'workspace_id,scope_type,scope_id,key' }).select().single())
}
export async function deleteRawMetric(id) {
  return safe(supabase.from('content_raw_metrics').delete().eq('id', id))
}
export async function upsertKpiDef(workspaceId, scopeType, scopeId, kpi) {
  return safe(supabase.from('content_kpi_defs')
    .upsert({ workspace_id: workspaceId, scope_type: scopeType, scope_id: scopeId, ...kpi },
      { onConflict: 'workspace_id,scope_type,scope_id,key' }).select().single())
}
export async function deleteKpiDef(id) {
  return safe(supabase.from('content_kpi_defs').delete().eq('id', id))
}

// ---------------------------------------------------------------------------
// C-028 entry, C-030 history, C-031 snapshot
// ---------------------------------------------------------------------------
export async function getEntries(publishingRecordId) {
  return safe(supabase.from('content_post_analytics_entries')
    .select('*').eq('publishing_record_id', publishingRecordId).order('entry_date'))
}

export async function saveEntry(workspaceId, publishingRecordId, { entryDate, values, source, notes, kpiDefs }) {
  const computed = computeAllKpis(kpiDefs, values)
  return safe(supabase.from('content_post_analytics_entries')
    .upsert({
      workspace_id: workspaceId, publishing_record_id: publishingRecordId, entry_date: entryDate,
      values, computed, kpi_defs_snapshot: kpiDefs, source: source || 'manual', notes: notes || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'publishing_record_id,entry_date' }).select().single())
}

// Account-wide rollup across all publishing records + all entries — powers
// the account analytics dashboard (mirrors KpiSystemRollup from the
// original app, scoped to one account instead of the whole workspace).
export async function getAccountRollup(workspaceId, accountId) {
  const [records, recErr] = await safe(supabase.from('content_publishing_records')
    .select('id, content_master(title), content_types(name_ar)')
    .eq('workspace_id', workspaceId).eq('account_id', accountId))
  if (recErr) return [null, recErr]
  const ids = (records || []).map(r => r.id)
  if (ids.length === 0) return [{ records: [], entries: [] }, null]

  const [entries, entErr] = await safe(supabase.from('content_post_analytics_entries')
    .select('*').in('publishing_record_id', ids).order('entry_date'))
  if (entErr) return [null, entErr]

  const byRecord = new Map(records.map(r => [r.id, r]))
  const enriched = (entries || []).map(e => ({ ...e, record: byRecord.get(e.publishing_record_id) }))
  return [{ records, entries: enriched }, null]
}
