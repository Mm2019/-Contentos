const CONTENTOS_SRC = '/contentos/index.html'

function waitForLoad(frame, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const check = () => {
      try {
        if (frame.contentWindow?.loadData) {
          resolve(frame.contentWindow)
          return
        }
      } catch {}
      if (Date.now() - started > timeoutMs) {
        reject(new Error('ContentOS analytics bridge timed out.'))
        return
      }
      setTimeout(check, 150)
    }
    check()
  })
}

async function withContentOSWindow(callback) {
  const frame = document.createElement('iframe')
  frame.title = 'ContentOS analytics validator'
  frame.src = CONTENTOS_SRC
  Object.assign(frame.style, { position: 'fixed', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none', border: '0' })
  document.body.appendChild(frame)
  try {
    const win = await waitForLoad(frame)
    return await callback(win)
  } finally {
    frame.remove()
  }
}

function issue(severity, code, message, meta = {}) { return { severity, code, message, ...meta } }
const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v)
const finite = (v) => typeof v === 'number' && Number.isFinite(v)

function formulaSafety(win, kpi) {
  const type = kpi?.calc?.type || 'manual'
  if (type === 'manual' || type === 'direct' || type === 'sum' || type === 'difference' || type === 'ratio' || type === 'percent' || type === 'weighted' || type === 'expression') return true
  return false
}

export async function scanContentOSAnalytics() {
  return withContentOSWindow(async (win) => {
    const loaded = await win.loadData()
    const plan = loaded?.data || {}
    const platforms = Array.isArray(plan._platforms) ? plan._platforms : []
    const accounts = Array.isArray(plan._accounts) ? plan._accounts : []
    const posts = typeof win.getAllPosts === 'function' ? win.getAllPosts(plan) : []
    const issues = []
    const checks = []

    let rawMetricDefs = 0
    let platformMetricDefs = 0
    let canonicalMetricDefs = Array.isArray(plan._canonicalMetrics) ? plan._canonicalMetrics : []
    let kpiDefs = 0
    let formulaDefs = 0
    let targetDefs = 0
    let benchmarkDefs = 0
    let analyticsEntries = 0
    let pageEntries = 0
    let entriesWithRevision = 0
    let entriesWithRecordedAt = 0
    let entriesWithSource = 0
    let entriesWithSnapshot = 0
    let entriesWithHistory = 0
    let invalidNumericValues = 0
    let scoreableKpis = 0
    let unsafeFormulaTypes = 0
    let mappedPlatformMetrics = 0
    let unmappedPlatformMetrics = 0
    let customCanonicalMetrics = 0

    const canonicalIds = new Set(canonicalMetricDefs.map(m => String(m.id)))
    const canonicalKeys = new Set(canonicalMetricDefs.map(m => String(m.key || '').trim()).filter(Boolean))

    for (const m of canonicalMetricDefs) {
      if (!m?.id || !m?.key || !m?.label) issues.push(issue('error', 'CANONICAL_METRIC_INVALID', 'Canonical metric is missing id/key/label.'))
      if (!m?.active && m?.active !== false) issues.push(issue('warning', 'CANONICAL_METRIC_ACTIVE_UNDEFINED', `Canonical metric ${m?.label || m?.id || 'unknown'} has no explicit active flag.`))
      if (m?.key && canonicalKeys.size !== canonicalMetricDefs.length) issues.push(issue('warning', 'CANONICAL_METRIC_DUPLICATE_KEY', `Duplicate canonical metric key detected: ${m.key}.`))
      if (!['count', 'duration', 'percentage', 'currency', 'ratio', 'number'].includes(m?.unit || 'count')) issues.push(issue('warning', 'CANONICAL_METRIC_UNIT_UNKNOWN', `Canonical metric ${m?.label || m?.id || 'unknown'} uses an unknown unit: ${m?.unit}.`))
      if (String(m?.id || '').startsWith('cm_')) customCanonicalMetrics += 1
    }

    for (const platform of platforms) {
      const analytics = isObject(platform?.analyticsConfig) ? platform.analyticsConfig : {}
      const metrics = Array.isArray(analytics.platformMetrics) ? analytics.platformMetrics : []
      platformMetricDefs += metrics.length
      for (const metric of metrics) {
        if (!metric?.id || !metric?.key || !metric?.label) issues.push(issue('error', 'PLATFORM_METRIC_INVALID', `Platform ${platform?.name || platform?.id || 'unknown'} has a metric missing id/key/label.`))
        const mapped = !!metric?.canonicalMetricId
        if (mapped) {
          mappedPlatformMetrics += 1
          if (!canonicalIds.has(String(metric.canonicalMetricId))) issues.push(issue('error', 'PLATFORM_METRIC_CANONICAL_MISSING', `Platform metric ${metric?.label || metric?.id || 'unknown'} references a missing canonical metric.`))
        } else {
          unmappedPlatformMetrics += 1
        }
      }
      if (analytics?.enabled !== undefined && typeof analytics.enabled !== 'boolean') issues.push(issue('error', 'PLATFORM_ANALYTICS_ENABLED_INVALID', `Platform ${platform?.name || platform?.id} has an invalid analytics enabled flag.`))
      if (analytics?.source && !['manual', 'import', 'API', 'api', 'hybrid'].includes(analytics.source)) issues.push(issue('warning', 'PLATFORM_ANALYTICS_SOURCE_UNKNOWN', `Platform ${platform?.name || platform?.id} uses unknown analytics source ${analytics.source}.`))

      for (const ct of (platform?.contentTypes || [])) {
        const raws = Array.isArray(ct?.rawMetrics) ? ct.rawMetrics : []
        rawMetricDefs += raws.length
        for (const raw of raws) {
          if (!raw?.id || !(raw?.label || raw?.name)) issues.push(issue('error', 'RAW_METRIC_INVALID', `Content Type ${ct?.name || ct?.id || 'unknown'} contains an invalid Raw Metric.`))
        }
        const kpis = Array.isArray(ct?.postKpis) ? ct.postKpis : []
        kpiDefs += kpis.length
        for (const k of kpis) {
          const calcType = k?.calc?.type || 'manual'
          if (k?.formula || calcType !== 'manual') formulaDefs += 1
          if (!formulaSafety(win, k)) unsafeFormulaTypes += 1
          if (k?.targetConfig && isObject(k.targetConfig)) {
            targetDefs += 1
            if (finite(Number(k.targetConfig.value)) && Number(k.targetConfig.value) !== 0) scoreableKpis += 1
            if (finite(Number(k.targetConfig.benchmarkValue))) benchmarkDefs += 1
            if (!['inherit', 'custom'].includes(k.targetConfig.mode || 'inherit')) issues.push(issue('error', 'KPI_TARGET_MODE_INVALID', `KPI ${k?.name || k?.id || 'unknown'} has invalid target mode.`))
            if (!['higher_better', 'lower_better'].includes(k.targetConfig.direction || 'higher_better')) issues.push(issue('error', 'KPI_DIRECTION_INVALID', `KPI ${k?.name || k?.id || 'unknown'} has invalid target direction.`))
          }
          for (const inp of (k?.inputs || [])) {
            if (inp?.metricId && !raws.some(r => String(r.id) === String(inp.metricId))) issues.push(issue('error', 'KPI_RAW_METRIC_REFERENCE_MISSING', `KPI ${k?.name || k?.id || 'unknown'} references missing Raw Metric ${inp.metricId}.`))
          }
        }
      }
    }

    if (unsafeFormulaTypes) issues.push(issue('error', 'KPI_FORMULA_TYPE_UNSUPPORTED', `${unsafeFormulaTypes} KPI definitions use unsupported formula calculation types.`))

    const analyticsMap = isObject(plan._analytics) ? plan._analytics : {}
    Object.values(analyticsMap).forEach(record => {
      for (const entry of (record?.entries || [])) {
        analyticsEntries += 1
        if (entry?.revision !== undefined) entriesWithRevision += 1
        if (entry?.recordedAt) entriesWithRecordedAt += 1
        if (entry?.source) entriesWithSource += 1
        if (isObject(entry?.definitionSnapshot)) entriesWithSnapshot += 1
        if (Array.isArray(entry?.history)) entriesWithHistory += 1
        for (const value of Object.values(entry?.values || {})) {
          if (value !== '' && value !== null && value !== undefined && value !== 0) {
            const n = Number(value)
            if (!Number.isFinite(n)) invalidNumericValues += 1
          }
        }
      }
    })

    const pageHealth = isObject(plan._pageHealth) ? plan._pageHealth : {}
    Object.values(pageHealth).forEach(record => { pageEntries += Array.isArray(record?.entries) ? record.entries.length : 0 })

    if (analyticsEntries && entriesWithRevision !== analyticsEntries) issues.push(issue('warning', 'ANALYTICS_REVISION_GAPS', `${analyticsEntries - entriesWithRevision} analytics entries are missing revision metadata.`))
    if (analyticsEntries && entriesWithRecordedAt !== analyticsEntries) issues.push(issue('warning', 'ANALYTICS_RECORDED_AT_GAPS', `${analyticsEntries - entriesWithRecordedAt} analytics entries are missing recordedAt.`))
    if (analyticsEntries && entriesWithSource !== analyticsEntries) issues.push(issue('warning', 'ANALYTICS_SOURCE_GAPS', `${analyticsEntries - entriesWithSource} analytics entries are missing source metadata.`))
    if (analyticsEntries && entriesWithSnapshot !== analyticsEntries) issues.push(issue('error', 'ANALYTICS_DEFINITION_SNAPSHOT_GAPS', `${analyticsEntries - entriesWithSnapshot} analytics entries are missing definitionSnapshot.`))
    if (analyticsEntries && entriesWithHistory !== analyticsEntries) issues.push(issue('warning', 'ANALYTICS_HISTORY_GAPS', `${analyticsEntries - entriesWithHistory} analytics entries are missing history arrays.`))
    if (invalidNumericValues) issues.push(issue('error', 'ANALYTICS_NON_NUMERIC_VALUES', `${invalidNumericValues} analytics values are not numeric where numeric values are expected.`))

    // Verify that the live formula and scoring functions exist in the original engine.
    const requiredFunctions = ['computeKpiExpression', 'computeKpiValue', 'computeAllKpis', 'evaluateKpiPerformance']
    const missingFunctions = requiredFunctions.filter(name => typeof win[name] !== 'function')
    if (missingFunctions.length) issues.push(issue('error', 'ANALYTICS_ENGINE_FUNCTIONS_MISSING', `Missing original ContentOS analytics functions: ${missingFunctions.join(', ')}.`))

    // Read-only smoke tests against the original engine.
    if (!missingFunctions.includes('computeKpiExpression')) {
      const testKpi = { inputs: [{ id: 'views', label: 'Views' }, { id: 'likes', label: 'Likes' }], formula: 'Likes/Views*100' }
      const testResult = win.computeKpiExpression(testKpi, { views: 200, likes: 40 })
      if (testResult !== 20) issues.push(issue('error', 'KPI_FORMULA_SMOKE_FAILED', `Original formula evaluator returned ${String(testResult)} for the controlled ratio smoke test.`))
    }
    if (!missingFunctions.includes('evaluateKpiPerformance')) {
      const performance = win.evaluateKpiPerformance({ targetConfig: { value: 100, direction: 'higher_better', cap: 100 } }, 120)
      if (!performance || performance.meetsTarget !== true || performance.score !== 100) issues.push(issue('error', 'KPI_SCORE_SMOKE_FAILED', 'Original KPI target/scoring evaluator failed the controlled scoring smoke test.'))
    }

    checks.push({ key: 'canonical', ok: canonicalMetricDefs.length > 0, label: `${canonicalMetricDefs.length} canonical metrics registered` })
    checks.push({ key: 'platformMetrics', ok: platformMetricDefs > 0, label: `${platformMetricDefs} platform analytics metrics defined` })
    checks.push({ key: 'rawMetrics', ok: rawMetricDefs > 0, label: `${rawMetricDefs} Raw Metrics defined` })
    checks.push({ key: 'kpis', ok: kpiDefs > 0, label: `${kpiDefs} KPI definitions` })
    checks.push({ key: 'formulas', ok: !issues.some(i => i.severity === 'error' && i.code.startsWith('KPI_FORMULA')), label: `${formulaDefs} formula-based KPIs` })
    checks.push({ key: 'targets', ok: !issues.some(i => i.severity === 'error' && i.code.startsWith('KPI_TARGET') || i.code === 'KPI_SCORE_SMOKE_FAILED'), label: `${targetDefs} KPI target configurations` })
    checks.push({ key: 'history', ok: !issues.some(i => i.severity === 'error' && i.code.startsWith('ANALYTICS_')), label: `${entriesWithSnapshot}/${analyticsEntries || 0} post analytics entries have definition snapshots` })
    checks.push({ key: 'engine', ok: missingFunctions.length === 0, label: 'Original ContentOS analytics engine functions available' })

    return {
      scannedAt: new Date().toISOString(),
      source: loaded?.source || 'unknown',
      updatedAt: loaded?.updatedAt || null,
      counts: {
        platforms: platforms.length,
        accounts: accounts.length,
        canonicalMetricDefs: canonicalMetricDefs.length,
        customCanonicalMetrics,
        platformMetricDefs,
        mappedPlatformMetrics,
        unmappedPlatformMetrics,
        rawMetricDefs,
        kpiDefs,
        formulaDefs,
        targetDefs,
        scoreableKpis,
        benchmarkDefs,
        posts: posts.length,
        analyticsEntries,
        pageEntries,
        entriesWithRevision,
        entriesWithRecordedAt,
        entriesWithSource,
        entriesWithSnapshot,
        entriesWithHistory,
        invalidNumericValues,
      },
      checks,
      issues,
    }
  })
}
