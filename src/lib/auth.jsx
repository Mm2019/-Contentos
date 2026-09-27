import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabase) { setSession(null); return }
    let mounted = true
    supabase.auth.getSession().then(({ data }) => { if (mounted) setSession(data.session ?? null) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => { mounted = false; data?.subscription?.unsubscribe() }
  }, [])

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUp = (email, password) => supabase.auth.signUp({ email, password })
  const signOut = () => supabase.auth.signOut()

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading: session === undefined, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
