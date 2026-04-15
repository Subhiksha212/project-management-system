import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useDashboardData } from '../lib/useDashboardData'
import { useCurrentUser } from '../lib/useCurrentUser'
import { directorDashboardFallback } from '../lib/dashboardData'
import '../assets/dashboard.css'

const navItems = [
  { icon: '⊞', label: 'Overview' },
  { icon: '📁', label: 'All Projects' },
  { icon: '👥', label: 'Teams' },
  { icon: '📊', label: 'Analytics' },
  { icon: '📋', label: 'Reports' },
  { icon: '⚙️', label: 'Settings' },
]

export default function DirectorDashboard() {
  const currentUser = useCurrentUser()
  const dashboard = useDashboardData('director', directorDashboardFallback)
  
  const displayName = currentUser?.name || dashboard.profile.name
  const displayEmail = currentUser?.email || ''
  const displayInitials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || dashboard.profile.initials
  const displaySubtitle = displayEmail ? `${displayEmail}` : dashboard.profile.subtitle

  return (
    <div data-role="director" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
            <button className="btn-outline" onClick={() => alert('Export coming soon')}>Export Report</button>
            <button className="btn-primary" onClick={() => alert('New project')}>+ New Project</button>
          </div>
        </header>

        {/* KPI Grid */}
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
          {/* Projects Table */}
          <div className="card wide-card">
            <div className="card-head">
              <h2 className="card-title">Active Projects</h2>
              <button className="btn-ghost">View All →</button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Project</th><th>Coordinator</th><th>Students</th><th>Progress</th><th>Deadline</th><th>Status</th></tr></thead>
                <tbody>
                  {dashboard.projects.map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.coord}</td>
                      <td>{p.n}</td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${p.pct}%`, background: p.color }}></div>
                        </div>
                      </td>
                      <td>{p.dl}</td>
                      <td><span className={`badge ${p.badge}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Progress */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Department Progress</h2></div>
            <div className="dept-list">
              {dashboard.departments.map((d, i) => (
                <div className="dept-item" key={i}>
                  <span className="dept-name">{d.name}</span>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${d.pct}%`, background: d.color }}></div></div>
                  <span className="dept-pct">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Recent Activity</h2></div>
            <ul className="activity-list">
              {dashboard.activities.map((a, i) => (
                <li className="activity-item" key={i}>
                  <span className="act-dot" style={{ background: a.dot }}></span>
                  <div>{a.text}</div>
                  <span className="act-time">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
