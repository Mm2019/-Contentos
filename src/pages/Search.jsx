import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { globalSearch } from '../lib/search'
import { useWorkspace } from '../lib/workspace'

export default function Search() {
  const { workspace } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    setQuery(params.get('q') || '')
  }, [params])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!workspace?.id || query.trim().length < 2) { setRows([]); return }
    setLoading(true)
    timer.current = setTimeout(() => {
      globalSearch(workspace.id, query)
        .then(setRows)
        .catch(() => setRows([]))
        .finally(() => setLoading(false))
    }, 220)
    return () => clearTimeout(timer.current)
  }, [workspace?.id, query])

  return <div>
    <header className="page-head"><div><div className="eyebrow">GLOBAL SEARCH</div><h1>بحث موحد</h1><p className="muted">ابحث في الـShared Core والـFinance records. ContentOS يبقى نظامًا مستقلاً ومساره يفتح النظام الأصلي.</p></div></header>
    <div className="card">
      <div className="search-input-wrap"><span>⌕</span><input autoFocus value={query} onChange={e => { setQuery(e.target.value); setParams(e.target.value ? { q: e.target.value } : {}) }} placeholder="Project, task, goal, note, transaction…" /></div>
    </div>
    <section className="section">
      <div className="card">
        {loading && <div className="muted">جاري البحث…</div>}
        {!loading && query.trim().length < 2 && <div className="muted">اكتب حرفين على الأقل لبدء البحث.</div>}
        {!loading && query.trim().length >= 2 && !rows.length && <div className="muted">لا توجد نتائج.</div>}
        {rows.map(row => <Link key={`${row.label}-${row.id}`} to={row.route} className="list-row search-result"><div><strong>{row.title}</strong><div className="muted">{row.label} {row.meta ? `· ${row.meta}` : ''}</div></div><span>↗</span></Link>)}
      </div>
    </section>
  </div>
}
