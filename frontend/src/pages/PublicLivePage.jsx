import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, apiBase } from '../api/client'

function teacherOptionLabel(t, teachers) {
  const sameName = teachers.filter((x) => x.name === t.name).length > 1
  return sameName ? `${t.name} (${t.email})` : t.name
}

export default function PublicLivePage() {
  const [teachers, setTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [teachersError, setTeachersError] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [subject, setSubject] = useState('')
  const [subjects, setSubjects] = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadTeachers = useCallback(async () => {
    setTeachersError('')
    setTeachersLoading(true)
    try {
      const list = await api('/api/public/teachers', { auth: false })
      setTeachers(Array.isArray(list) ? list : [])
    } catch (err) {
      setTeachers([])
      setTeachersError(err.message || 'Could not load teachers')
    } finally {
      setTeachersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTeachers()
  }, [loadTeachers])

  useEffect(() => {
    setSubject('')
    setSubjects([])
    if (!teacherId) return

    let cancelled = false
    ;(async () => {
      setSubjectsLoading(true)
      try {
        const list = await api(`/api/public/teachers/${teacherId}/subjects`, { auth: false })
        if (!cancelled && Array.isArray(list)) setSubjects(list)
      } catch {
        if (!cancelled) setSubjects([])
      } finally {
        if (!cancelled) setSubjectsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [teacherId])

  const fetchLive = async () => {
    setError('')
    setData(null)
    if (!teacherId) {
      setError('Choose a teacher from the list.')
      return
    }
    setLoading(true)
    try {
      const q = subject.trim() ? `?subject=${encodeURIComponent(subject.trim())}` : ''
      const res = await api(`/api/public/live/${teacherId}${q}`, { auth: false })
      setData(res)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const isNoContent = data && data.message === 'No content available'
  const isNoTeacher = data && data.message === 'Teacher not found'
  const content = data && !isNoContent && !isNoTeacher && data.id ? data : null

  const teacherLabels = useMemo(
    () =>
      teachers.map((t) => ({
        ...t,
        label: teacherOptionLabel(t, teachers),
      })),
    [teachers]
  )

  return (
    <div className="page page-live">
      <header className="page-header">
        <p className="eyebrow">Public</p>
        <h1>Live broadcast</h1>
        <p className="text-muted">What is on air for a teacher right now (optionally filtered by subject).</p>
      </header>

      <section className="panel panel-live-lookup">
        <h2 className="panel-inline-title">Lookup</h2>
        <p className="panel-desc">
          Choose a teacher from the roster, then optionally narrow by subject. If two people share the
          same name, their email appears in the list.
        </p>
        {teachersError && (
          <div className="alert alert-error">
            {teachersError}{' '}
            <button type="button" className="btn btn-ghost btn-inline-retry" onClick={loadTeachers}>
              Retry
            </button>
          </div>
        )}
        <form
          className="live-lookup-form"
          onSubmit={(e) => {
            e.preventDefault()
            fetchLive()
          }}
        >
          <div className="live-lookup-grid">
            <label className="field">
              <span className="field-label">Teacher</span>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                disabled={teachersLoading || teachers.length === 0}
              >
                <option value="">
                  {teachersLoading ? 'Loading teachers...' : teachers.length === 0 ? 'No teachers in roster' : 'Choose a teacher...'}
                </option>
                {teacherLabels.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="field-hint">Anyone with the teacher role in Grubpac.</span>
            </label>
            <label className="field">
              <span className="field-label">Subject (optional)</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!teacherId || teachersLoading || subjectsLoading}
              >
                <option value="">
                  {!teacherId
                    ? 'Choose a teacher first...'
                    : subjectsLoading
                      ? 'Loading subjects...'
                      : 'All subjects (full rotation)'}
                </option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                {`Subjects come from this teacher's schedule. Leave as "All subjects" to use the full rotation.`}
              </span>
            </label>
            <div className="live-submit-cell">
              <button
                type="submit"
                className="btn btn-primary btn-live-submit"
                disabled={loading || teachersLoading || teachers.length === 0}
              >
                {loading ? 'Loading...' : 'Show now'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {isNoTeacher && (
        <div className="empty-state empty-state-muted">
          <p>No teacher matched that lookup</p>
          <p className="text-muted small">Try another teacher from the list.</p>
        </div>
      )}

      {isNoContent && (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="7"
                width="15"
                height="10"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.75"
                opacity="0.55"
              />
              <path
                d="M17 12l4-3v6l-4-3"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
                opacity="0.55"
              />
            </svg>
          </div>
          <p>Nothing on air for this teacher and subject</p>
          <p className="text-muted small">
            Confirm the item is approved, on the schedule, and the visibility window includes now.
          </p>
        </div>
      )}

      {content && (
        <article className="content-card content-card-live">
          <div className="content-card-body">
            <h2>{content.title}</h2>
            <p className="content-meta">
              <span className="content-meta-pill">{content.subject}</span>
            </p>
            {content.description && <p className="content-desc">{content.description}</p>}
          </div>
          {content.file_path && (
            <figure className="content-media">
              <img
                src={
                  content.file_path.startsWith('http')
                    ? content.file_path
                    : `${apiBase() || ''}/${content.file_path.replace(/^\//, '')}`
                }
                alt=""
              />
            </figure>
          )}
        </article>
      )}
    </div>
  )
}
