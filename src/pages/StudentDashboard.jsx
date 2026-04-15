import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import DatePicker from '../components/DatePicker'
import { useDashboardData } from '../lib/useDashboardData'
import { useCurrentUser } from '../lib/useCurrentUser'
import { studentDashboardFallback } from '../lib/dashboardData'
import '../assets/dashboard.css'

const DAILY_LOG_STORAGE_KEY = 'pf_student_daily_logs'
const COMPLETED_TASKS_KEY = 'pf_student_completed_tasks'
const DRIVE_FILES_KEY = 'pf_student_drive_files'
const RESEARCH_TASKS_KEY = 'pf_student_research_tasks'
const RESEARCH_LOGS_KEY = 'pf_student_research_logs'
const TASK_COMMENTS_KEY = 'pf_student_task_comments'
const NOTIFICATIONS_KEY = 'pf_student_notifications'

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
  { icon: '📊', label: 'Dashboard' },
  { icon: '�', label: 'Profile' },
  { icon: '�📈', label: 'Analytics' },
  { icon: '✅', label: 'Tasks' },
  { icon: '📋', label: 'Kanban' },
  { icon: '📝', label: 'Research Log' },
  { icon: '☁️', label: 'Repository' },
  { icon: '📤', label: 'Submissions' },
  { icon: '💬', label: 'Messages' },
]

