import { Link, useLocation } from 'react-router-dom'

const config = {
  '/business': ['BUSINESS OS', 'Business', 'Business is an aggregation layer over Projects, Finance and the verticals enabled by each project.', [['/projects', 'Projects'], ['/finance', 'Finance']]],
  '/content': ['CONTENT SYSTEM', 'ContentOS', 'The existing ContentOS remains the source of truth. This route opens the original subsystem.', [['/contentos', 'Open ContentOS']]],
  '/knowledge': ['KNOWLEDGE OS', 'Knowledge', 'Shared Core knowledge entities without creating duplicate databases per vertical.', [['/resources', 'Resources'], ['/notes', 'Notes'], ['/decisions', 'Decisions'], ['/reviews', 'Reviews']]],
  '/system': ['SYSTEM', 'System', 'Platform state, source-of-truth rules, and phased architecture status.', [['/projects', 'Project Engine'], ['/contentos', 'Existing ContentOS'], ['/system/security', 'Security & Audit']]],
}

export default function ModuleHub() {
  const { pathname } = useLocation()
  const [eyebrow, title, description, links] = config[pathname] || config['/system']
  return <div>
    <header className="page-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="muted">{description}</p></div></header>
    <div className="card">
      <h3>Quick access</h3>
      <div className="grid grid-2 action-grid">{links.map(([to,label])=><Link key={to} className="secondary action-card" to={to}>{label} ↗</Link>)}</div>
    </div>
    <section className="section"><div className="card"><div className="eyebrow">PHASE 6</div><h3>Contextual module architecture</h3><p className="muted">Modules are enabled per Project. Opening a Project shows only its enabled modules; the Command Center remains an aggregator and does not duplicate entity data.</p></div></section>
  </div>
}
