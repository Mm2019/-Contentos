import { useAuth } from '../lib/auth'
import Login from '../pages/Login'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="center">جاري التحقق من الجلسة…</div>
  if (!user) return <Login />
  return children
}
