import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/auth'
import { useWorkspace } from '../lib/workspace'
import { supabase } from '../lib/supabase'

const ROLE_OPTIONS = ['viewer', 'contributor', 'editor', 'manager', 'admin']
const MODULE_LABELS = {
  core: 'النظام الأساسي', today: 'اليوم', finance: 'المالية', relationships: 'العلاقات',
  learning: 'التعلّم', knowledge: 'المعرفة', projects: 'المشاريع', home: 'المنزل',
  content: 'المحتوى', habit: 'العادات', sports: 'الرياضة', shopping: 'التسوّق',
  inventory: 'المخزون', nutrition: 'التغذية', travel: 'السفر', spiritual: 'الجانب الروحي',
}
const MODULE_ROLE_OPTIONS = ['inherit', 'none', 'viewer', 'contributor', 'editor', 'manager', 'admin']
const MODULE_ROLE_LABELS = { inherit: 'حسب الدور العام', none: 'منع الوصول', viewer: 'مشاهدة', contributor: 'مساهم', editor: 'محرّر', manager: 'مدير النظام', admin: 'مسؤول النظام' }

function apiError(payload, fallback) {
  return payload?.error?.message_ar || payload?.message || fallback
}

export default function GeneralSettings() {
  const { user, session } = useAuth()
  const { workspace: activeWorkspace } = useWorkspace()
  const [workspaces, setWorkspaces] = useState([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [memberForm, setMemberForm] = useState({ email: '', role: 'viewer' })
  const [memberRoles, setMemberRoles] = useState({})
  const [moduleTarget, setModuleTarget] = useState({ user_id: '', module_key: 'content', access_role: 'inherit' })

  const apiBase = import.meta.env.VITE_SUPABASE_URL
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  async function callApi(action, options = {}) {
    if (!supabase || !apiBase || !apiKey) throw new Error('إعدادات Supabase غير مكتملة في الواجهة.')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token || session?.access_token
    if (sessionError || !token) throw new Error('انتهت جلسة الدخول. سجّل الدخول مرة أخرى.')
    const url = new URL(`${apiBase}/functions/v1/core-access-admin/${action}`)
    if (options.workspaceId) url.searchParams.set('workspace_id', options.workspaceId)
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    })
    let payload = {}
    try { payload = await response.json() } catch {}
    if (!response.ok) throw new Error(apiError(payload, `تعذّر تنفيذ العملية (HTTP ${response.status}).`))
    return payload
  }

  async function loadWorkspace(workspaceToLoad) {
    if (!workspaceToLoad) { setData(null); return }
    const result = await callApi('members', { workspaceId: workspaceToLoad })
    setData(result)
    setMemberRoles(Object.fromEntries((result.members || []).map(member => [member.user_id, member.role])))
    const selectedMember = result.members?.find(member => member.user_id === moduleTarget.user_id) || result.members?.[0]
    const currentOverride = result.module_access?.find(item => item.user_id === selectedMember?.user_id && item.module_key === moduleTarget.module_key)
    setModuleTarget(target => ({
      ...target,
      user_id: selectedMember?.user_id || '',
      access_role: currentOverride?.access_role || 'inherit',
    }))
  }

  async function load() {
    setLoading(true); setError(''); setNotice('')
    try {
      const result = await callApi('workspaces')
      const list = result.workspaces || []
      setWorkspaces(list)
      const preferred = list.find(item => item.id === activeWorkspace?.id)?.id || workspaceId || list[0]?.id || ''
      setWorkspaceId(preferred)
      if (preferred) await loadWorkspace(preferred)
      else setData(null)
    } catch (e) {
      setError(e.message || String(e))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user?.id, activeWorkspace?.id])

  const modules = useMemo(() => (data?.modules || Object.keys(MODULE_LABELS)).map(key => ({ key, label: MODULE_LABELS[key] || key })), [data?.modules])
  const members = data?.members || []
  const canManage = Boolean(data?.capabilities?.canManageMembers)

  async function refresh() {
    if (!workspaceId) return
    await loadWorkspace(workspaceId)
  }

  async function addMember(event) {
    event.preventDefault()
    if (!memberForm.email.trim()) return
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await callApi('members', { method: 'POST', workspaceId, body: { email: memberForm.email.trim(), role: memberForm.role } })
      setMemberForm({ email: '', role: 'viewer' })
      setNotice(result?.user_id ? 'تمت إضافة العضو أو إرسال دعوته.' : 'تم تنفيذ الطلب.')
      await refresh()
    } catch (e) { setError(e.message || String(e)) } finally { setBusy(false) }
  }

  async function saveMemberRole(member) {
    setBusy(true); setError(''); setNotice('')
    try {
      await callApi('members', { method: 'PATCH', workspaceId, body: { user_id: member.user_id, role: memberRoles[member.user_id] || member.role } })
      setNotice('تم تحديث دور العضو.')
      await refresh()
    } catch (e) { setError(e.message || String(e)) } finally { setBusy(false) }
  }

  async function toggleMember(member) {
    setBusy(true); setError(''); setNotice('')
    try {
      await callApi('members', { method: 'PATCH', workspaceId, body: { user_id: member.user_id, active: !member.active } })
      setNotice(member.active ? 'تم إيقاف عضوية الشخص.' : 'تم تفعيل العضوية.')
      await refresh()
    } catch (e) { setError(e.message || String(e)) } finally { setBusy(false) }
  }

  function selectModuleTarget(userId, moduleKey) {
    const override = data?.module_access?.find(item => item.user_id === userId && item.module_key === moduleKey)
    setModuleTarget({ user_id: userId, module_key: moduleKey, access_role: override?.access_role || 'inherit' })
  }

  async function saveModuleAccess(event) {
    event.preventDefault()
    if (!moduleTarget.user_id || !moduleTarget.module_key) return
    setBusy(true); setError(''); setNotice('')
    try {
      await callApi('module-access', { method: 'POST', workspaceId, body: moduleTarget })
      setNotice('تم حفظ صلاحية النظام. خيار «حسب الدور العام» يلغي الاستثناء ويعيد الصلاحية إلى الدور العام.')
      await refresh()
    } catch (e) { setError(e.message || String(e)) } finally { setBusy(false) }
  }

  return <div>
    <header className="page-head">
      <div>
        <div className="eyebrow">WORKSPACE · GLOBAL SETTINGS</div>
        <h1>الإعدادات العامة</h1>
        <p className="muted">إدارة الأشخاص والأدوار وصلاحيات جميع أنظمة مساحة العمل من مكان واحد، بدلًا من تكرار الإدارة داخل كل نظام.</p>
      </div>
    </header>

    {error && <div className="error" role="alert">{error}</div>}
    {notice && <div className="card" role="status" style={{ borderColor: 'var(--border-strong)', marginBottom: 16 }}>{notice}</div>}

    <section className="section card">
      <div className="section-head">
        <div><div className="eyebrow">WORKSPACE</div><h2>مساحة العمل</h2></div>
        <button className="secondary" disabled={loading || busy} onClick={load}>↻ تحديث</button>
      </div>
      <div className="form-grid">
        <label>اختر مساحة العمل
          <select value={workspaceId} disabled={loading || workspaces.length < 2} onChange={async event => {
            const next = event.target.value; setWorkspaceId(next); setLoading(true); setError('')
            try { await loadWorkspace(next) } catch (e) { setError(e.message || String(e)) } finally { setLoading(false) }
          }}>
            {!workspaces.length && <option value="">لا توجد مساحة عمل متاحة</option>}
            {workspaces.map(item => <option key={item.id} value={item.id}>{item.name} · {item.role}</option>)}
          </select>
        </label>
        <div><span className="muted">الدور الحالي</span><div><strong>{data?.workspace?.role || '—'}</strong></div></div>
      </div>
    </section>

    {loading ? <section className="card"><p className="muted">جارٍ تحميل الإعدادات…</p></section> : !data ? <section className="card"><p className="muted">لا توجد مساحة عمل يمكن إدارتها بهذا الحساب.</p></section> : <>
      <section className="section card">
        <div className="section-head"><div><div className="eyebrow">PEOPLE & ACCESS</div><h2>الأشخاص والأدوار</h2></div><span className="chip">{members.length} عضو</span></div>
        {!canManage && <p className="warning">تستطيع عرض بيانات مساحة العمل، لكن إضافة الأشخاص وتعديل الأدوار متاحان لمالك المساحة أو المسؤول المخوّل فقط.</p>}
        <div className="card-list">
          {members.map(member => <div className="list-row between" key={member.user_id}>
            <div className="grow">
              <strong>{member.display_name || member.email || member.user_id}</strong>
              <div className="muted">{member.email || member.user_id}{member.is_owner ? ' · مالك مساحة العمل' : ''}</div>
              <div className="muted">{member.active ? 'عضوية نشطة' : 'عضوية موقوفة'}</div>
            </div>
            <div className="form-grid compact">
              <label>الدور
                <select disabled={!canManage || busy || member.is_owner} value={memberRoles[member.user_id] || member.role} onChange={event => setMemberRoles(current => ({ ...current, [member.user_id]: event.target.value }))}>
                  {ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              {canManage && <div className="button-row">
                <button className="secondary" disabled={busy || member.is_owner || (memberRoles[member.user_id] || member.role) === member.role} onClick={() => saveMemberRole(member)}>حفظ الدور</button>
                <button className="secondary" disabled={busy || member.is_owner} onClick={() => toggleMember(member)}>{member.active ? 'إيقاف' : 'تفعيل'}</button>
              </div>}
            </div>
          </div>)}
          {!members.length && <p className="muted">لا يوجد أعضاء ظاهرون في مساحة العمل.</p>}
        </div>

        {canManage && <form className="card" onSubmit={addMember}>
          <h3>إضافة شخص أو دعوته بالبريد</h3>
          <p className="muted">اكتب البريد الإلكتروني، وحدّد الدور العام. يمكن ضبط صلاحية كل نظام بشكل مستقل بعد الإضافة.</p>
          <div className="form-grid">
            <label>البريد الإلكتروني<input type="email" required value={memberForm.email} onChange={event => setMemberForm(current => ({ ...current, email: event.target.value }))} placeholder="name@example.com" /></label>
            <label>الدور العام<select value={memberForm.role} onChange={event => setMemberForm(current => ({ ...current, role: event.target.value }))}>{ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}</select></label>
          </div>
          <button className="primary" disabled={busy || !memberForm.email.trim()} type="submit">{busy ? 'جارٍ التنفيذ…' : 'إضافة الشخص'}</button>
        </form>}
      </section>

      <section className="section card">
        <div className="section-head"><div><div className="eyebrow">MODULE ACCESS</div><h2>صلاحيات الأنظمة</h2></div></div>
        <p className="muted">الدور العام يظل الأساس. استخدم «حسب الدور العام» لإزالة الاستثناء، أو حدّد صلاحية مختلفة لنظام بعينه.</p>
        {!canManage && <p className="muted">تحتاج صلاحية إدارة الأشخاص لتعديل صلاحيات الأنظمة.</p>}
        <form onSubmit={saveModuleAccess}>
          <div className="form-grid">
            <label>الشخص
              <select disabled={!canManage || busy || !members.length} value={moduleTarget.user_id} onChange={event => selectModuleTarget(event.target.value, moduleTarget.module_key)}>
                {members.map(member => <option key={member.user_id} value={member.user_id}>{member.display_name || member.email || member.user_id}</option>)}
              </select>
            </label>
            <label>النظام
              <select disabled={!canManage || busy} value={moduleTarget.module_key} onChange={event => selectModuleTarget(moduleTarget.user_id, event.target.value)}>
                {modules.map(module => <option key={module.key} value={module.key}>{module.label}</option>)}
              </select>
            </label>
            <label>صلاحية هذا النظام
              <select disabled={!canManage || busy} value={moduleTarget.access_role} onChange={event => setModuleTarget(target => ({ ...target, access_role: event.target.value }))}>
                {MODULE_ROLE_OPTIONS.map(role => <option key={role} value={role}>{MODULE_ROLE_LABELS[role]}</option>)}
              </select>
            </label>
          </div>
          {canManage && <button className="primary" disabled={busy || !moduleTarget.user_id} type="submit">حفظ صلاحية النظام</button>}
        </form>
        <div className="card-list" style={{ marginTop: 18 }}>
          {(data.module_access || []).map(item => <div className="list-row between" key={`${item.user_id}:${item.module_key}`}>
            <div><strong>{members.find(member => member.user_id === item.user_id)?.display_name || members.find(member => member.user_id === item.user_id)?.email || item.user_id}</strong><div className="muted">{MODULE_LABELS[item.module_key] || item.module_key}</div></div>
            <span className="chip">{MODULE_ROLE_LABELS[item.access_role] || item.access_role}</span>
          </div>)}
          {!(data.module_access || []).length && <p className="muted">لا توجد استثناءات خاصة حتى الآن؛ الأدوار العامة هي المطبّقة.</p>}
        </div>
      </section>
    </>}
  </div>
}
