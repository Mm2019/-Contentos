import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEntity } from '../lib/core'
import { useWorkspace } from '../lib/workspace'
import { profileByName } from '../lib/projectModules'

const actions = [
  ['task', 'New Task', 'إضافة مهمة في Shared Core'],
  ['project', 'New Project', 'إنشاء Project جديد'],
  ['goal', 'New Goal', 'إضافة هدف'],
  ['transaction', 'New Transaction', 'تسجيل حركة مالية'],
  ['content', 'New Content', 'فتح ContentOS لإنشاء المحتوى من النظام الأصلي'],
  ['idea', 'New Idea', 'فتح Knowledge / Ideas (سيتم تنفيذ entity في مرحلته)'],
  ['bookmark', 'New Bookmark', 'فتح Knowledge / Resources'],
  ['meeting', 'New Meeting', 'تسجيل اجتماع ونتائجه'],
  ['event', 'New Event', 'إضافة مؤتمر أو Workshop أو Webinar'],
]

export default function QuickActions({ open, onClose }) {
  const { workspace } = useWorkspace()
  const navigate = useNavigate()
  const [kind, setKind] = useState(null)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (!open) { setKind(null); setValue('') } }, [open])
  useEffect(() => {
    if (!open) return
    const handler = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  async function submit(event) {
    event.preventDefault()
    if (!workspace || !value.trim()) return
    setBusy(true)
    try {
      if (kind === 'task') { await createEntity('uos_tasks', { workspace_id: workspace.id, title: value.trim(), status: 'backlog' }); navigate('/tasks') }
      if (kind === 'project') { const profile = profileByName('Personal / Research'); await createEntity('uos_projects', { workspace_id: workspace.id, name: value.trim(), project_profile: profile.name, status: 'idea', enabled_modules: profile.defaultModules, module_config_version: 1 }); navigate('/projects') }
      if (kind === 'goal') { await createEntity('uos_goals', { workspace_id: workspace.id, title: value.trim(), status: 'active', level: 'goal' }); navigate('/goals') }
      if (kind === 'transaction') { await createEntity('uos_fin_transactions', { workspace_id: workspace.id, amount: Number(value) || 0, type: 'expense', description: 'Quick Action', source_entity_type: 'quick_action', source_entity_id: crypto.randomUUID(), external_id: crypto.randomUUID(), sync_status: 'manual' }); navigate('/finance') }
      if (kind === 'content') { navigate('/contentos'); onClose(); return }
      if (kind === 'idea') { await createEntity('uos_knowledge_ideas', { workspace_id: workspace.id, title: value.trim(), status: 'inbox', idea_type: 'Personal' }); navigate('/knowledge?tab=ideas'); onClose(); return }
      if (kind === 'bookmark') { await createEntity('uos_resources', { workspace_id: workspace.id, title: value.trim(), status: 'inbox', type: 'bookmark', date_added: new Date().toISOString().slice(0,10), tags: [] }); navigate('/knowledge?tab=inbox'); onClose(); return }
      if (kind === 'meeting') { await createEntity('uos_knowledge_meetings', { workspace_id: workspace.id, title: value.trim(), meeting_date: new Date().toISOString(), status: 'planned' }); navigate('/knowledge?tab=meetings'); onClose(); return }
      if (kind === 'event') { await createEntity('uos_events', { workspace_id: workspace.id, title: value.trim(), starts_at: new Date().toISOString(), event_type: 'Other', status: 'upcoming' }); navigate('/knowledge?tab=events'); onClose(); return }
      onClose()
    } finally { setBusy(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true">
      <div className="between"><div><div className="eyebrow">QUICK ACTIONS</div><h2>{kind ? actions.find(a => a[0] === kind)?.[1] : 'ماذا تريد أن تفعل؟'}</h2></div><button className="secondary" onClick={onClose}>Esc</button></div>
      {!kind ? <div className="quick-grid">{actions.map(([id, label, desc]) => <button key={id} className="quick-item" onClick={() => setKind(id)}><strong>{label}</strong><span>{desc}</span></button>)}</div> : (['content'].includes(kind) ? <div className="quick-confirm"><p className="muted">سيتم فتح النظام المقصود مباشرة بدون إنشاء نسخة بيانات جديدة.</p><button className="primary" onClick={() => submit({ preventDefault(){} })}>فتح</button></div> : <form onSubmit={submit}><input autoFocus type={kind === 'transaction' ? 'number' : 'text'} placeholder={kind === 'transaction' ? 'المبلغ' : 'الاسم أو العنوان'} value={value} onChange={e => setValue(e.target.value)} required /><div className="actions"><button className="primary" disabled={busy}>{busy ? 'جاري الحفظ…' : 'حفظ'}</button><button type="button" className="secondary" onClick={() => setKind(null)}>رجوع</button></div></form>)}
    </div>
  </div>
}
