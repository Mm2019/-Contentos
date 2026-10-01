import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { initArabicLocalization } from './lib/i18n'
import { AuthProvider } from './lib/auth'
import { WorkspaceProvider } from './lib/workspace'
import RequireAuth from './components/RequireAuth'
import Layout from './components/Layout'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import ContentOSPage from './pages/ContentOSPage'
import ContentOSConfig from './pages/ContentOSConfig'
import ContentOSAnalytics from './pages/ContentOSAnalytics'
import ContentOSIntelligence from './pages/ContentOSIntelligence'
import SimpleEntity from './pages/SimpleEntity'
import Finance from './pages/Finance'
import Personal from './pages/Personal'
import Habits from './pages/Habits'
import Learning from './pages/Learning'
import Fitness from './pages/Fitness'
import HomeOS from './pages/HomeOS'
import ProductOS from './pages/ProductOS'
import Commerce from './pages/Commerce'
import Marketplace from './pages/Marketplace'
import GlobalIntelligence from './pages/GlobalIntelligence'
import SecurityAudit from './pages/SecurityAudit'
import VersioningRecovery from './pages/VersioningRecovery'
import DataManager from './pages/DataManager'
import Knowledge from './pages/Knowledge'
import ModuleHub from './pages/ModuleHub'
import BusinessOS from './pages/BusinessOS'
import Today from './pages/Today'
import NotionParity from './pages/NotionParity'
import './styles.css'

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('UI crashed:', error, info) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, direction: 'rtl', fontFamily: 'system-ui,sans-serif', background: '#fff5f4', minHeight: '100vh' }}>
          <h2 style={{ color: '#b42318', margin: '0 0 12px' }}>الصفحة واجهت خطأ ولم تستطع تحمل نفسها</h2>
          <p style={{ color: '#667085' }}>ابعت نص الرسالة التالية بالظبط عشان يتصلح:</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #f3c7c3', borderRadius: 8, padding: 14, fontSize: 12, direction: 'ltr', textAlign: 'left' }}>
            {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
          </pre>
          <button onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            style={{ marginTop: 14, padding: '10px 16px', borderRadius: 9, border: '1px solid #b42318', background: '#fff', color: '#b42318', cursor: 'pointer', font: 'inherit' }}>
            الرجوع للصفحة الرئيسية
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <RequireAuth>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/today" element={<Today />} />
              <Route path="/parity" element={<NotionParity />} />
              <Route path="/projects/:id/parity" element={<NotionParity />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/contentos" element={<ContentOSPage />} />
              <Route path="/contentos" element={<ContentOSPage />} />
              <Route path="/contentos/configuration" element={<ContentOSConfig />} />
              <Route path="/contentos/analytics" element={<ContentOSAnalytics />} />
              <Route path="/contentos/intelligence" element={<ContentOSIntelligence />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/personal" element={<Personal />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/projects/:id/habits" element={<Habits />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/meetings" element={<Navigate to="/knowledge?tab=meetings" replace />} />
              <Route path="/events" element={<Navigate to="/knowledge?tab=events" replace />} />
              <Route path="/knowledge/inbox" element={<Navigate to="/knowledge?tab=inbox" replace />} />
              <Route path="/knowledge/bookmarks" element={<Navigate to="/knowledge?tab=bookmarks" replace />} />
              <Route path="/knowledge/ideas" element={<Navigate to="/knowledge?tab=ideas" replace />} />
              <Route path="/projects/:id/learning" element={<Learning />} />
              <Route path="/projects/:id/knowledge" element={<Knowledge />} />
              <Route path="/fitness" element={<Fitness />} />
              <Route path="/projects/:id/fitness" element={<Fitness />} />
              <Route path="/home" element={<HomeOS />} />
              <Route path="/projects/:id/home" element={<HomeOS />} />
              <Route path="/product" element={<ProductOS />} />
              <Route path="/commerce" element={<Commerce />} />
              <Route path="/projects/:id/commerce" element={<Commerce />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/intelligence" element={<GlobalIntelligence />} />
              <Route path="/system/security" element={<SecurityAudit />} />
              <Route path="/system/recovery" element={<VersioningRecovery />} />
              <Route path="/system/data" element={<DataManager />} />
              <Route path="/projects/:id/marketplace" element={<Marketplace />} />
              <Route path="/projects/:id/product" element={<ProductOS />} />
              <Route path="/business" element={<BusinessOS />} />
              <Route path="/projects/:id/business" element={<BusinessOS />} />
                            <Route path="/content" element={<ModuleHub />} />
              <Route path="/system" element={<ModuleHub />} />
              <Route
                path="/tasks"
                element={<SimpleEntity
                  table="uos_tasks"
                  title="Tasks"
                  fields={[
                    ['title', 'عنوان المهمة'],
                    ['status', ['backlog', 'next', 'in_progress', 'blocked', 'review', 'done', 'cancelled'], 'select'],
                    ['due_date', 'تاريخ الاستحقاق', 'date'],
                  ]}
                  defaults={{ status: 'backlog', title: '', due_date: '' }}
                />}
              />
              <Route
                path="/goals"
                element={<SimpleEntity
                  table="uos_goals"
                  title="Goals"
                  fields={[
                    ['title', 'عنوان الهدف'],
                    ['status', ['active', 'paused', 'completed', 'cancelled'], 'select'],
                  ]}
                  defaults={{ status: 'active', title: '' }}
                />}
              />
              <Route
                path="/calendar"
                element={<SimpleEntity
                  table="uos_events"
                  title="Calendar / Events"
                  fields={[
                    ['title', 'عنوان الحدث'],
                    ['starts_at', 'تاريخ البداية', 'datetime-local'],
                  ]}
                  defaults={{ title: '', starts_at: '' }}
                />}
              />
              <Route
                path="/resources"
                element={<SimpleEntity
                  table="uos_resources"
                  title="Knowledge / Resources"
                  fields={[
                    ['title', 'اسم المورد'],
                    ['url', 'URL', 'url'],
                    ['status', ['inbox', 'reading', 'reference', 'archived'], 'select'],
                  ]}
                  defaults={{ status: 'inbox', title: '', url: '' }}
                />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </RequireAuth>
      </WorkspaceProvider>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>,
)

// Runs after the initial paint so it can see React's rendered DOM, then keeps
// watching for route changes / async data via MutationObserver.
initArabicLocalization()
