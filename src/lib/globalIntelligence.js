import { listEntities, createEntity, updateEntity } from './core'
import { supabase } from './supabase'
import { scanContentOSIntelligence } from './contentosIntelligenceBridge'

const DAY_MS = 86400000
const BUSINESS_PROFILES = new Set([
  'App / SaaS', 'Marketplace', 'E-commerce', 'Delivery / Logistics', 'Service Business',
  'Digital Product', 'Content / Creator', 'Blog / SEO', 'Affiliate', 'Hybrid'
])

const isoDate = (d) => new Date(d).toISOString()
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY_MS)
const inRange = (value, start, end) => { const t = new Date(value).getTime(); return Number.isFinite(t) && t >= start.getTime() && t < end.getTime() }
const money = (n) => Number(n || 0)
const pct = (n) => Math.round(n * 100)

function sumByType(rows, types, start, end, projectIds = null) {
  return rows.filter(row => {
    if (!types.includes(row.type)) return false
    if (!inRange(row.occurred_at, start, end)) return false
    if (projectIds && !projectIds.has(row.project_id)) return false
    return true
  }).reduce((sum, row) => sum + money(row.amount), 0)
}

function budgetSpent(budget, transactions) {
  const matched = transactions.filter(tx => {
    if (!inRange(tx.occurred_at, new Date(`${budget.period_start}T00:00:00`), addDays(new Date(`${budget.period_end}T00:00:00`), 1))) return false
    if (tx.type !== 'expense' && tx.type !== 'debt_payment') return false
    if (budget.project_id && tx.project_id !== budget.project_id) return false
    if (budget.category_id && tx.category_id !== budget.category_id) return false
    return true
  })
  return matched.reduce((sum, tx) => sum + money(tx.amount), 0)
}

function fingerprint(item) {
  const raw = JSON.stringify({ kind: item.kind, title: item.title, severity: item.severity, evidence: item.evidence || [] })
  let h = 2166136261
  for (let i = 0; i < raw.length; i += 1) { h ^= raw.charCodeAt(i); h = Math.imul(h, 16777619) }
  return `gi-${(h >>> 0).toString(16)}`
}

function finding({ kind, severity = 'info', title, summary, evidence = [], sourceEntities = [], confidence = 'high', projectId = null }) {
  const item = { kind, severity, title, summary, evidence, sourceEntities, confidence, projectId, detectedAt: new Date().toISOString() }
  return { ...item, fingerprint: fingerprint(item) }
}

