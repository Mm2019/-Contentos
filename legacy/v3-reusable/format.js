export function money(n, currency = 'EGP') {
  if (n === null || n === undefined) return '—'
  const v = Number(n)
  const sign = v < 0 ? '-' : ''
  return `${sign}${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${currency}`
}

export function pct(n) {
  if (n === null || n === undefined) return '—'
  return `${Number(n).toFixed(0)}%`
}
