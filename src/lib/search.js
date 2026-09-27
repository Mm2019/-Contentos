import { supabase } from './supabase'
import { listEntities } from './core'

const SEARCH_SOURCES = [
  { table: 'uos_projects', label: 'Project', title: 'name', route: (r) => `/projects/${r.id}` },
  { table: 'uos_tasks', label: 'Task', title: 'title', route: () => '/tasks' },
  { table: 'uos_goals', label: 'Goal', title: 'title', route: () => '/goals' },
  { table: 'uos_events', label: 'Event', title: 'title', route: () => '/calendar' },
  { table: 'uos_resources', label: 'Resource', title: 'title', route: () => '/resources' },
  { table: 'uos_notes', label: 'Note', title: 'title', route: () => '/notes' },
  { table: 'uos_decisions', label: 'Decision', title: 'title', route: () => '/decisions' },
  { table: 'uos_reviews', label: 'Review', title: 'review_type', route: () => '/reviews' },
  { table: 'uos_fin_accounts', label: 'Account', title: 'name', route: () => '/finance' },
  { table: 'uos_fin_transactions', label: 'Transaction', title: 'description', route: () => '/finance' },
]

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase()
}

export async function globalSearch(workspaceId, query) {
  const term = normalize(query)
  if (!workspaceId || !term) return []

  if (supabase && !String(workspaceId).startsWith('local-')) {
    const results = await Promise.allSettled(
      SEARCH_SOURCES.map(async (source) => {
        const { data, error } = await supabase
          .from(source.table)
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) throw error
        return { source, rows: data || [] }
      }),
    )
    return results.flatMap((r) => {
      if (r.status !== 'fulfilled') return []
      const { source, rows } = r.value
      return rows
        .filter((row) => {
          const values = [row[source.title], row.status, row.description, row.project_profile, row.type]
          return values.some((v) => normalize(v).includes(term))
        })
        .slice(0, 12)
        .map((row) => ({ id: row.id, label: source.label, title: row[source.title] || row.name || source.label, meta: row.status || row.type || '', route: source.route(row) }))
    }).slice(0, 30)
  }

  const resultSets = await Promise.all(
    SEARCH_SOURCES.map(async (source) => {
      const rows = await listEntities(source.table, workspaceId)
      return { source, rows }
    }),
  )
  return resultSets.flatMap(({ source, rows }) => rows
    .filter((row) => [row[source.title], row.status, row.description, row.project_profile, row.type].some((v) => normalize(v).includes(term)))
    .slice(0, 12)
    .map((row) => ({ id: row.id, label: source.label, title: row[source.title] || row.name || source.label, meta: row.status || row.type || '', route: source.route(row) })))
    .slice(0, 30)
}
