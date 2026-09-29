import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useWorkspace } from '../lib/workspace'

const links = [
  ['/', '⌂', 'مركز التحكم'],
  ['/today', '📅', 'اليوم'],
  ['/parity', '🧩', 'التطابق مع Notion'],
  ['/projects', '▣', 'المشاريع'],
  ['/personal', '◉', 'شخصي'],
  ['/business', '▣', 'نظام الأعمال'],
  ['/fitness', '💪', 'اللياقة'],
  ['/habits', '✓', 'العادات'],
  ['/home', '⌂', 'نظام المنزل'],
  ['/tasks', '✓', 'المهام'],
  ['/goals', '◎', 'الأهداف'],
  ['/finance', '¤', 'المالية'],
  ['/calendar', '◫', 'التقويم'],
  ['/knowledge', '↗', 'المعرفة'],
  ['/learning', '📚', 'التعلّم'],
  ['/resources', '↗', 'الموارد'],
  ['/contentos', '◈', 'نظام المحتوى'],
  ['/contentos/configuration', '⚙', 'إعدادات نظام المحتوى'],
  ['/contentos/analytics', '↗', 'تحليلات نظام المحتوى'],
  ['/contentos/intelligence', '🧠', 'ذكاء المحتوى'],
  ['/product', '◉', 'المنتج / SaaS'],
  ['/commerce', '▤', 'التجارة'],
  ['/marketplace', '◇', 'السوق'],
  ['/intelligence', '🧠', 'الذكاء الشامل'],
  ['/system/security', '🔐', 'الأمان والتدقيق'],
  ['/system/recovery', '↺', 'النسخ والاسترجاع'],
  ['/system/data', '🧰', 'مدير البيانات'],
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const { workspace, reload } = useWorkspace()
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">الأنظمة الموحدة<span>الأساس</span></div>
      <div className="workspace-pill">{workspace?.name || 'مساحة العمل'}</div>
      <nav>{links.map(([to, icon, label]) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><span>{icon}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-spacer" />
      <button className="nav-link ghost" onClick={reload}>↻ تحديث</button>
      <button className="nav-link ghost" onClick={signOut}>⇥ تسجيل خروج</button>
      <div className="user-chip">{user?.email}</div>
    </aside>
    <main className="main"><Outlet /></main>
  </div>
}
