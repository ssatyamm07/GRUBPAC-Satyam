import { useCallback, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  IconLive,
  IconMenu,
  IconPrincipal,
  IconSidebarCollapse,
  IconSignIn,
  IconTeacher,
} from './NavIcons'

/** v2: default is open; old key may have been '0' from a previous session */
const STORAGE_KEY = 'grubpac-sidebar-expanded-v2'

function readSidebarOpen() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === '0') return false
    return true
  } catch {
    return true
  }
}

export default function AppShell() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarOpen)

  const handleSignOut = useCallback(() => {
    logout()
    navigate('/', { replace: true })
  }, [logout, navigate])

  const openSidebar = useCallback(() => {
    setSidebarOpen(true)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
    try {
      localStorage.setItem(STORAGE_KEY, '0')
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <div className={`shell${sidebarOpen ? '' : ' sidebar-closed'}`}>
      <aside className="sidebar" inert={!sidebarOpen ? true : undefined} aria-hidden={!sidebarOpen}>
        <div className="sidebar-top">
          <div className="sidebar-header-row">
            <Link to="/" className="brand-block">
              <span className="brand-mark" aria-hidden>G</span>
              <span className="brand-text">
                <span className="brand">Grubpac</span>
                <span className="brand-tag">Content broadcasting</span>
              </span>
            </Link>
            <button
              type="button"
              className="btn btn-icon btn-sidebar-toggle"
              onClick={closeSidebar}
              aria-label="Close sidebar"
              title="Hide sidebar"
            >
              <IconSidebarCollapse />
            </button>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          <NavLink
            to="/live"
            className={({ isActive }) => (isActive ? 'active' : '')}
            title="Live broadcast"
          >
            <IconLive className="nav-icon" />
            <span>Live broadcast</span>
          </NavLink>
          {isAuthenticated && user?.role === 'teacher' && (
            <NavLink
              to="/teacher"
              className={({ isActive }) => (isActive ? 'active' : '')}
              title="Teacher workspace"
            >
              <IconTeacher className="nav-icon" />
              <span>Teacher workspace</span>
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'principal' && (
            <NavLink
              to="/principal"
              className={({ isActive }) => (isActive ? 'active' : '')}
              title="Principal console"
            >
              <IconPrincipal className="nav-icon" />
              <span>Principal console</span>
            </NavLink>
          )}
          {!isAuthenticated && (
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'active' : '')}
              title="Sign in"
            >
              <IconSignIn className="nav-icon" />
              <span>Sign in</span>
            </NavLink>
          )}
        </nav>

        {isAuthenticated && (
          <div className="sidebar-footer">
            <div className="user-card">
              <span className="user-avatar" aria-hidden>
                {(user?.name || '?').slice(0, 1).toUpperCase()}
              </span>
              <span className="user-pill">
                <span className="user-name">{user?.name}</span>
                <small>{user?.role}</small>
              </span>
            </div>
            <button type="button" className="btn btn-ghost btn-block" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        )}
      </aside>

      <div className="main-wrap">
        <div className="main-toolbar" aria-hidden={sidebarOpen}>
          <button
            type="button"
            className="btn btn-secondary btn-menu-reopen"
            onClick={openSidebar}
            aria-label="Open navigation menu"
            tabIndex={sidebarOpen ? -1 : 0}
          >
            <IconMenu className="btn-leading-icon" />
            Menu
          </button>
        </div>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
