import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useDashboardData } from '../lib/useDashboardData'
import { useCurrentUser } from '../lib/useCurrentUser'
import { studentDashboardFallback } from '../lib/dashboardData'
import '../assets/dashboard.css'

const DAILY_LOG_STORAGE_KEY = 'pf_student_daily_logs'

function formatDateLabel(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getStudentIdentity() {
  try {
    const raw = sessionStorage.getItem('pf_user') || localStorage.getItem('pf_user')
    if (!raw) return 'student'
    const parsed = JSON.parse(raw)
    return parsed.email || parsed.id || parsed.name || 'student'
  } catch {
    return 'student'
  }
}

const navItems = [
  { icon: '⊞', label: 'Workspace' },
  { icon: '📁', label: 'My Project' },
  { icon: '✅', label: 'Tasks' },
  { icon: '📤', label: 'Submissions' },
  { icon: '💬', label: 'Messages' },
  { icon: '⚙️', label: 'Settings' },
]

export default function StudentDashboard() {
  const currentUser = useCurrentUser()
  const dashboard = useDashboardData('student', studentDashboardFallback)
  const [activeSection, setActiveSection] = useState('Workspace')
  const todayIso = new Date().toISOString().slice(0, 10)
  const studentIdentity = getStudentIdentity()
  
  const displayName = currentUser?.name || dashboard.profile.name
  const displayEmail = currentUser?.email || ''
  const displayInitials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || dashboard.profile.initials
  const displaySubtitle = displayEmail ? `${displayEmail}` : dashboard.profile.subtitle

  const [dailyForm, setDailyForm] = useState({
    date: todayIso,
    taskTitle: '',
    status: 'completed_on_time',
    progressGain: '',
    reason: '',
  })
  const [dailyFormError, setDailyFormError] = useState('')
  const [dailyLogs, setDailyLogs] = useState(() => {
    try {
      const raw = localStorage.getItem(`${DAILY_LOG_STORAGE_KEY}:${studentIdentity}`)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(`${DAILY_LOG_STORAGE_KEY}:${studentIdentity}`, JSON.stringify(dailyLogs))
  }, [dailyLogs, studentIdentity])

  const submissions = useMemo(
    () => [
      { title: 'Phase 1 Literature Review', status: 'Approved', date: 'Apr 05, 2026' },
      { title: 'Dataset Collection Summary', status: 'Approved', date: 'Apr 10, 2026' },
      { title: 'Phase 2 Report', status: 'Pending Review', date: 'Due Today' },
    ],
    []
  )

  const messages = useMemo(
    () => [
      { from: dashboard.project.coordinator, text: 'Share the updated accuracy plot before 5 PM.', when: 'Today, 11:20 AM' },
      { from: 'Team Channel', text: 'Demo practice moved to 4:30 PM in Lab 204.', when: 'Today, 9:05 AM' },
      { from: 'ProjectFlow', text: 'Reminder: Phase 2 report deadline is today.', when: 'Today, 8:00 AM' },
    ],
    [dashboard.project.coordinator]
  )

  const settings = useMemo(
    () => [
      { key: 'Notifications', value: 'Email + In-app' },
      { key: 'Preferred Language', value: 'English' },
      { key: 'Time Zone', value: 'Asia/Kolkata' },
      { key: 'Theme', value: 'Light' },
    ],
    []
  )

  const completionInsights = useMemo(() => {
    const totalGain = dailyLogs.reduce((sum, log) => sum + (Number(log.progressGain) || 0), 0)
    const uniqueActiveDays = new Set(
      dailyLogs
        .filter(log => Number(log.progressGain) > 0)
        .map(log => log.date)
    ).size

    const missedCount = dailyLogs.filter(log => log.status === 'not_done').length
    const earlyDoneCount = dailyLogs.filter(log => log.status === 'finished_early').length
    const currentProgress = Math.min(100, dashboard.project.progress + totalGain)
    const avgDailyGain = uniqueActiveDays > 0 ? totalGain / uniqueActiveDays : 0
    const remainingProgress = Math.max(0, 100 - currentProgress)
    const projectedDays = avgDailyGain > 0 ? Math.ceil(remainingProgress / avgDailyGain) : null
    const projectedDate = projectedDays !== null
      ? new Date(Date.now() + projectedDays * 24 * 60 * 60 * 1000)
      : null

    return {
      currentProgress,
      avgDailyGain,
      remainingProgress,
      projectedDays,
      projectedDate,
      missedCount,
      earlyDoneCount,
    }
  }, [dailyLogs, dashboard.project.progress])

  function updateDailyForm(field, value) {
    setDailyForm(prev => ({ ...prev, [field]: value }))
    if (dailyFormError) setDailyFormError('')
  }

  function submitDailyLog(e) {
    e.preventDefault()

    const title = dailyForm.taskTitle.trim()
    const reason = dailyForm.reason.trim()
    const gain = Number(dailyForm.progressGain || 0)
    const reasonMandatory = dailyForm.status === 'not_done' || dailyForm.status === 'finished_early'

    if (!title) {
      setDailyFormError('Task title is required for daily update.')
      return
    }

    if (Number.isNaN(gain) || gain < 0 || gain > 100) {
      setDailyFormError('Progress gain must be a number between 0 and 100.')
      return
    }

    if (reasonMandatory && !reason) {
      setDailyFormError('Reason is mandatory when work is not done today or finished early.')
      return
    }

    if (dailyForm.status === 'not_done' && gain > 0) {
      setDailyFormError('Progress gain must be 0 when today\'s work is not done.')
      return
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: dailyForm.date,
      taskTitle: title,
      status: dailyForm.status,
      progressGain: gain,
      reason,
      createdAt: new Date().toISOString(),
    }

    setDailyLogs(prev => [entry, ...prev])
    setDailyForm({
      date: todayIso,
      taskTitle: '',
      status: 'completed_on_time',
      progressGain: '',
      reason: '',
    })
  }

  const sectionTitleMap = {
    Workspace: dashboard.header.title,
    'My Project': 'My Project',
    Tasks: 'My Tasks',
    Submissions: 'My Submissions',
    Messages: 'Messages',
    Settings: 'Settings',
  }

  const sectionSubtitleMap = {
    Workspace: dashboard.header.subtitle,
    'My Project': `${dashboard.project.title} · ${dashboard.project.status}`,
    Tasks: `${dashboard.tasks.length} tracked tasks`,
    Submissions: `${submissions.length} submission records`,
    Messages: `${messages.length} recent conversations`,
    Settings: 'Manage your workspace preferences',
  }

  return (
    <div data-role="student" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        role={dashboard.profile.role}
        userName={displayName}
        userInitials={displayInitials}
        userSub={displaySubtitle}
        navItems={navItems}
        activeItem={activeSection}
        onNavSelect={setActiveSection}
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1 className="page-title">{sectionTitleMap[activeSection]}</h1>
            <p className="page-sub">{sectionSubtitleMap[activeSection]}</p>
          </div>
          <div className="topbar-actions">
            <button className="btn-outline" onClick={() => alert('Messages')}>💬 Message Coordinator</button>
            <button className="btn-primary" onClick={() => alert('Submit work')}>📤 Submit Work</button>
          </div>
        </header>

        <section className="kpi-grid">
          {dashboard.kpis.map((k, i) => (
            <div className="kpi-card" key={i}>
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
              <div className="kpi-body">
                <span className="kpi-value">{k.value}</span>
                <span className="kpi-label">{k.label}</span>
              </div>
              <span className={`kpi-trend ${k.trend}`}>{k.trendTxt}</span>
            </div>
          ))}
        </section>

        {activeSection === 'Workspace' && <div className="content-grid">
          {/* Project Detail */}
          <div className="card wide-card">
            <div className="card-head">
              <h2 className="card-title">My Project — {dashboard.project.title}</h2>
              <span className="badge badge-green">{dashboard.project.status}</span>
            </div>
            <div className="proj-detail-wrap">
              <div className="proj-detail-left">
                <p className="proj-desc-text">{dashboard.project.desc}</p>
                <div className="proj-meta-grid">
                  <div className="meta-item"><span className="meta-label">Coordinator</span><span className="meta-val">{dashboard.project.coordinator}</span></div>
                  <div className="meta-item"><span className="meta-label">Deadline</span><span className="meta-val">{dashboard.project.deadline}</span></div>
                  <div className="meta-item"><span className="meta-label">Team Size</span><span className="meta-val">{dashboard.project.teamSize}</span></div>
                  <div className="meta-item"><span className="meta-label">Department</span><span className="meta-val">{dashboard.project.department}</span></div>
                </div>
              </div>
              <div className="proj-detail-right">
                <span className="progress-label">Overall Progress</span>
                <div className="big-progress"><div className="big-progress-fill" style={{ width: `${dashboard.project.progress}%` }}></div></div>
                <span className="progress-pct">{dashboard.project.progress}%</span>
                <div className="milestone-list">
                  {dashboard.project.milestones.map((milestone, i) => (
                    <div className={`milestone ${milestone.state}`} key={i}>
                      {milestone.state === 'done' ? '✓' : milestone.state === 'active' ? '⟳' : '○'} {milestone.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">My Tasks</h2></div>
            <ul className="task-list">
              {dashboard.tasks.map((t, i) => (
                <li className={`task-item ${t.cls}`} key={i}>
                  <span className={`task-check ${t.checkCls}`}>{t.check}</span>
                  <div>
                    <strong>{t.title}</strong>
                    <span className={`task-sub${t.urgent ? ' urgent' : ''}`}>{t.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Announcements */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Announcements</h2></div>
            <ul className="activity-list">
              {dashboard.announcements.map((a, i) => (
                <li className="activity-item" key={i}>
                  <span className="act-dot" style={{ background: a.dot }}></span>
                  <div>{a.text}</div>
                  <span className="act-time">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>}

        {activeSection === 'My Project' && <div className="content-grid">
          <div className="card wide-card">
            <div className="card-head">
              <h2 className="card-title">{dashboard.project.title}</h2>
              <span className="badge badge-green">{dashboard.project.status}</span>
            </div>
            <div className="proj-detail-wrap">
              <div className="proj-detail-left">
                <p className="proj-desc-text">{dashboard.project.desc}</p>
                <div className="proj-meta-grid">
                  <div className="meta-item"><span className="meta-label">Coordinator</span><span className="meta-val">{dashboard.project.coordinator}</span></div>
                  <div className="meta-item"><span className="meta-label">Deadline</span><span className="meta-val">{dashboard.project.deadline}</span></div>
                  <div className="meta-item"><span className="meta-label">Team Size</span><span className="meta-val">{dashboard.project.teamSize}</span></div>
                  <div className="meta-item"><span className="meta-label">Department</span><span className="meta-val">{dashboard.project.department}</span></div>
                </div>
              </div>
              <div className="proj-detail-right">
                <span className="progress-label">Overall Progress</span>
                <div className="big-progress"><div className="big-progress-fill" style={{ width: `${dashboard.project.progress}%` }}></div></div>
                <span className="progress-pct">{dashboard.project.progress}%</span>
                <div className="milestone-list">
                  {dashboard.project.milestones.map((milestone, i) => (
                    <div className={`milestone ${milestone.state}`} key={i}>
                      {milestone.state === 'done' ? '✓' : milestone.state === 'active' ? '⟳' : '○'} {milestone.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>}

        {activeSection === 'Tasks' && <div className="content-grid">
          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Daily Work Update</h2></div>

            <form className="daily-log-form" onSubmit={submitDailyLog}>
              <div className="daily-form-grid">
                <label>
                  Date
                  <input type="date" value={dailyForm.date} onChange={e => updateDailyForm('date', e.target.value)} />
                </label>

                <label>
                  Task / Work item
                  <input
                    type="text"
                    placeholder="Example: Phase 2 report section"
                    value={dailyForm.taskTitle}
                    onChange={e => updateDailyForm('taskTitle', e.target.value)}
                  />
                </label>

                <label>
                  Daily status
                  <select value={dailyForm.status} onChange={e => updateDailyForm('status', e.target.value)}>
                    <option value="completed_on_time">Completed as planned</option>
                    <option value="not_done">Not done today</option>
                    <option value="finished_early">Finished before planned time</option>
                  </select>
                </label>

                <label>
                  Progress gain (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={dailyForm.progressGain}
                    onChange={e => updateDailyForm('progressGain', e.target.value)}
                  />
                </label>
              </div>

              <label className="daily-reason-field">
                Reason {dailyForm.status === 'not_done' || dailyForm.status === 'finished_early' ? '(Required)' : '(Optional)'}
                <textarea
                  rows="2"
                  placeholder="Provide reason when not done today or finished early"
                  value={dailyForm.reason}
                  onChange={e => updateDailyForm('reason', e.target.value)}
                />
              </label>

              {dailyFormError && <p className="daily-form-error">{dailyFormError}</p>}

              <div className="daily-form-actions">
                <button type="submit" className="btn-primary">Save Daily Update</button>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card-head"><h2 className="card-title">Completion Loop</h2></div>
            <div className="completion-loop">
              <div className="loop-row"><span>Current progress</span><strong>{completionInsights.currentProgress.toFixed(1)}%</strong></div>
              <div className="loop-row"><span>Average daily gain</span><strong>{completionInsights.avgDailyGain.toFixed(2)}% / day</strong></div>
              <div className="loop-row"><span>Pending progress</span><strong>{completionInsights.remainingProgress.toFixed(1)}%</strong></div>
              <div className="loop-row"><span>Days missed</span><strong>{completionInsights.missedCount}</strong></div>
              <div className="loop-row"><span>Early finishes</span><strong>{completionInsights.earlyDoneCount}</strong></div>
              <div className="loop-row">
                <span>Estimated completion day</span>
                <strong>
                  {completionInsights.projectedDate
                    ? completionInsights.projectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Need daily progress data'}
                </strong>
              </div>
            </div>
          </div>

          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Daily Update History</h2></div>
            {dailyLogs.length === 0 && <p className="empty-state">No daily updates yet. Add today\'s update to start tracking completion day.</p>}
            {dailyLogs.length > 0 && <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Gain</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {dailyLogs.map(log => (
                  <tr key={log.id}>
                    <td>{formatDateLabel(log.date)}</td>
                    <td>{log.taskTitle}</td>
                    <td>
                      <span className={`badge ${log.status === 'not_done' ? 'badge-red' : log.status === 'finished_early' ? 'badge-amber' : 'badge-green'}`}>
                        {log.status === 'completed_on_time' ? 'Completed' : log.status === 'not_done' ? 'Not done' : 'Finished early'}
                      </span>
                    </td>
                    <td>{Number(log.progressGain).toFixed(1)}%</td>
                    <td>{log.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>

          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">My Tasks</h2></div>
            <ul className="task-list">
              {dashboard.tasks.map((t, i) => (
                <li className={`task-item ${t.cls}`} key={i}>
                  <span className={`task-check ${t.checkCls}`}>{t.check}</span>
                  <div>
                    <strong>{t.title}</strong>
                    <span className={`task-sub${t.urgent ? ' urgent' : ''}`}>{t.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>}

        {activeSection === 'Submissions' && <div className="content-grid">
          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Submission History</h2></div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item, i) => (
                  <tr key={i}>
                    <td>{item.title}</td>
                    <td>
                      <span className={`badge ${item.status === 'Approved' ? 'badge-green' : 'badge-amber'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}

        {activeSection === 'Messages' && <div className="content-grid">
          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Recent Messages</h2></div>
            <ul className="activity-list">
              {messages.map((m, i) => (
                <li className="activity-item" key={i}>
                  <span className="act-dot" style={{ background: '#1a3faa' }}></span>
                  <div><strong>{m.from}</strong> · {m.text}</div>
                  <span className="act-time">{m.when}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>}

        {activeSection === 'Settings' && <div className="content-grid">
          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Profile Settings</h2></div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((item, i) => (
                  <tr key={i}>
                    <td>{item.key}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}
      </main>
    </div>
  )
}
