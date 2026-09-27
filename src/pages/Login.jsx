import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabaseConfigured } from '../lib/supabase'

export default function Login() {
  const { signIn, signUp } = useAuth(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [mode,setMode]=useState('signIn'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
  if (!supabaseConfigured) return <div className="center"><div className="login-card"><h1>Unified OS</h1><p className="muted">Supabase غير مهيأ بعد. انسخ .env.example إلى .env وأضف بيانات المشروع.</p></div></div>
  async function submit(e){e.preventDefault(); setBusy(true); setError(''); const {error} = mode==='signIn' ? await signIn(email,password) : await signUp(email,password); if(error) setError(error.message); setBusy(false)}
  return <div className="center"><form className="login-card" onSubmit={submit}><div className="brand big">UNIFIED OS<span>ContentOS Foundation</span></div><h2>{mode==='signIn'?'تسجيل الدخول':'إنشاء حساب'}</h2><input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/>{error&&<div className="error">{error}</div>}<button className="primary" disabled={busy}>{busy?'…':mode==='signIn'?'دخول':'إنشاء الحساب'}</button><button type="button" className="secondary full" onClick={()=>setMode(mode==='signIn'?'signUp':'signIn')}>{mode==='signIn'?'أحتاج إنشاء حساب':'لدي حساب بالفعل'}</button></form></div>
}
