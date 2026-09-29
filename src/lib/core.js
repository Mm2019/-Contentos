import { supabase } from './supabase'

const LOCAL_KEY = 'uos_core_cache_v1'

function now() { return new Date().toISOString() }
function readCache() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') } catch { return {} } }
function writeCache(value) { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(value)) } catch {} }

export async function ensureWorkspace(user) {
  if (!user) return null
  if (supabase) {
    // This RPC returns a plain UUID (the workspace id), not a row.
    const { data: workspaceId, error } = await supabase.rpc('uos_ensure_personal_workspace', { p_name: `${user.email || 'Personal'} OS` })
    if (!error && workspaceId) {
      const { data: ws, error: wsErr } = await supabase.from('uos_workspaces').select('*').eq('id', workspaceId).single()
      if (!wsErr && ws) return ws
      // Fallback so callers relying on workspace.id never see "undefined" again.
      return { id: workspaceId, name: `${user.email || 'Personal'} OS`, base_currency: 'EGP' }
    }
  }
  const cache = readCache()
  cache.workspace ??= { id: `local-${user.id}`, name: `${user.email || 'Personal'} OS`, base_currency: 'EGP' }
  writeCache(cache)
  return cache.workspace
}

async function query(table, op, payload = {}, filters = {}) {
  if (!supabase) throw new Error('Supabase is not configured')
  let q = supabase.from(table)
  if (op === 'select') q = q.select(payload || '*')
  if (op === 'insert') q = q.insert(payload).select().single()
  if (op === 'update') q = q.update(payload).select().single()
  if (op === 'delete') q = q.delete()
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
  return q
}

export async function listEntities(table, workspaceId, order = 'created_at') {
  if (supabase && !String(workspaceId).startsWith('local-')) {
    const { data, error } = await supabase.from(table).select('*').eq('workspace_id', workspaceId).order(order, { ascending: false })
    if (error) throw error
    return data || []
  }
  const c = readCache(); return c[table]?.filter(x => x.workspace_id === workspaceId) || []
}

export async function createEntity(table, values) {
  const record = { ...values, created_at: now(), updated_at: now() }
  if (supabase && !String(values.workspace_id).startsWith('local-')) {
    const { data, error } = await supabase.from(table).insert(record).select().single()
    if (error) throw error
    return data
  }
  const c = readCache(); c[table] ??= []
  const created = { ...record, id: crypto.randomUUID() }
  c[table].unshift(created); writeCache(c); return created
}

export async function updateEntity(table, id, values) {
  if (supabase && !String(id).startsWith('local-')) {
    const { data, error } = await supabase.from(table).update({ ...values, updated_at: now() }).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  const c = readCache(); c[table] = (c[table] || []).map(x => x.id === id ? { ...x, ...values, updated_at: now() } : x); writeCache(c)
  return c[table].find(x => x.id === id)
}

export async function deleteEntity(table, id) {
  if (supabase && !String(id).startsWith('local-')) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return
  }
  const c = readCache(); c[table] = (c[table] || []).filter(x => x.id !== id); writeCache(c)
}

export { query }

export async function logRecurringPayment(recurringId, idempotencyKey = crypto.randomUUID()) {
  if (!supabase) throw new Error('Supabase is required for native recurring payment action')
  const { data, error } = await supabase.rpc('uos_log_recurring_payment', {
    p_recurring_id: recurringId,
    p_idempotency_key: idempotencyKey,
  })
  if (error) throw error
  return data
}

export async function rpc(name, params = {}) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.rpc(name, params)
  if (error) throw error
  return data
}


export async function listTableRecords(table, { workspaceId = null, workspaceScoped = true, order = 'created_at' } = {}) {
  if (supabase) {
    let q = supabase.from(table).select('*').order(order in ['created_at','updated_at','occurred_at','created_at'] ? order : 'created_at', { ascending: false })
    if (workspaceScoped && workspaceId) q = q.eq('workspace_id', workspaceId)
    const { data, error } = await q
    if (error) throw error
    return data || []
  }
  const c = readCache()
  const rows = c[table] || []
  return workspaceScoped && workspaceId ? rows.filter(x => x.workspace_id === workspaceId) : rows
}

export async function createTableRecord(table, values, { workspaceId = null, workspaceScoped = true } = {}) {
  const payload = workspaceScoped && workspaceId && values.workspace_id == null ? { ...values, workspace_id: workspaceId } : { ...values }
  if (supabase) {
    const { data, error } = await supabase.from(table).insert(payload).select().single()
    if (error) throw error
    return data
  }
  const c = readCache(); c[table] ??= []
  const created = { ...payload, id: payload.id || crypto.randomUUID() }
  if (created.created_at == null) created.created_at = now()
  c[table].unshift(created); writeCache(c); return created
}

export async function updateTableRecord(table, id, values) {
  if (supabase) {
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  const c = readCache(); c[table] = (c[table] || []).map(x => x.id === id ? { ...x, ...values } : x); writeCache(c)
  return c[table].find(x => x.id === id)
}

export async function deleteTableRecord(table, id) {
  if (supabase) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return
  }
  const c = readCache(); c[table] = (c[table] || []).filter(x => x.id !== id); writeCache(c)
}
