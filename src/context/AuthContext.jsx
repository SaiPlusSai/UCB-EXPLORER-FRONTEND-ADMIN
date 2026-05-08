import { createContext, useContext, useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { authApi } from '../api/endpoints'

const AuthContext = createContext(null)
const TOKEN_KEY = 'ucb_admin_token'
const USER_KEY = 'ucb_admin'
const INACTIVITY_MS = 30 * 60 * 1000 // 30 minutos

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const inactivityTimer = useRef(null)

  const persist = useCallback((tok, user) => {
    if (tok) localStorage.setItem(TOKEN_KEY, tok); else localStorage.removeItem(TOKEN_KEY)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); else localStorage.removeItem(USER_KEY)
    setToken(tok || null)
    setAdmin(user || null)
  }, [])

  const logout = useCallback(() => {
    clearTimeout(inactivityTimer.current)
    persist(null, null)
  }, [persist])

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      persist(null, null)
      window.alert('Sesión cerrada por inactividad. Por seguridad, inicia sesión nuevamente.')
    }, INACTIVITY_MS)
  }, [persist])

  useEffect(() => {
    if (!token) return
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((ev) => window.addEventListener(ev, resetInactivityTimer, { passive: true }))
    resetInactivityTimer()
    return () => {
      clearTimeout(inactivityTimer.current)
      events.forEach((ev) => window.removeEventListener(ev, resetInactivityTimer))
    }
  }, [token, resetInactivityTimer])

  const login = async (correo, password) => {
    const { data } = await authApi.login(correo, password)
    persist(data.data.token, data.data.admin)
    return data.data.admin
  }

  useEffect(() => {
    const verificar = async () => {
      if (!token) { setCargandoSesion(false); return }
      try {
        const { data } = await authApi.me()
        persist(token, data.data)
      } catch {
        persist(null, null)
      } finally {
        setCargandoSesion(false)
      }
    }
    verificar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({ token, admin, login, logout, cargandoSesion }),
    [token, admin, cargandoSesion]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fuera de AuthProvider')
  return ctx
}
