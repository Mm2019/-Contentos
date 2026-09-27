import { supabase } from './supabase'
import { createEntity, deleteEntity, listEntities } from './core'

const LOCAL_KEY = 'uos_contentos_bridge_v1'

function localRead() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') } catch { return {} } }
function localWrite(v) { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(v)) } catch {} }

export async function loadExistingContentOSPlan() {
  if (supabase) {
    const { data, error } = await supabase.from('content_os_data').select('data,updated_at').eq('id', 1).maybeSingle()
    if (!error && data?.data) return { plan: data.data, source: 'content_os_data', updatedAt: data.updated_at || null }
  }
  try {
    const raw = localStorage.getItem('cos_v8')
    if (raw) return { plan: JSON.parse(raw), source: 'localStorage', updatedAt: null }
  } catch {}
  return { plan: null, source: 'unavailable', updatedAt: null }
}

export async function listExistingContentAccounts() {
  const { plan, source, updatedAt } = await loadExistingContentOSPlan()
  const accounts = Array.isArray(plan?._accounts) ? plan._accounts : []
  return { accounts, source, updatedAt }
}

export async function listProjectContentLinks(workspaceId, projectId) {
  const rows = await listEntities('uos_project_content_accounts', workspaceId)
  return rows.filter(r => r.project_id === projectId)
}

export async function linkProjectContentAccount(workspaceId, projectId, contentAccountId) {
  const existing = await listProjectContentLinks(workspaceId, projectId)
  if (existing.some(x => x.content_account_id === contentAccountId)) return existing.find(x => x.content_account_id === contentAccountId)
  return createEntity('uos_project_content_accounts', {
    workspace_id: workspaceId,
    project_id: projectId,
    content_account_id: contentAccountId,
    source_table: 'content_os_data',
    source_path: `_accounts[id=${contentAccountId}]`,
    active: true,
  })
}

export async function unlinkProjectContentAccount(id) {
  return deleteEntity('uos_project_content_accounts', id)
}
