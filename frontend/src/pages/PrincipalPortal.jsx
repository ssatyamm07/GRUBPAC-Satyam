import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

function StatusBadge({ status }) {
  const c =
    status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'
  return <span className={`badge badge-${c}`}>{status}</span>
}

export default function PrincipalPortal() {
  const { token, user } = useAuth()
  const [tab, setTab] = useState('pending')
  const [allRows, setAllRows] = useState([])
  const [pendingRows, setPendingRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [rejectId, setRejectId] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const [schCid, setSchCid] = useState('')
  const [schSub, setSchSub] = useState('')
  const [schOrd, setSchOrd] = useState(1)
  const [schDur, setSchDur] = useState(5)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [all, pending] = await Promise.all([
        api('/api/approval/all', { token }),
        api('/api/approval/pending', { token }),
      ])
      setAllRows(Array.isArray(all) ? all : [])
      setPendingRows(Array.isArray(pending) ? pending : [])
    } catch {
      setAllRows([])
      setPendingRows([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  if (!token || user?.role !== 'principal') {
    return <Navigate to="/" replace />
  }

  const approve = async (id) => {
    setMessage({ type: '', text: '' })
    try {
      await api(`/api/approval/approve/${id}`, { method: 'PATCH', token })
      setMessage({ type: 'ok', text: `Content ${id} approved.` })
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Approve failed' })
    }
  }

  const reject = async (e) => {
    e.preventDefault()
    if (!rejectId || !rejectReason.trim()) {
      setMessage({ type: 'error', text: 'Pick content to reject and enter a reason.' })
      return
    }
    try {
      await api(`/api/approval/reject/${rejectId}`, {
        method: 'PATCH',
        token,
        json: { reason: rejectReason },
      })
      setMessage({ type: 'ok', text: `Content ${rejectId} rejected.` })
      setRejectId('')
      setRejectReason('')
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Reject failed' })
    }
  }

  const addSchedule = async (e) => {
    e.preventDefault()
    try {
      await api('/api/schedule', {
        method: 'POST',
        token,
        json: {
          content_id: Number(schCid),
          subject: schSub.trim(),
          rotation_order: Number(schOrd),
          duration: Number(schDur),
        },
      })
      setMessage({ type: 'ok', text: 'Added to broadcast schedule.' })
      setSchCid('')
      setSchSub('')
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Schedule failed' })
    }
  }

  const rows = tab === 'pending' ? pendingRows : allRows

  const approvedRows = useMemo(
    () => allRows.filter((r) => r.status === 'approved'),
    [allRows]
  )

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Principal</p>
        <h1>Console</h1>
        <p className="text-muted">Review submissions and manage the broadcast queue.</p>
      </header>

      {message.text && (
        <div className={`alert alert-${message.type === 'ok' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <button
          type="button"
          className={tab === 'pending' ? 'tab active' : 'tab'}
          onClick={() => setTab('pending')}
        >
          Pending ({pendingRows.length})
        </button>
        <button
          type="button"
          className={tab === 'all' ? 'tab active' : 'tab'}
          onClick={() => setTab('all')}
        >
          All content ({allRows.length})
        </button>
        <button type="button" className="btn btn-secondary tab-refresh" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <section className="panel">
        {loading ? (
          <div className="loading-row" role="status">
            <span className="spinner" aria-hidden />
            Loading content...
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12h6M9 16h6M8 3h8l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7l4-4Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.55"
                />
              </svg>
            </div>
            <p>Nothing in this tab</p>
            <p className="text-muted small">Switch tabs or refresh after new teacher uploads.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="table-title">{row.title}</span>
                      <span className="table-sub text-muted small">#{row.id}</span>
                    </td>
                    <td>{row.subject}</td>
                    <td>{row.Teacher?.name ?? '-'}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      {row.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => approve(row.id)}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Reject submission</h2>
        <p className="panel-desc">
          Rejection requires a clear reason so teachers know what to fix on the next upload.
        </p>
        <form onSubmit={reject} className="form-stacked-fields">
          <div className="form-row-2">
            <label className="field">
              <span className="field-label">Content</span>
              <select
                value={rejectId}
                onChange={(e) => setRejectId(e.target.value)}
                required
              >
                <option value="">Choose a submission...</option>
                {pendingRows.map((row) => (
                  <option key={row.id} value={String(row.id)}>
                    {row.title} | {row.subject} ({row.Teacher?.name ?? 'teacher'})
                  </option>
                ))}
              </select>
              <span className="field-hint">Pending submissions only.</span>
            </label>
            <label className="field">
              <span className="field-label">Reason</span>
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Image resolution too low"
                required
              />
              <span className="field-hint">The teacher sees this message.</span>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-danger">
              Reject content
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Broadcast schedule</h2>
        <p className="panel-desc">
          Link approved content into a subject rotation. Subject spelling must match the content row.
        </p>
        <form onSubmit={addSchedule} className="form-stacked-fields">
          <fieldset className="form-section">
            <legend className="form-section-title">Slot</legend>
            <div className="form-grid">
              <label className="field full">
                <span className="field-label">Content</span>
                <select
                  value={schCid}
                  onChange={(e) => {
                    const id = e.target.value
                    setSchCid(id)
                    const row = approvedRows.find((r) => String(r.id) === id)
                    if (row) setSchSub(row.subject)
                  }}
                  required
                >
                  <option value="">Choose approved content...</option>
                  {approvedRows.map((row) => (
                    <option key={row.id} value={String(row.id)}>
                      {row.title} | {row.subject} | {row.Teacher?.name ?? 'teacher'}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Approved only. Subject fills in when you choose a row.</span>
              </label>
              <label className="field">
                <span className="field-label">Subject</span>
                <input
                  value={schSub}
                  onChange={(e) => setSchSub(e.target.value)}
                  required
                  placeholder="e.g. maths"
                />
                <span className="field-hint">Must match the content row (usually auto-filled).</span>
              </label>
              <label className="field">
                <span className="field-label">Rotation order</span>
                <input
                  type="number"
                  min={1}
                  value={schOrd}
                  onChange={(e) => setSchOrd(e.target.value)}
                  required
                />
                <span className="field-hint">Lower numbers run earlier in the loop.</span>
              </label>
              <label className="field">
                <span className="field-label">Duration (minutes)</span>
                <input
                  type="number"
                  min={1}
                  value={schDur}
                  onChange={(e) => setSchDur(e.target.value)}
                  required
                />
                <span className="field-hint">How long this slide stays on screen each cycle.</span>
              </label>
            </div>
          </fieldset>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Add to schedule
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
