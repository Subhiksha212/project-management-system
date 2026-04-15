import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useDashboardData } from '../lib/useDashboardData'
import { useCurrentUser } from '../lib/useCurrentUser'
import { coordinatorDashboardFallback } from '../lib/dashboardData'
import '../assets/dashboard.css'

const navItems = [
  { icon: '⊞', label: 'Dashboard' },
  { icon: '📁', label: 'My Projects' },
  { icon: '🎓', label: 'Students' },
  { icon: '📅', label: 'Schedule' },
  { icon: '📬', label: 'Submissions' },
  { icon: '⚙️', label: 'Settings' },
]

export default function CoordinatorDashboard() {
  const currentUser = useCurrentUser()
  const dashboard = useDashboardData('coordinator', coordinatorDashboardFallback)
  
  const displayName = currentUser?.name || dashboard.profile.name
  const displayEmail = currentUser?.email || ''
  const displayInitials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || dashboard.profile.initials
  const displaySubtitle = displayEmail ? `${displayEmail}` : dashboard.profile.subtitle

  return (
    <div data-role="coordinator" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        role={dashboard.profile.role}
        userName={displayName}
        userInitials={displayInitials}
        userSub={displaySubtitle}
        navItems={navItems}
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1 className="page-title">{dashboard.header.title}</h1>
            <p className="page-sub">{dashboard.header.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <button className="btn-outline" onClick={() => alert('Schedule')}>📅 Add Review</button>
            <button className="btn-primary" onClick={() => alert('Assign task')}>+ Assign Task</button>
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

        <div className="content-grid">
          {/* Projects */}
          <div className="card wide-card">
            <div className="card-head"><h2 className="card-title">My Projects</h2><button className="btn-ghost">Manage All →</button></div>
            <div className="proj-cards-row">
              {dashboard.projects.map((p, i) => (
                <div className="proj-mini-card" key={i}>
                  <div className="proj-mini-head">
                    <span className="proj-mini-title">{p.title}</span>
                    <span className={`badge ${p.badge}`}>{p.status}</span>
                  </div>
                  <p className="proj-mini-desc">{p.desc}</p>
                  <div className="proj-mini-meta"><span>{p.n} Students</span><span>{p.dl}</span></div>
                  <div className="progress-bar" style={{ marginTop: 12 }}>
                    <div className="progress-fill" style={{ width: `${p.pct}%`, background: p.color }}></div>
                  </div>
                  <span className="pct-label">{p.pct}% complete</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Pending Reviews</h2></div>
            <ul className="activity-list">
              {dashboard.reviews.map((a, i) => (
                <li className="activity-item" key={i}>
                  <span className="act-dot" style={{ background: a.dot }}></span>
                  <div><strong>{a.name}</strong> — {a.task}</div>
                  <span className="act-time">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Schedule */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">This Week</h2></div>
            <ul className="schedule-list">
              {dashboard.schedule.map((s, i) => (
                <li className="sch-item" key={i}>
                  <div className="sch-date"><span>{s.day}</span><span>{s.mon}</span></div>
                  <div className="sch-details"><strong>{s.title}</strong><span>{s.loc}</span></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
