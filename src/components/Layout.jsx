import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useWorkspace } from '../lib/workspace'

const links = [
  ['/', '⌂', 'Command Center'],
  ['/today', '📅', 'Today'],
  ['/parity', '🧩', 'Notion OS Parity'],
  ['/projects', '▣', 'Projects'],
  ['/personal', '◉', 'Personal'],
  ['/business', '▣', 'Business OS'],
  ['/fitness', '💪', 'Fitness'],
  ['/habits', '✓', 'Habits'],
  ['/home', '⌂', 'Home OS'],
  ['/tasks', '✓', 'Tasks'],
  ['/goals', '◎', 'Goals'],
  ['/finance', '¤', 'Finance'],
  ['/calendar', '◫', 'Calendar'],
  ['/knowledge', '↗', 'Knowledge'],
  ['/learning', '📚', 'Learning'],
  ['/resources', '↗', 'Resources'],
  ['/contentos', '◈', 'ContentOS'],
  ['/contentos/configuration', '⚙', 'ContentOS Config'],
  ['/contentos/analytics', '↗', 'ContentOS Analytics'],
  ['/contentos/intelligence', '🧠', 'Content Intelligence'],
  ['/product', '◉', 'Product / SaaS'],
  ['/commerce', '▤', 'Commerce'],
  ['/marketplace', '◇', 'Marketplace'],
  ['/intelligence', '🧠', 'Global Intelligence'],
  ['/system/security', '🔐', 'Security & Audit'],
  ['/system/recovery', '↺', 'Versioning & Recovery'],
  ['/system/data', '🧰', 'Data Manager'],
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const { workspace, reload } = useWorkspace()
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">UNIFIED OS<span>Foundation</span></div>
      <div className="workspace-pill">{workspace?.name || 'Workspace'}</div>
      <nav>{links.map(([to, icon, label]) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><span>{icon}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-spacer" />
      <button className="nav-link ghost" onClick={reload}>↻ Refresh</button>
      <button className="nav-link ghost" onClick={signOut}>⇥ Sign out</button>
      <div className="user-chip">{user?.email}</div>
    </aside>
    <main className="main"><Outlet /></main>
  </div>
}