export default function StudentDashboard() {
  const currentUser = useCurrentUser()
  const dashboard = useDashboardData('student', studentDashboardFallback)
  const [activeSection, setActiveSection] = useState('Dashboard')
  const todayIso = new Date().toISOString().slice(0, 10)
  const studentIdentity = getStudentIdentity()
  
  const displayName = currentUser?.name || dashboard.profile.name
  const displayEmail = currentUser?.email || ''
  const displayInitials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || dashboard.profile.initials
  const displaySubtitle = displayEmail ? displayEmail : currentUser?.role ? currentUser.role : dashboard.profile.subtitle

  const loginStorageType = localStorage.getItem('pf_user') ? 'Remember Me (local)' : sessionStorage.getItem('pf_user') ? 'Session Only' : 'Not stored'
  const loginMethod = currentUser?.provider || currentUser?.authMethod || 'Email & Password'

  const profileDetails = {
    name: displayName,
    email: displayEmail || 'Not available',
    role: currentUser?.role || dashboard.profile.role || 'Student',
    subtitle: currentUser?.department ? `${currentUser.department}` : dashboard.profile.subtitle || 'Student',
    department: currentUser?.department || dashboard.project.department || 'Research',
    supervisor: dashboard.project.coordinator || 'Faculty Mentor',
    project: dashboard.project.title || 'N/A',
    deadline: dashboard.project.deadline || 'N/A',
    phone: currentUser?.phone || 'Not available',
    loginMethod,
    sessionType: loginStorageType,
  }

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

  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(`${COMPLETED_TASKS_KEY}:${studentIdentity}`)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(`${COMPLETED_TASKS_KEY}:${studentIdentity}`, JSON.stringify(completedTasks))
  }, [completedTasks, studentIdentity])

  function toggleTaskComplete(taskTitle) {
    setCompletedTasks(prev => {
      if (prev.includes(taskTitle)) {
        return prev.filter(t => t !== taskTitle)
      } else {
        return [...prev, taskTitle]
      }
    })
  }

  const [driveFiles, setDriveFiles] = useState(() => {
    try {
      const raw = localStorage.getItem(`${DRIVE_FILES_KEY}:${studentIdentity}`)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(`${DRIVE_FILES_KEY}:${studentIdentity}`, JSON.stringify(driveFiles))
  }, [driveFiles, studentIdentity])

  const [driveForm, setDriveForm] = useState({
    fileName: '',
    fileType: 'github',
    link: '',
    description: '',
  })

  function addDriveFile(e) {
    e.preventDefault()
    if (!driveForm.fileName.trim() || !driveForm.link.trim()) {
      alert('Please fill in file name and link')
      return
    }

    const newFile = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...driveForm,
      createdAt: new Date().toISOString(),
    }

    setDriveFiles(prev => [newFile, ...prev])
    setDriveForm({ fileName: '', fileType: 'github', link: '', description: '' })
  }

  function deleteDriveFile(fileId) {
    setDriveFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(`${NOTIFICATIONS_KEY}:${studentIdentity}`)
      return raw ? JSON.parse(raw) : {
        enableEmail: true,
        enableInApp: true,
        reminderFrequency: 'Daily',
        milestoneAlerts: true,
        submissionUpdates: true,
      }
    } catch {
      return {
        enableEmail: true,
        enableInApp: true,
        reminderFrequency: 'Daily',
        milestoneAlerts: true,
        submissionUpdates: true,
      }
    }
  })

  useEffect(() => {
    localStorage.setItem(`${NOTIFICATIONS_KEY}:${studentIdentity}`, JSON.stringify(notificationSettings))
  }, [notificationSettings, studentIdentity])

  function updateNotificationSetting(key, value) {
    setNotificationSettings(prev => ({ ...prev, [key]: value }))
  }

  // Research Logs (Enhanced Daily Logs)
  const [researchLogs, setResearchLogs] = useState(() => {
    try {
      const raw = localStorage.getItem(`${RESEARCH_LOGS_KEY}:${studentIdentity}`)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(`${RESEARCH_LOGS_KEY}:${studentIdentity}`, JSON.stringify(researchLogs))
  }, [researchLogs, studentIdentity])

  const [researchLogForm, setResearchLogForm] = useState({
    date: todayIso,
    taskTitle: '',
    description: '',
    hoursSpent: '',
    progressPercentage: '',
    status: 'ongoing',
    issuesFaced: '',
  })

  function addResearchLog(e) {
    e.preventDefault()
    if (!researchLogForm.taskTitle.trim() || !researchLogForm.hoursSpent) {
      alert('Please fill in task title and hours spent')
      return
    }

    const hours = parseFloat(researchLogForm.hoursSpent)
    if (isNaN(hours) || hours < 0) {
      alert('Hours spent must be a valid positive number')
      return
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: researchLogForm.date,
      taskTitle: researchLogForm.taskTitle,
      description: researchLogForm.description,
      hoursSpent: hours,
      progressPercentage: parseFloat(researchLogForm.progressPercentage) || 0,
      status: researchLogForm.status,
      issuesFaced: researchLogForm.issuesFaced,
      createdAt: new Date().toISOString(),
    }

    setResearchLogs(prev => [entry, ...prev])
    setResearchLogForm({
      date: todayIso,
      taskTitle: '',
      description: '',
      hoursSpent: '',
      progressPercentage: '',
      status: 'ongoing',
      issuesFaced: '',
    })
  }

  // Calculate research statistics
  const researchStats = useMemo(() => {
    const totalHours = researchLogs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0)
    const currentWeekLogs = researchLogs.filter(log => {
      const logDate = new Date(log.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return logDate >= weekAgo
    })
    const weeklyHours = currentWeekLogs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0)
    const avgDailyProgress = researchLogs.length > 0 
      ? (researchLogs.reduce((sum, log) => sum + (log.progressPercentage || 0), 0) / researchLogs.length) 
      : 0

    return { totalHours, weeklyHours, avgDailyProgress, totalSessions: researchLogs.length }
  }, [researchLogs])

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

    const allDates = dailyLogs.map(log => log.date)
    const firstLogDate = allDates.length ? new Date(Math.min(...allDates.map(d => new Date(`${d}T00:00:00`).getTime()))) : null
    const totalSpanDays = firstLogDate
      ? Math.max(1, Math.floor((Date.now() - firstLogDate.getTime()) / (24 * 60 * 60 * 1000)) + 1)
      : 1
    const consistency = totalSpanDays > 0 ? Math.round((uniqueActiveDays / totalSpanDays) * 100) : 0

    return {
      currentProgress,
      avgDailyGain,
      remainingProgress,
      projectedDays,
      projectedDate,
      missedCount,
      earlyDoneCount,
      uniqueActiveDays,
      totalSpanDays,
      consistency,
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
    Dashboard: 'Research Overview',
    Profile: 'My Profile',
    Analytics: 'Progress Analytics',
    Tasks: 'Research Tasks',
    Kanban: 'Task Kanban Board',
    'Research Log': 'Research Work Log',
    Repository: 'Research Repository',
    Submissions: 'My Submissions',
    Messages: 'Messages',
  }

  const sectionSubtitleMap = {
    Dashboard: 'Project progress and activity overview',
    Profile: 'View and manage your student profile details',
    Analytics: 'Detailed progress, consistency, and projection metrics',
    Tasks: `${dashboard.tasks.length} research tasks tracked`,
    Kanban: 'Drag tasks across workflow stages',
    'Research Log': `${dailyLogs.length} work sessions logged`,
    Repository: `${driveFiles.length} files and resources`,
    Submissions: `${submissions.length} submission records`,
    Messages: `${messages.length} recent conversations`,
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

        {activeSection === 'Dashboard' && <div className="content-grid">
          {/* Research KPIs */}
          <section className="kpi-grid" style={{ gridColumn: 'span 2' }}>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#eef2ff', color: '#1a3faa' }}>📋</div>
              <div className="kpi-body">
                <span className="kpi-value">{dashboard.tasks.length}</span>
                <span className="kpi-label">Total Tasks</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#dcfce7', color: '#15803d' }}>✓</div>
              <div className="kpi-body">
                <span className="kpi-value">{completedTasks.length}</span>
                <span className="kpi-label">Completed</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>⟳</div>
              <div className="kpi-body">
                <span className="kpi-value">{dashboard.tasks.length - completedTasks.length}</span>
                <span className="kpi-label">In Progress</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>🔔</div>
              <div className="kpi-body">
                <span className="kpi-value">2</span>
                <span className="kpi-label">Due Today</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#fef9c3', color: '#92400e' }}>⏱️</div>
              <div className="kpi-body">
                <span className="kpi-value">{researchStats.weeklyHours.toFixed(1)}</span>
                <span className="kpi-label">Hours This Week</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>📊</div>
              <div className="kpi-body">
                <span className="kpi-value">{researchStats.avgDailyProgress.toFixed(0)}%</span>
                <span className="kpi-label">Avg Progress</span>
              </div>
            </div>
          </section>

          {/* Project Overview */}
          <div className="card wide-card">
            <div className="card-head">
              <h2 className="card-title">Research Project</h2>
              <span className="badge badge-green">{dashboard.project.status}</span>
            </div>
            <div className="proj-detail-wrap">
              <div className="proj-detail-left">
                <p className="proj-desc-text">{dashboard.project.desc}</p>
                <div className="proj-meta-grid">
                  <div className="meta-item"><span className="meta-label">Faculty Guide</span><span className="meta-val">{dashboard.project.coordinator}</span></div>
                  <div className="meta-item"><span className="meta-label">Final Deadline</span><span className="meta-val">{dashboard.project.deadline}</span></div>
                  <div className="meta-item"><span className="meta-label">Team Members</span><span className="meta-val">{dashboard.project.teamSize}</span></div>
                  <div className="meta-item"><span className="meta-label">Department</span><span className="meta-val">{dashboard.project.department}</span></div>
                </div>
              </div>
              <div className="proj-detail-right">
                <span className="progress-label">Overall Progress</span>
                <div className="big-progress"><div className="big-progress-fill" style={{ width: `${dashboard.project.progress}%` }}></div></div>
                <span className="progress-pct">{dashboard.project.progress}%</span>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card wide-card notification-settings-card">
            <div className="card-head"><h2 className="card-title">Notification Settings</h2></div>
            <div className="notification-settings-grid">
              <label className="setting-row">
                <span>Email alerts</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.enableEmail}
                  onChange={e => updateNotificationSetting('enableEmail', e.target.checked)}
                />
              </label>

              <label className="setting-row">
                <span>In-app notifications</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.enableInApp}
                  onChange={e => updateNotificationSetting('enableInApp', e.target.checked)}
                />
              </label>

              <label className="setting-row">
                <span>Reminder frequency</span>
                <select
                  value={notificationSettings.reminderFrequency}
                  onChange={e => updateNotificationSetting('reminderFrequency', e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="None">None</option>
                </select>
              </label>

              <label className="setting-row">
                <span>Milestone alerts</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.milestoneAlerts}
                  onChange={e => updateNotificationSetting('milestoneAlerts', e.target.checked)}
                />
              </label>

              <label className="setting-row">
                <span>Submission updates</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.submissionUpdates}
                  onChange={e => updateNotificationSetting('submissionUpdates', e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Recent Activity</h2></div>
            <ul className="activity-list">
              {researchLogs.slice(0, 4).map((log, i) => (
                <li className="activity-item" key={i}>
                  <span className="act-dot" style={{ background: '#1a3faa' }}></span>
                  <div><strong>{log.taskTitle}</strong> · {log.hoursSpent}h logged</div>
                  <span className="act-time">{new Date(log.date).toLocaleDateString()}</span>
                </li>
              ))}
              {researchLogs.length === 0 && <p className="empty-state">No activity yet</p>}
            </ul>
          </div>

          {/* Milestones */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Milestones</h2></div>
            <div className="milestone-list">
              {dashboard.project.milestones.map((milestone, i) => (
                <div className={`milestone ${milestone.state}`} key={i}>
                  {milestone.state === 'done' ? '✓' : milestone.state === 'active' ? '⟳' : '○'} {milestone.text}
                </div>
              ))}
            </div>
          </div>
        </div>}

        {activeSection === 'Profile' && <div className="content-grid">
          <div className="card wide-card profile-card">
            <div className="card-head"><h2 className="card-title">My Profile</h2></div>
            <div className="profile-grid">
              <div className="profile-avatar-card">
                <div className="profile-avatar">{displayInitials}</div>
                <div className="profile-name-group">
                  <h3>{profileDetails.name}</h3>
                  <p className="profile-role">{profileDetails.role}</p>
                </div>
              </div>
              <div className="profile-info-grid">
                <div className="profile-info-item"><span>Email</span><strong>{profileDetails.email}</strong></div>
                <div className="profile-info-item"><span>Project</span><strong>{profileDetails.project}</strong></div>
                <div className="profile-info-item"><span>Department</span><strong>{profileDetails.department}</strong></div>
                <div className="profile-info-item"><span>Supervisor</span><strong>{profileDetails.supervisor}</strong></div>
                <div className="profile-info-item"><span>Student Status</span><strong>{profileDetails.subtitle}</strong></div>
                <div className="profile-info-item"><span>Deadline</span><strong>{profileDetails.deadline}</strong></div>
                <div className="profile-info-item"><span>Login Method</span><strong>{profileDetails.loginMethod}</strong></div>
                <div className="profile-info-item"><span>Session Type</span><strong>{profileDetails.sessionType}</strong></div>
                <div className="profile-info-item"><span>Phone</span><strong>{profileDetails.phone}</strong></div>
              </div>
            </div>
          </div>
        </div>}

        {activeSection === 'Analytics' && <div className="content-grid">
          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">My Tasks</h2></div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Task Title</th>
                  <th>Details</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.tasks.map((t, i) => {
                  const isCompleted = completedTasks.includes(t.title)
                  return (
                    <tr key={i} style={{ opacity: isCompleted ? 0.6 : 1 }}>
                      <td>
                        <span className={`badge ${isCompleted ? 'badge-green' : t.cls === 'done' ? 'badge-green' : t.cls === 'active' ? 'badge-blue' : 'badge-gray'}`}>
                          {isCompleted ? 'Marked Done' : t.cls === 'done' ? 'Completed' : t.cls === 'active' ? 'In Progress' : 'To Do'}
                        </span>
                      </td>
                      <td><strong style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>{t.title}</strong></td>
                      <td style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>{t.sub}</td>
                      <td>{t.urgent ? <span className="badge badge-red">Urgent</span> : <span className="badge badge-gray">Normal</span>}</td>
                      <td>
                        <button
                          className={`btn-task-action ${isCompleted ? 'btn-undo' : 'btn-complete'}`}
                          onClick={() => toggleTaskComplete(t.title)}
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isCompleted ? '↶ Undo' : '✓ Complete'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>}

        {activeSection === 'Kanban' && <div className="content-grid">
          <div className="card wide-card" style={{ gridColumn: 'span 3' }}>
            <div className="card-head"><h2 className="card-title">Research Task Workflow</h2></div>
            <div className="kanban-board">
              <div className="kanban-column">
                <div className="kanban-column-head">To Do</div>
                {dashboard.tasks.filter(t => t.cls === 'todo').map((t, i) => (
                  <div key={i} className="kanban-card">
                    <div className="kanban-card-title">{t.title}</div>
                    <span className={`badge ${t.urgent ? 'badge-red' : 'badge-gray'}`}>{t.urgent ? 'Urgent' : 'Normal'}</span>
                  </div>
                ))}
              </div>
              <div className="kanban-column">
                <div className="kanban-column-head">In Progress</div>
                {dashboard.tasks.filter(t => t.cls === 'active').map((t, i) => (
                  <div key={i} className="kanban-card kanban-card-active">
                    <div className="kanban-card-title">{t.title}</div>
                    <span className="badge badge-blue">In Progress</span>
                  </div>
                ))}
              </div>
              <div className="kanban-column">
                <div className="kanban-column-head">Under Review</div>
                <div className="kanban-card kanban-card-review">
                  <div className="kanban-card-title">Phase 2 Report</div>
                  <span className="badge badge-amber">Pending Review</span>
                </div>
              </div>
              <div className="kanban-column">
                <div className="kanban-column-head">Completed</div>
                {dashboard.tasks.filter(t => t.cls === 'done' || completedTasks.includes(t.title)).map((t, i) => (
                  <div key={i} className="kanban-card kanban-card-done">
                    <div className="kanban-card-title">{t.title}</div>
                    <span className="badge badge-green">✓ Done</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>}

        {activeSection === 'Research Log' && <div className="content-grid">
          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Log Research Work Session</h2></div>

            <form className="research-log-form" onSubmit={addResearchLog}>
              <div className="research-form-grid">
                <label>
                  Date
                  <DatePicker 
                    value={researchLogForm.date} 
                    onChange={e => setResearchLogForm(prev => ({ ...prev, date: e }))} 
                  />
                </label>

                <label>
                  Task Worked On
                  <input
                    type="text"
                    placeholder="e.g., Model Development, Data Analysis"
                    value={researchLogForm.taskTitle}
                    onChange={e => setResearchLogForm(prev => ({ ...prev, taskTitle: e.target.value }))}
                  />
                </label>

                <label>
                  Hours Spent
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="e.g., 2.5"
                    value={researchLogForm.hoursSpent}
                    onChange={e => setResearchLogForm(prev => ({ ...prev, hoursSpent: e.target.value }))}
                  />
                </label>

                <label>
                  Progress (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={researchLogForm.progressPercentage}
                    onChange={e => setResearchLogForm(prev => ({ ...prev, progressPercentage: e.target.value }))}
                  />
                </label>
              </div>

              <label>
                Work Description
                <textarea
                  rows="2"
                  placeholder="Describe what you worked on today..."
                  value={researchLogForm.description}
                  onChange={e => setResearchLogForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </label>

              <label>
                Session Status
                <select 
                  value={researchLogForm.status}
                  onChange={e => setResearchLogForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>

              <label>
                Issues Faced (Optional)
                <textarea
                  rows="2"
                  placeholder="Any blockers or challenges..."
                  value={researchLogForm.issuesFaced}
                  onChange={e => setResearchLogForm(prev => ({ ...prev, issuesFaced: e.target.value }))}
                />
              </label>

              <div className="research-form-actions">
                <button type="submit" className="btn-primary">Log Session</button>
              </div>
            </form>
          </div>

          {/* Research Statistics */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Research Statistics</h2></div>
            <div className="completion-loop">
              <div className="loop-row"><span>Total Hours</span><strong>{researchStats.totalHours.toFixed(1)}h</strong></div>
              <div className="loop-row"><span>This Week</span><strong>{researchStats.weeklyHours.toFixed(1)}h</strong></div>
              <div className="loop-row"><span>Total Sessions</span><strong>{researchStats.totalSessions}</strong></div>
              <div className="loop-row"><span>Avg Progress</span><strong>{researchStats.avgDailyProgress.toFixed(0)}%</strong></div>
            </div>
          </div>

          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Research Session History</h2></div>
            {researchLogs.length === 0 ? (
              <p className="empty-state">No research sessions logged yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Task</th>
                    <th>Hours</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {researchLogs.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td><strong>{log.taskTitle}</strong></td>
                      <td>{log.hoursSpent}h</td>
                      <td>{log.progressPercentage}%</td>
                      <td>
                        <span className={`badge ${log.status === 'completed' ? 'badge-green' : log.status === 'blocked' ? 'badge-red' : 'badge-blue'}`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                      <td>{log.issuesFaced ? '⚠️' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>}

        {activeSection === 'Repository' && <div className="content-grid">
          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Add Research Resource</h2></div>
            <form onSubmit={addDriveFile} className="drive-form">
              <div className="drive-form-grid">
                <label>
                  Resource Name
                  <input
                    type="text"
                    placeholder="e.g., Healthcare AI GitHub Repo, Paper Reference"
                    value={driveForm.fileName}
                    onChange={e => setDriveForm(prev => ({ ...prev, fileName: e.target.value }))}
                  />
                </label>

                <label>
                  Resource Type
                  <select
                    value={driveForm.fileType}
                    onChange={e => setDriveForm(prev => ({ ...prev, fileType: e.target.value }))}
                  >
                    <option value="github">GitHub Repository</option>
                    <option value="video">Research Video</option>
                    <option value="screenshot">Experiment Screenshot</option>
                    <option value="document">Research Paper / Report</option>
                  </select>
                </label>
              </div>

              <label>
                Link / URL
                <input
                  type="url"
                  placeholder="https://github.com/... or research paper URL"
                  value={driveForm.link}
                  onChange={e => setDriveForm(prev => ({ ...prev, link: e.target.value }))}
                />
              </label>

              <label>
                Notes (Optional)
                <textarea
                  rows="2"
                  placeholder="Purpose, findings, or relevance to your research..."
                  value={driveForm.description}
                  onChange={e => setDriveForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </label>

              <button type="submit" className="btn-primary">Add Resource</button>
            </form>
          </div>

          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">Research Resources</h2></div>
            {driveFiles.length === 0 ? (
              <p className="empty-state">No resources added yet. Build your research library by adding GitHub links, papers, videos, and screenshots.</p>
            ) : (
              <div className="drive-files-grid">
                {driveFiles.map(file => (
                  <div key={file.id} className="drive-file-card">
                    <div className="drive-file-icon">
                      {file.fileType === 'github' && '🐙'}
                      {file.fileType === 'video' && '🎬'}
                      {file.fileType === 'screenshot' && '📊'}
                      {file.fileType === 'document' && '📚'}
                    </div>
                    <div className="drive-file-info">
                      <h3>{file.fileName}</h3>
                      <span className="drive-file-type">{file.fileType.charAt(0).toUpperCase() + file.fileType.slice(1)}</span>
                      {file.description && <p className="drive-file-desc">{file.description}</p>}
                      <a href={file.link} target="_blank" rel="noopener noreferrer" className="drive-file-link">
                        Access Resource →
                      </a>
                    </div>
                    <button
                      onClick={() => deleteDriveFile(file.id)}
                      className="btn-delete"
                      title="Delete resource"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
      </main>
    </div>
  )
}
