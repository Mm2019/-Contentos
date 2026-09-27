import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useWorkspace } from '../lib/workspace'
import { useState } from 'react'

const groups = [
 ['شخصي', [['/','⌂','الرئيسية'],['/today','📅','اليوم'],['/personal','👤','شخصي'],['/tasks','☑','المهام'],['/goals','◎','الأهداف'],['/habits','✓','العادات'],['/fitness','💪','اللياقة'],['/home','⌂','المنزل'],['/finance','¤','المالية'],['/calendar','▦','التقويم'],['/knowledge','📖','المعرفة'],['/learning','📚','التعلّم'],['/search','⌕','البحث'],['/notes','▤','الملاحظات'],['/reviews','★','المراجعات'],['/decisions','◇','القرارات']]],
 ['الأعمال', [['/projects','▣','المشروعات'],['/business','▥','إدارة الأعمال'],['/product','◉','المنتج والبرمجيات'],['/commerce','▤','التجارة'],['/marketplace','◇','السوق'],['/contentos','◈','ContentOS'],['/contentos/configuration','⚙','إعدادات ContentOS'],['/contentos/analytics','▥','تحليلات ContentOS'],['/contentos/intelligence','🧠','ذكاء المحتوى']]],
 ['النظام', [['/parity','🧩','تكامل Notion OS'],['/intelligence','🧠','الذكاء العام'],['/system/security','🔐','الأمان والصلاحيات'],['/system/recovery','↺','النسخ والاستعادة'],['/system/data','🧰','إدارة البيانات']]]
]
export default function Layout() {
 const {user,signOut}=useAuth(); const {workspace,reload}=useWorkspace(); const [open,setOpen]=useState({'شخصي':true,'الأعمال':false,'النظام':false})
 const local=String(workspace?.id||'').startsWith('local-')
 return <div className="app-shell"><aside className="sidebar"><div className="brand">UNIFIED OS<span>مساحة العمل الموحدة</span></div><div className="workspace-pill">{workspace?.name||'مساحة العمل'}</div>
 {local&&<div role="alert" className="error" style={{margin:'10px',fontSize:12}}>غير متصل — بياناتك تُحفظ على هذا الجهاز فقط. لا تمسح بيانات المتصفح قبل مزامنتها.</div>}
 <nav>{groups.map(([name,items])=><section key={name}><button className="nav-link ghost" style={{width:'100%',fontWeight:700}} onClick={()=>setOpen(v=>({...v,[name]:!v[name]}))}>{open[name]?'▾':'▸'} {name}</button>{open[name]&&items.map(([to,icon,label])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`nav-link ${isActive?'active':''}`}><span>{icon}</span>{label}</NavLink>)}</section>)}</nav>
 <div className="sidebar-spacer"/><button className="nav-link ghost" onClick={reload}>↻ تحديث</button><button className="nav-link ghost" onClick={signOut}>⇥ تسجيل الخروج</button><div className="user-chip">{user?.email}</div></aside><main className="main"><Outlet/></main></div>
}