export async function collectGlobalIntelligence(workspaceId, { includeContentOS = true } = {}) {
  const [projects, transactions, budgets, tasks, goals, inventory, orders, returns] = await Promise.all([
    listEntities('uos_projects', workspaceId),
    listEntities('uos_fin_transactions', workspaceId, 'occurred_at'),
    listEntities('uos_fin_budgets', workspaceId, 'period_start'),
    listEntities('uos_tasks', workspaceId, 'due_date'),
    listEntities('uos_goals', workspaceId, 'due_date'),
    listEntities('uos_commerce_inventory', workspaceId),
    listEntities('uos_commerce_orders', workspaceId, 'created_at'),
    listEntities('uos_commerce_returns', workspaceId, 'created_at'),
  ])

  const now = new Date()
  const currentStart = addDays(startOfDay(now), -30)
  const previousStart = addDays(currentStart, -30)
  const currentEnd = addDays(startOfDay(now), 1)
  const businessProjectIds = new Set(projects.filter(p => BUSINESS_PROFILES.has(p.project_profile)).map(p => p.id))

  const currentSpend = sumByType(transactions, ['expense', 'debt_payment'], currentStart, currentEnd)
  const previousSpend = sumByType(transactions, ['expense', 'debt_payment'], previousStart, currentStart)
  const spendIncrease = previousSpend > 0 ? (currentSpend - previousSpend) / previousSpend : null

  const currentRevenue = businessProjectIds.size ? sumByType(transactions, ['income', 'refund', 'debt_received'], currentStart, currentEnd, businessProjectIds) : 0
  const previousRevenue = businessProjectIds.size ? sumByType(transactions, ['income', 'refund', 'debt_received'], previousStart, currentStart, businessProjectIds) : 0
  const revenueChange = previousRevenue > 0 ? (currentRevenue - previousRevenue) / previousRevenue : null

  const openBudgetAlerts = budgets.map(b => {
    const amount = money(b.amount)
    const spent = budgetSpent(b, transactions)
    return { ...b, spent, ratio: amount > 0 ? spent / amount : 0 }
  }).filter(b => b.amount > 0 && b.ratio >= 0.8 && new Date(b.period_start) <= now && new Date(`${b.period_end}T23:59:59`) >= now)

  const signals = []
  if (spendIncrease !== null && spendIncrease >= 0.2) {
    signals.push(finding({
      kind: 'finance_spending_increase', severity: spendIncrease >= 0.5 ? 'high' : 'medium',
      title: 'Spending increased',
      summary: `Finance spending is up ${pct(spendIncrease)}% versus the previous 30-day period.`,
      evidence: [
        { metric: 'currentSpend30d', value: currentSpend },
        { metric: 'previousSpend30d', value: previousSpend },
        { metric: 'changePercent', value: pct(spendIncrease) },
      ],
      sourceEntities: ['uos_fin_transactions'], confidence: 'high'
    }))
  }

  openBudgetAlerts.forEach(b => {
    signals.push(finding({
      kind: 'project_budget_near_limit', severity: b.ratio >= 1 ? 'critical' : 'high', projectId: b.project_id,
      title: 'Budget near limit',
      summary: `A project/category budget has consumed ${pct(b.ratio)}% of its configured period amount.`,
      evidence: [
        { budgetId: b.id, amount: b.amount, spent: b.spent, ratioPercent: pct(b.ratio) },
      ], sourceEntities: ['uos_fin_budgets', 'uos_fin_transactions'], confidence: 'high'
    }))
  })

  if (businessProjectIds.size && revenueChange !== null && revenueChange <= -0.2) {
    signals.push(finding({
      kind: 'business_revenue_decrease', severity: revenueChange <= -0.5 ? 'high' : 'medium',
      title: 'Business-linked revenue decreased',
      summary: `Revenue linked to business profiles is down ${Math.abs(pct(revenueChange))}% versus the previous 30-day period.`,
      evidence: [
        { metric: 'currentRevenue30d', value: currentRevenue },
        { metric: 'previousRevenue30d', value: previousRevenue },
        { metric: 'changePercent', value: pct(revenueChange) },
        { metric: 'businessProjectCount', value: businessProjectIds.size },
      ], sourceEntities: ['uos_projects', 'uos_fin_transactions'], confidence: 'medium'
    }))
  }

  const hasSpendIncrease = signals.some(s => s.kind === 'finance_spending_increase')
  const hasBudgetAlert = signals.some(s => s.kind === 'project_budget_near_limit')
  const hasRevenueDecrease = signals.some(s => s.kind === 'business_revenue_decrease')
  if (hasSpendIncrease && hasBudgetAlert && hasRevenueDecrease) {
    signals.push(finding({
      kind: 'global_finance_project_alert', severity: 'critical',
      title: 'Cross-system financial pressure detected',
      summary: 'Spending increased, at least one active budget is near its limit, and business-linked revenue decreased. The alert is based only on measured workspace data.',
      evidence: signals.filter(s => ['finance_spending_increase','project_budget_near_limit','business_revenue_decrease'].includes(s.kind)).map(s => ({ fingerprint: s.fingerprint, kind: s.kind })),
      sourceEntities: ['uos_fin_transactions', 'uos_fin_budgets', 'uos_projects'], confidence: 'high'
    }))
  }

  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) < startOfDay(now))
  if (overdueTasks.length >= 5) {
    signals.push(finding({
      kind: 'execution_overdue_load', severity: overdueTasks.length >= 10 ? 'high' : 'medium',
      title: 'Execution backlog needs attention',
      summary: `${overdueTasks.length} open tasks are past their due date.`,
      evidence: [{ metric: 'overdueTasks', value: overdueTasks.length }, { taskIds: overdueTasks.slice(0, 20).map(t => t.id) }],
      sourceEntities: ['uos_tasks'], confidence: 'high'
    }))
  }

  const delayedGoals = goals.filter(g => g.status === 'active' && g.due_date && new Date(g.due_date) < startOfDay(now) && Number(g.current_value || 0) < Number(g.target_value || Infinity))
  if (delayedGoals.length) {
    signals.push(finding({
      kind: 'goals_behind', severity: delayedGoals.length >= 3 ? 'high' : 'medium',
      title: 'Goals are behind schedule',
      summary: `${delayedGoals.length} active goals have passed due dates without reaching their configured target values.`,
      evidence: [{ goalIds: delayedGoals.slice(0, 20).map(g => g.id) }], sourceEntities: ['uos_goals'], confidence: 'high'
    }))
  }

  const criticalInventory = inventory.filter(i => ['critical', 'out'].includes(i.stock_status) || Number(i.reorder_point || 0) >= Number(i.on_hand || 0))
  if (criticalInventory.length) {
    signals.push(finding({
      kind: 'commerce_inventory_risk', severity: criticalInventory.some(i => i.stock_status === 'out') ? 'high' : 'medium',
      title: 'Commerce inventory needs attention',
      summary: `${criticalInventory.length} inventory records are at or below their configured reorder threshold.`,
      evidence: [{ inventoryIds: criticalInventory.slice(0, 30).map(i => i.id) }], sourceEntities: ['uos_commerce_inventory'], confidence: 'high'
    }))
  }

  const returnBacklog = returns.filter(r => ['requested', 'approved', 'received'].includes(r.status))
  if (returnBacklog.length >= 5) {
    signals.push(finding({
      kind: 'commerce_returns_backlog', severity: returnBacklog.length >= 10 ? 'high' : 'medium',
      title: 'Returns backlog is building',
      summary: `${returnBacklog.length} returns are still in an active processing state.`,
      evidence: [{ returnIds: returnBacklog.slice(0, 30).map(r => r.id) }], sourceEntities: ['uos_commerce_returns'], confidence: 'high'
    }))
  }

  const pendingOrders = orders.filter(o => ['pending','confirmed','processing','packed'].includes(o.status))
  if (pendingOrders.length >= 10) {
    signals.push(finding({
      kind: 'commerce_order_backlog', severity: pendingOrders.length >= 25 ? 'high' : 'medium',
      title: 'Commerce orders are accumulating',
      summary: `${pendingOrders.length} orders are in active fulfillment states.`,
      evidence: [{ orderIds: pendingOrders.slice(0, 30).map(o => o.id) }], sourceEntities: ['uos_commerce_orders'], confidence: 'high'
    }))
  }

  let content = null
  if (includeContentOS) {
    try {
      const scan = await scanContentOSIntelligence()
      content = {
        source: 'Existing ContentOS intelligence engine',
        trend: scan?.report?.trend || null,
        recommendations: scan?.report?.recommendations || [],
        anomalies: scan?.report?.anomalies || [],
        counts: scan?.counts || null,
        issues: scan?.issues || [],
      }
      if (content.trend === 'down') {
        signals.push(finding({
          kind: 'content_performance_down', severity: 'medium',
          title: 'ContentOS reports a downward performance trend',
          summary: 'The existing ContentOS intelligence engine reports a downward analytics trend. Details are sourced from ContentOS and are not recomputed in Unified OS.',
          evidence: [
            { source: 'ContentOS', trend: content.trend },
            { recommendations: content.recommendations.slice(0, 5).map(r => ({ type: r?.type, title: r?.title })) },
            { anomalies: content.anomalies.slice(0, 5) },
          ], sourceEntities: ['Existing ContentOS analytics/intelligence'], confidence: 'high'
        }))
      }
    } catch (error) {
      content = { source: 'Existing ContentOS intelligence engine', unavailable: true, error: error?.message || String(error) }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    workspaceId,
    meta: {
      currentSpend30d: currentSpend,
      previousSpend30d: previousSpend,
      spendingChangePercent: spendIncrease === null ? null : pct(spendIncrease),
      businessRevenue30d: currentRevenue,
      previousBusinessRevenue30d: previousRevenue,
      businessRevenueChangePercent: revenueChange === null ? null : pct(revenueChange),
      openBudgetAlerts: openBudgetAlerts.length,
      overdueTasks: overdueTasks.length,
      delayedGoals: delayedGoals.length,
      criticalInventory: criticalInventory.length,
      pendingOrders: pendingOrders.length,
      activeReturns: returnBacklog.length,
    },
    signals,
    content,
  }
}

