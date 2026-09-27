// Ported from ContentOS_guarded/index.html: analyticsIntelligenceReport()
// and the ranking logic inside KpiLayerIntelligence(). Same statistics
// (recent-vs-previous trend, per-KPI weak/strong, z-score anomaly
// detection, layer-value ranking) — adapted to work off flat arrays of
// content_post_analytics_entries rows instead of ContentOS's `plan` blob.
// No unsupported AI conclusions (C-041): every recommendation here is a
// direct, inspectable function of the numbers, not a model's guess.

import { parseAnalyticsNum, kpiEntryScore } from './kpiEngine'

function avgOf(list) { return list.reduce((a, b) => a + b, 0) / list.length }

// entries: content_post_analytics_entries rows, each with
// { entry_date, values, computed, kpi_defs_snapshot, record: {...} }
export function buildIntelligenceReport(entries) {
  const safeEntries = Array.isArray(entries) ? entries : []
  const scoreRows = safeEntries.map(e => ({ e, score: kpiEntryScore(e.computed) })).filter(x => x.score != null)
  const scores = scoreRows.map(x => x.score)
  const avg = scores.length ? avgOf(scores) : null

  const sorted = safeEntries.slice().sort((a, b) => String(a.entry_date || '').localeCompare(String(b.entry_date || '')))
  const recent = sorted.slice(-7), previous = sorted.slice(-14, -7)
  const avgSet = (list) => {
    const v = list.map(e => kpiEntryScore(e.computed)).filter(x => x != null)
    return v.length ? avgOf(v) : null
  }
  const recentAvg = avgSet(recent), previousAvg = avgSet(previous)
  const trend = recentAvg != null && previousAvg != null
    ? (recentAvg > previousAvg * 1.05 ? 'up' : recentAvg < previousAvg * 0.95 ? 'down' : 'flat')
    : 'unknown'

  // per-raw-metric recent vs previous
  const metricKeys = new Set()
  safeEntries.forEach(e => Object.keys(e.values || {}).forEach(k => metricKeys.add(k)))
  const metrics = [...metricKeys].map(key => {
    const vals = safeEntries.map(e => parseAnalyticsNum(e.values?.[key])).filter(Number.isFinite)
    const a = vals.length ? avgOf(vals) : null
    const rr = recent.map(e => parseAnalyticsNum(e.values?.[key])).filter(Number.isFinite)
    const pp = previous.map(e => parseAnalyticsNum(e.values?.[key])).filter(Number.isFinite)
    const ra = rr.length ? avgOf(rr) : null, pa = pp.length ? avgOf(pp) : null
    const change = ra != null && pa != null && pa !== 0 ? (ra - pa) / Math.abs(pa) * 100 : null
    return { key, avg: a, recent: ra, previous: pa, change }
  }).filter(x => x.avg != null).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))

  // per-KPI averages (name resolved from each entry's own frozen snapshot —
  // never from current KPI defs, matching the snapshot-immutability rule)
  const kpiNameByKey = new Map()
  safeEntries.forEach(e => (e.kpi_defs_snapshot || []).forEach(k => {
    if (!kpiNameByKey.has(k.key)) kpiNameByKey.set(k.key, k.name_ar)
  }))
  const kpiMap = new Map()
  safeEntries.forEach(e => Object.entries(e.computed || {}).forEach(([key, v]) => {
    if (typeof v === 'number' && Number.isFinite(v)) {
      const x = kpiMap.get(key) || { key, name: kpiNameByKey.get(key) || key, values: [] }
      x.values.push(v); kpiMap.set(key, x)
    }
  }))
  const kpis = [...kpiMap.values()].map(x => ({ ...x, avg: avgOf(x.values) })).sort((a, b) => a.avg - b.avg)
  const weak = kpis.slice(0, 3), strong = kpis.slice(-3).reverse()

  // anomalies — z-score >= 2, needs at least 5 data points (same threshold as original)
  const anomalies = []
  scoreRows.forEach(({ e, score }) => {
    if (scores.length < 5) return
    const mean = avg ?? 0
    const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(scores.length - 1, 1)
    const sd = Math.sqrt(variance)
    if (sd > 0 && Math.abs(score - mean) >= 2 * sd) {
      anomalies.push({ date: e.entry_date, score, type: score > mean ? 'positive' : 'negative', title: e.record?.content_master?.title || 'محتوى' })
    }
  })

  const recommendations = []
  if (trend === 'down') recommendations.push({ type: 'trend', title: 'الأداء العام يتراجع', text: 'راجع آخر 7 قياسات مقابل الفترة السابقة، وكرر عناصر المحتوى التي حافظت على أداء أعلى قبل التراجع.' })
  if (trend === 'up') recommendations.push({ type: 'trend', title: 'الأداء العام يتحسن', text: 'حافظ على الأنماط التي ظهرت في القياسات الأخيرة ووسّع اختبارها تدريجيًا بدل تغيير الاستراتيجية بالكامل.' })
  weak.forEach(k => recommendations.push({ type: 'weak', title: `KPI يحتاج تحسينًا: ${k.name}`, text: 'حدّد أي مرحلة أو نوع محتوى يرتبط بهذه القيمة المنخفضة، ثم اختبر تعديلًا واحدًا قابلًا للقياس بدل عدة تغييرات في وقت واحد.' }))
  strong.forEach(k => { if (recommendations.length < 5) recommendations.push({ type: 'strong', title: `نقطة قوة: ${k.name}`, text: 'اعتبر هذه الإشارة مرشحًا لإعادة الاستخدام أو التوسّع، مع التحقق من أنها لا تعتمد على عينة صغيرة جدًا.' }) })
  anomalies.slice(0, 3).forEach(a => recommendations.push({
    type: 'anomaly', title: `إشارة شاذة في ${a.date}`,
    text: a.type === 'positive' ? 'هناك أداء أعلى بكثير من المعتاد؛ افحص خصائص المنشور لمعرفة ما يمكن تكراره.' : 'هناك هبوط غير معتاد؛ راجع توقيت النشر، الصيغة، والقياسات الخام قبل اتخاذ قرار.',
  }))

  return { count: safeEntries.length, avg, recentAvg, previousAvg, trend, metrics, weak, strong, anomalies, recommendations: recommendations.slice(0, 8) }
}

