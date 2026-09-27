// ContentOS Content Intelligence data-access layer (Phase G item 10 / C-040).

import { supabase } from './supabaseClient'
import { safe } from './errors'
import { buildLearningEvidence } from './intelligenceEngine'

export async function ensureLayersSeeded(workspaceId) {
  const [rows] = await safe(supabase.from('content_layer_groups').select('id').eq('workspace_id', workspaceId).limit(1))
  if (rows && rows.length > 0) return
  await safe(supabase.rpc('seed_content_layers_defaults', { p_workspace_id: workspaceId }))
}

// ---------------------------------------------------------------------------
// Layer groups + layers (admin)
// ---------------------------------------------------------------------------
export async function getLayerGroups(workspaceId) {
  return safe(supabase.from('content_layer_groups').select('*').eq('workspace_id', workspaceId).order('position'))
}

export async function getLayers(workspaceId, groupId) {
  return safe(supabase.from('content_layers').select('*').eq('workspace_id', workspaceId).eq('group_id', groupId).order('position'))
}

export async function getAllLayers(workspaceId) {
  return safe(supabase.from('content_layers').select('*').eq('workspace_id', workspaceId).order('position'))
}

export async function upsertLayerGroup(workspaceId, group) {
  if (group.id) return safe(supabase.from('content_layer_groups').update(group).eq('id', group.id).select().single())
  return safe(supabase.from('content_layer_groups').insert({ workspace_id: workspaceId, ...group }).select().single())
}
export async function deleteLayerGroup(id) {
  return safe(supabase.from('content_layer_groups').delete().eq('id', id))
}

export async function upsertLayer(workspaceId, layer) {
  if (layer.id) return safe(supabase.from('content_layers').update(layer).eq('id', layer.id).select().single())
  return safe(supabase.from('content_layers').insert({ workspace_id: workspaceId, ...layer }).select().single())
}
export async function deleteLayer(id) {
  return safe(supabase.from('content_layers').delete().eq('id', id))
}

// ---------------------------------------------------------------------------
// Tagging a publishing record with layer values
// ---------------------------------------------------------------------------
export async function getPostLayerIds(publishingRecordId) {
  const [rows, err] = await safe(supabase.from('content_publishing_layers').select('layer_id').eq('publishing_record_id', publishingRecordId))
  if (err) return [null, err]
  return [(rows || []).map(r => r.layer_id), null]
}

// Replaces the assignment for one group on one record with the given layer ids.
export async function setPostLayersForGroup(publishingRecordId, groupLayerIds, selectedLayerIds) {
  const toRemove = groupLayerIds.filter(id => !selectedLayerIds.includes(id))
  if (toRemove.length) {
    await safe(supabase.from('content_publishing_layers').delete()
      .eq('publishing_record_id', publishingRecordId).in('layer_id', toRemove))
  }
  if (selectedLayerIds.length) {
    await safe(supabase.from('content_publishing_layers')
      .upsert(selectedLayerIds.map(layer_id => ({ publishing_record_id: publishingRecordId, layer_id })),
        { onConflict: 'publishing_record_id,layer_id' }))
  }
  return [true, null]
}

// Fetch layer tags for every publishing record of an account, as a Map(recordId -> Set(layerId))
export async function getAccountLayerAssignments(accountId, recordIds) {
  if (!recordIds || recordIds.length === 0) return [new Map(), null]
  const [rows, err] = await safe(supabase.from('content_publishing_layers')
    .select('publishing_record_id, layer_id').in('publishing_record_id', recordIds))
  if (err) return [null, err]
  const map = new Map()
  ;(rows || []).forEach(r => {
    if (!map.has(r.publishing_record_id)) map.set(r.publishing_record_id, new Set())
    map.get(r.publishing_record_id).add(r.layer_id)
  })
  return [map, null]
}

// ---------------------------------------------------------------------------
// C-040 Learning Signals
// ---------------------------------------------------------------------------
export async function getLearningSignals(workspaceId, { accountId } = {}) {
  let q = supabase.from('content_learning_signals').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false })
  if (accountId) q = q.eq('account_id', accountId)
  return safe(q)
}

export async function createLearningSignalFromRecommendation(workspaceId, { accountId, platformId, contentTypeId, recommendation, entries }) {
  return safe(supabase.from('content_learning_signals').insert({
    workspace_id: workspaceId, account_id: accountId || null, platform_id: platformId || null, content_type_id: contentTypeId || null,
    title: recommendation.title, insight: recommendation.text, type: recommendation.type,
    source: 'analytics-intelligence', source_recommendation_type: recommendation.type,
    evidence: buildLearningEvidence(entries),
    blueprint_guidance: { keep: [], test: [recommendation.text], avoid: [] },
  }).select().single())
}

export async function updateLearningSignal(id, patch) {
  return safe(supabase.from('content_learning_signals')
    .update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id))
}
