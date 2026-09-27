// KPI formula + scoring engine.
// Ported near-verbatim from the original ContentOS_guarded/index.html
// (functions: kpiInputValue, computeKpiExpression, computeKpiValue,
// computeAllKpis, normalizeKpiTarget, evaluateKpiPerformance,
// kpiPerformanceLabel, dedupeInputs, kpiEntryScore, parseAnalyticsNum,
// formatNum) — reused as-is per the user's request to keep ContentOS's
// existing, working logic rather than rewriting it. Adapted only to work
// with plain {key: value} maps instead of ContentOS's `plan` blob.
//
// IMPORTANT: this file must never use eval() or new Function() (non-
// negotiable rule #7). The expression parser below is a hand-written
// tokenizer + recursive-descent parser, exactly as in the original.

export function parseAnalyticsNum(v) {
  if (v === null || v === undefined || v === '') return 0
  const n = Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function formatNum(n) {
  const v = Number(n) || 0
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(1) + 'K'
  return Math.round(v).toLocaleString('en-US')
}

export function kpiInputValue(kpi, values, inp) {
  if (!inp) return 0
  const key = inp.metricId || inp.id
  const v = values?.[key] ?? values?.[inp.id]
  const n = parseAnalyticsNum(v)
  return Number.isFinite(n) ? n : 0
}

// Safe arithmetic expression evaluator. Only +,-,*,/,%,(),numbers and
// substituted variable tokens (v0, v1, ...) are ever produced or parsed —
// never eval()/Function().
export function computeKpiExpression(kpi, values) {
  const inputs = kpi.inputs || []
  let expr = String(kpi.formula || '').trim()
  if (!expr) return null
  const vars = {}
  inputs.slice()
    .sort((a, b) => String(b.label || '').length - String(a.label || '').length)
    .forEach((inp, i) => {
      const label = String(inp.label || '').trim()
      if (!label) return
      const key = 'v' + i
      vars[key] = kpiInputValue(kpi, values, inp)
      expr = expr.replace(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), key)
    })
  expr = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/٪/g, '%').replace(/,/g, '')
  if (!/^[0-9+\-*/%().\s_a-zA-Z0-9]+$/.test(expr)) return null
  const tokens = expr.match(/v\d+|(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/%]/g) || []
  if (tokens.join('').replace(/\s/g, '') !== expr.replace(/\s/g, '')) return null
  let i = 0
  function primary() {
    const t = tokens[i++]
    if (t === '(') { const v = addSub(); if (tokens[i++] !== ')') throw new Error('paren'); return v }
    if (/^v\d+$/.test(t)) return vars[t] ?? 0
    if (/^\d/.test(t) || t?.startsWith('.')) return Number(t)
    if (t === '-') return -primary()
    throw new Error('token')
  }
  function mulDiv() {
    let v = primary()
    while (i < tokens.length && /[*/%]/.test(tokens[i])) {
      const op = tokens[i++]; const r = primary()
      if (op === '*') v *= r
      else if (op === '/') v = r === 0 ? NaN : v / r
      else v = r === 0 ? NaN : v % r
    }
    return v
  }
  function addSub() {
    let v = mulDiv()
    while (i < tokens.length && /[+-]/.test(tokens[i])) {
      const op = tokens[i++]; const r = mulDiv()
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  try {
    const result = addSub()
    if (i !== tokens.length || !Number.isFinite(result)) return null
    return Math.round(result * 10000) / 10000
  } catch { return null }
}

export function computeKpiValue(kpi, values) {
  if (!kpi || !kpi.calc) return null
  const clean = s => String(s || '').replace(/[()]/g, '').trim()
  const byLabel = (label) => {
    const target = clean(label)
    const inp = (kpi.inputs || []).find(x => clean(x.label) === target)
    return kpiInputValue(kpi, values, inp)
  }
  const c = kpi.calc || {}
  if (c.type === 'expression') return computeKpiExpression(kpi, values)
  if (c.type === 'direct') {
    const inp = (kpi.inputs || [])[0]
    return inp ? parseAnalyticsNum(values[inp.metricId || inp.id] ?? values[inp.id]) : null
  }
  if (c.type === 'sum') {
    return Math.round((kpi.inputs || []).reduce((s, inp) => s + kpiInputValue(kpi, values, inp), 0) * 10000) / 10000
  }
  if (c.type === 'difference' || c.type === 'subtract') {
    const a = c.a ? byLabel(c.a) : kpiInputValue(kpi, values, (kpi.inputs || [])[0])
    const b = c.b ? byLabel(c.b) : kpiInputValue(kpi, values, (kpi.inputs || [])[1])
    return Math.round((a - b) * 10000) / 10000
  }
  if (c.type === 'ratio' || c.type === 'percent') {
    const num = c.numerator?.length ? c.numerator.reduce((s, n) => s + byLabel(n), 0) : kpiInputValue(kpi, values, (kpi.inputs || [])[0])
    const den = c.denominatorSum?.length ? c.denominatorSum.reduce((s, n) => s + byLabel(n), 0) : (c.denominator ? byLabel(c.denominator) : kpiInputValue(kpi, values, (kpi.inputs || [])[1]))
    if (den <= 0) return null
    const raw = num / den * (c.type === 'percent' ? 100 : 1)
    return Math.round(raw * 10000) / 10000
  }
  if (c.type === 'weighted') {
    const list = kpi.inputs || []
    const totalWeight = list.reduce((s, x) => s + Number(x.weight ?? 1), 0)
    if (!totalWeight) return null
    return Math.round(list.reduce((s, x) => s + kpiInputValue(kpi, values, x) * Number(x.weight ?? 1), 0) / totalWeight * 10000) / 10000
  }
  return null // manual — needs human judgement
}

export function computeAllKpis(kpis, values) {
  const out = {}
  ;(kpis || []).forEach(k => { out[k.key || k.id] = computeKpiValue(k, values) })
  return out
}

export function dedupeInputs(kpis) {
  const seen = new Map()
  ;(kpis || []).forEach(k => (k.inputs || []).forEach(inp => {
    const key = inp.metricId || inp.id
    if (!seen.has(key)) seen.set(key, inp.label)
  }))
  return Array.from(seen.entries()).map(([id, label]) => ({ id, label, metricId: id }))
}

const KPI_TARGET_SCHEMA_VERSION = 1
export function normalizeKpiTarget(k) {
  const t = (k && k.target_config && typeof k.target_config === 'object') ? k.target_config : {}
  return {
    schemaVersion: t.schemaVersion || KPI_TARGET_SCHEMA_VERSION,
    mode: t.mode || 'inherit',
    value: t.value !== undefined && t.value !== '' ? Number(t.value) : null,
    unit: t.unit || '',
    direction: t.direction || 'higher_better',
    benchmarkType: t.benchmarkType || 'none',
    benchmarkValue: t.benchmarkValue !== undefined && t.benchmarkValue !== '' ? Number(t.benchmarkValue) : null,
    scoreType: t.scoreType || 'percent_of_target',
    cap: t.cap !== undefined && t.cap !== '' ? Number(t.cap) : 100,
  }
}

export function evaluateKpiPerformance(k, actual) {
  const t = normalizeKpiTarget(k)
  const a = Number(actual)
  if (!Number.isFinite(a) || !Number.isFinite(t.value) || t.value === 0) return null
  const achieved = t.direction === 'lower_better' ? (t.value / a) * 100 : (a / t.value) * 100
  const score = t.cap > 0 ? Math.min(t.cap, Math.max(0, achieved)) : Math.max(0, achieved)
  let benchmark = null
  if (Number.isFinite(t.benchmarkValue)) {
    benchmark = t.direction === 'lower_better' ? (t.benchmarkValue / a) * 100 : (a / t.benchmarkValue) * 100
  }
  return {
    actual: a, target: t.value, achievement: achieved, score, benchmark,
    meetsTarget: t.direction === 'lower_better' ? a <= t.value : a >= t.value,
    direction: t.direction,
  }
}

export function kpiPerformanceLabel(result) {
  if (!result) return '—'
  return `${result.score.toFixed(0)}%`
}

export function kpiEntryScore(computed) {
  const vals = Object.values(computed || {}).filter(v => typeof v === 'number' && Number.isFinite(v))
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}
