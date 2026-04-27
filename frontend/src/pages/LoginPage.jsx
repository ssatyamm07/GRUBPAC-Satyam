import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (location.pathname !== '/login') return
    const target =
      from && from !== '/login'
        ? from
        : user.role === 'principal'
          ? '/principal'
          : user.role === 'teacher'
            ? '/teacher'
            : '/live'
    navigate(target, { replace: true })
  }, [isAuthenticated, user, from, navigate, location.pathname])

  if (isAuthenticated && user) {
    return (
      <div className="page page-center">
        <div className="panel panel-narrow panel-login">
          <p className="text-muted" role="status">
            Redirecting...
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = await api('/api/auth/login', {
        method: 'POST',
        json: { email, password },
        auth: false,
      })
      if (!body?.token) {
        setError('Invalid response from server')
        return
      }
      login(body)
      const role = String(body.role || '')
        .trim()
        .toLowerCase()
      navigate(role === 'principal' ? '/principal' : '/teacher', { replace: true })
    } catch (err) {
      setError(err.body?.message || err.body?.error || err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-center">
      <div className="panel panel-narrow panel-login">
        <Link to="/" className="login-brand">
          <span className="login-brand-mark" aria-hidden>G</span>
          <span className="login-brand-text">
            <strong>Grubpac</strong>
            <span>Staff access</span>
          </span>
        </Link>
        <h1>Sign in</h1>
        <p className="panel-desc">Use your teacher or principal account.</p>
        <form onSubmit={handleSubmit} className="form-stack">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="field-hint">School account you registered with.</span>
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <span className="field-hint">At least 8 characters.</span>
          </label>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden />
                Signing in...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
