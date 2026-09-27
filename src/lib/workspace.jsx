import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth'
import { ensureWorkspace } from './core'

const WorkspaceContext = createContext(null)
export function WorkspaceProvider({ children }) {
  const { user } = useAuth(); const [workspace, setWorkspace] = useState(null); const [loading, setLoading] = useState(true)
  const load = async () => { if (!user) { setWorkspace(null); setLoading(false); return }; setLoading(true); setWorkspace(await ensureWorkspace(user)); setLoading(false) }
  useEffect(() => { load() }, [user?.id])
  return <WorkspaceContext.Provider value={{ workspace, loading, reload: load }}>{children}</WorkspaceContext.Provider>
}
export const useWorkspace = () => useContext(WorkspaceContext)