export async function listPersistedIntelligence(workspaceId) {
  return listEntities('uos_global_intelligence_events', workspaceId, 'detected_at')
}

export async function persistIntelligenceFindings(workspaceId, findings) {
  const existing = await listPersistedIntelligence(workspaceId)
  const existingByFingerprint = new Map(existing.map(x => [x.fingerprint, x]))
  const saved = []
  for (const item of findings) {
    const existingItem = existingByFingerprint.get(item.fingerprint)
    if (existingItem) { saved.push(existingItem); continue }
    if (supabase && !String(workspaceId).startsWith('local-')) {
      const { data, error } = await supabase.from('uos_global_intelligence_events').upsert({
        workspace_id: workspaceId, project_id: item.projectId, kind: item.kind, severity: item.severity,
        title: item.title, summary: item.summary, confidence: item.confidence, status: 'open',
        evidence: item.evidence, source_entities: item.sourceEntities, fingerprint: item.fingerprint,
        detected_at: item.detectedAt,
      }, { onConflict: 'workspace_id,fingerprint' }).select().single()
      if (error) throw error
      saved.push(data)
    } else {
      saved.push(await createEntity('uos_global_intelligence_events', {
        workspace_id: workspaceId, project_id: item.projectId, kind: item.kind, severity: item.severity,
        title: item.title, summary: item.summary, confidence: item.confidence, status: 'open',
        evidence: item.evidence, source_entities: item.sourceEntities, fingerprint: item.fingerprint,
        detected_at: item.detectedAt,
      }))
    }
  }
  return saved
}

export async function updateIntelligenceStatus(id, status) {
  return updateEntity('uos_global_intelligence_events', id, { status })
}
