import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, uploadContent } from '../api/client'

function isoToLocalDatetime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function StatusBadge({ status }) {
  const c =
    status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'
  return <span className={`badge badge-${c}`}>{status}</span>
}

export default function TeacherPortal() {
  const { token, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [file, setFile] = useState(null)
  const [fileDrag, setFileDrag] = useState(false)

  const [windowId, setWindowId] = useState(null)
  const [wStart, setWStart] = useState('')
  const [wEnd, setWEnd] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('/api/content/my', { token })
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  if (!token || user?.role !== 'teacher') {
    return <Navigate to="/" replace />
  }

  const onUpload = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    if ((startTime && !endTime) || (!startTime && endTime)) {
      setMessage({ type: 'error', text: 'Set both visibility times or leave both empty.' })
      return
    }
    const fd = new FormData()
    fd.append('title', title)
    fd.append('subject', subject)
    fd.append('description', description)
    if (startTime && endTime) {
      fd.append('start_time', new Date(startTime).toISOString())
      fd.append('end_time', new Date(endTime).toISOString())
    }
    if (!file) {
      setMessage({ type: 'error', text: 'Choose an image file.' })
      return
    }
    fd.append('file', file)
    try {
      await uploadContent(token, fd)
      setMessage({ type: 'ok', text: 'Upload submitted for review.' })
      setTitle('')
      setSubject('')
      setDescription('')
      setStartTime('')
      setEndTime('')
      setFile(null)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed' })
    }
  }

  const saveWindow = async (e) => {
    e.preventDefault()
    if (windowId == null) return
    if (!wStart || !wEnd) {
      setMessage({ type: 'error', text: 'Enter both start and end, or use Clear window.' })
      return
    }
    try {
      await api(`/api/content/${windowId}/window`, {
        method: 'PATCH',
        token,
        json: {
          start_time: new Date(wStart).toISOString(),
          end_time: new Date(wEnd).toISOString(),
        },
      })
      setWindowId(null)
      setMessage({ type: 'ok', text: 'Schedule window updated.' })
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Update failed' })
    }
  }

  const clearWindow = async () => {
    if (windowId == null) return
    try {
      await api(`/api/content/${windowId}/window`, {
        method: 'PATCH',
        token,
        json: { start_time: null, end_time: null },
      })
      setWindowId(null)
      setMessage({ type: 'ok', text: 'Visibility window cleared.' })
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Clear failed' })
    }
  }

  const openWindow = (row) => {
    setWindowId(row.id)
    setWStart(isoToLocalDatetime(row.start_time))
    setWEnd(isoToLocalDatetime(row.end_time))
  }

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Teacher</p>
        <h1>Workspace</h1>
        <p className="text-muted">Upload materials and manage visibility windows.</p>
      </header>

      {message.text && (
        <div className={`alert alert-${message.type === 'ok' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <section className="panel">
        <h2>New upload</h2>
        <p className="panel-desc">
          Images only. Your principal reviews every submission before it can go on the schedule.
        </p>
        <form onSubmit={onUpload} className="form-stacked-fields form-teacher-upload">
          <fieldset className="form-section">
            <legend className="form-section-title">Basics</legend>
            <div className="form-row-2">
              <label className="field">
                <span className="field-label">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Short headline for the live screen"
                />
                <span className="field-hint">Shown as the main heading on air.</span>
              </label>
              <label className="field">
                <span className="field-label">Subject</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. Maths"
                />
                <span className="field-hint">Must match the subject used when scheduling.</span>
              </label>
            </div>
            <label className="field">
              <span className="field-label">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Chapter 3 key takeaways"
              />
              <span className="field-hint">Optional. Appears under the title when provided.</span>
            </label>
          </fieldset>

          <fieldset className="form-section">
            <legend className="form-section-title">Visibility window (optional)</legend>
            <p className="form-section-intro">
              Limit when this slide may go live. If you set one time, set both start and end.
            </p>
            <div className="form-row-2">
              <label className="field">
                <span className="field-label">Visible from</span>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <span className="field-hint">When the slide may start appearing.</span>
              </label>
              <label className="field">
                <span className="field-label">Visible until</span>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
                <span className="field-hint">When the slide stops being eligible.</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend className="form-section-title">Slide image</legend>
            <label className="field">
              <span className="field-label">Image file</span>
              <div
                className={`file-input-zone${file ? ' has-file' : ''}${fileDrag ? ' drag-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDragEnter={(e) => {
                  e.preventDefault()
                  setFileDrag(true)
                }}
                onDragLeave={() => setFileDrag(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setFileDrag(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f && /^image\/(jpeg|png|gif)$/i.test(f.type)) setFile(f)
                }}
              >
                <input
                  type="file"
                  className="file-input-native"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <span className="file-input-prompt">
                  {file
                    ? file.name
                    : 'Drop an image here, or click to choose a file from your device'}
                </span>
              </div>
              <span className="field-hint">JPG, PNG, or GIF · maximum 10 MB.</span>
            </label>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Submit for approval
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Your content</h2>
          <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="loading-row" role="status">
            <span className="spinner" aria-hidden />
            Loading your uploads…
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </div>
            <p>No uploads yet</p>
            <p className="text-muted small">Submit your first image above to send it for review.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Window</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.title}</td>
                    <td>{row.subject}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="text-muted small">
                      {row.start_time && row.end_time
                        ? `${row.start_time.slice(0, 10)} → ${row.end_time.slice(0, 10)}`
                        : 'Not set'}
                    </td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => openWindow(row)}
                      >
                        Edit window
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {windowId != null && (
        <div className="modal-backdrop" role="presentation" onClick={() => setWindowId(null)}>
          <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Visibility window (content #{windowId})</h3>
            <p className="modal-lead">
              Save stores both times in UTC. Clear removes the window so scheduling ignores these
              dates.
            </p>
            <form onSubmit={saveWindow} className="form-stack">
              <div className="form-row-2">
                <label className="field">
                  <span className="field-label">Start</span>
                  <input
                    type="datetime-local"
                    value={wStart}
                    onChange={(e) => setWStart(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">End</span>
                  <input
                    type="datetime-local"
                    value={wEnd}
                    onChange={(e) => setWEnd(e.target.value)}
                  />
                </label>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-danger" onClick={clearWindow}>
                  Clear window
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setWindowId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
