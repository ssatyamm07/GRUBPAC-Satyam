import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const workspace =
    user?.role === 'principal' ? '/principal' : user?.role === 'teacher' ? '/teacher' : null

  return (
    <div className="page home">
      <header className="hero">
        <h1>School content, on schedule</h1>
        <p className="hero-lead">
          Teachers upload slides; principals approve and queue them by subject. The live screen always
          shows the right piece of content for each class—automatically.
        </p>
        <div className="hero-actions">
          <Link to="/live" className="btn btn-primary">
            Open live broadcast
          </Link>
          {!isAuthenticated ? (
            <Link to="/login" className="btn btn-secondary">
              Staff sign in
            </Link>
          ) : (
            workspace && (
              <Link to={workspace} className="btn btn-secondary">
                Go to workspace
              </Link>
            )
          )}
        </div>
      </header>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-step">1</div>
          <h3>Teacher</h3>
          <p>
            Submit images with title and subject. Optionally set when content may go live so it only
            appears in the right window.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-step">2</div>
          <h3>Principal</h3>
          <p>
            Approve or reject with a reason, then place approved items on the rotation for each
            subject.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-step">3</div>
          <h3>Live</h3>
          <p>
            The public live page picks the current slot from the schedule and respects each item’s
            visibility window.
          </p>
        </div>
      </div>

      <section className="panel home-foot">
        <p className="text-muted small home-footnote">
          Run the API and this app together: <code>npm run dev</code> in <code>frontend/</code> (Vite
          proxies <code>/api</code> to your Express <code>PORT</code>). Override with{' '}
          <code>VITE_API_BASE</code> if needed.
        </p>
      </section>
    </div>
  )
}