// layers: [{id, name_ar}] within one group
// entries: analytics entries (each has publishing_record_id, computed, values)
// assignmentsByRecordId: Map(publishing_record_id -> Set(layer_id))
// metricKpiKey: optional — rank by one specific KPI's computed value instead of the average score
export function rankLayersByPerformance(layers, entries, assignmentsByRecordId, metricKpiKey) {
  const scoreFor = (e) => {
    if (metricKpiKey) { const v = e.computed?.[metricKpiKey]; return typeof v === 'number' ? v : null }
    return kpiEntryScore(e.computed)
  }
  return layers.map(layer => {
    const es = entries.filter(e => assignmentsByRecordId.get(e.publishing_record_id)?.has(layer.id))
    const scores = es.map(scoreFor).filter(v => v != null)
    const views = es.reduce((s, e) => s + parseAnalyticsNum(e.values?.views), 0)
    return { ...layer, count: es.length, avg: scores.length ? avgOf(scores) : null, views }
  }).filter(x => x.count > 0).sort((a, b) => (b.avg ?? -Infinity) - (a.avg ?? -Infinity))
}

// Every learning signal must carry evidence (C-040) — built from the actual
// entries behind a recommendation, never invented.
export function buildLearningEvidence(entries) {
  return (entries || []).slice(-8).map(e => ({
    publishingRecordId: e.publishing_record_id, entryDate: e.entry_date, score: kpiEntryScore(e.computed),
  })).filter(x => x.publishingRecordId)
}
