import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

function loadSession() {
  try {
    const token = sessionStorage.getItem('jwt') || ''
    const raw = sessionStorage.getItem('user')
    const user = raw ? JSON.parse(raw) : null
    return { token, user }
  } catch {
    return { token: '', user: null }
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setState] = useState(loadSession)

  const login = (payload) => {
    const normalized = {
      name: payload.name,
      role: String(payload.role || '')
        .trim()
        .toLowerCase(),
    }
    sessionStorage.setItem('jwt', payload.token)
    sessionStorage.setItem('user', JSON.stringify(normalized))
    setState({ token: payload.token, user: normalized })
  }

  const logout = () => {
    sessionStorage.removeItem('jwt')
    sessionStorage.removeItem('user')
    setState({ token: '', user: null })
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
