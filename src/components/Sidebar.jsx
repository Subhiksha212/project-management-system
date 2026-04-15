import { useNavigate } from 'react-router-dom'
import '../assets/dashboard.css'

const Logo = () => (
  <svg viewBox="0 0 28 28" fill="none">
    <rect x="2" y="2" width="10" height="10" rx="2" fill="#fff"/>
    <rect x="16" y="2" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="2" y="16" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="16" y="16" width="10" height="10" rx="2" fill="#fff"/>
  </svg>
)

export default function Sidebar({ role, userName, userInitials, userSub, navItems, activeItem, onNavSelect }) {
  const navigate = useNavigate()

  function logout() {
    sessionStorage.removeItem('pf_user')
    localStorage.removeItem('pf_user')
    navigate('/')
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><Logo /></div>
        <span className="logo-text">ProjectFlow</span>
      </div>

      <div className="sidebar-role-badge">
        <span className="dot"></span>
        <span>{role}</span>
      </div>

      <ul className="nav-list">
        {navItems.map((item, i) => (
          <li
            key={i}
            className={`nav-item${(activeItem ? activeItem === item.label : i === 0) ? ' active' : ''}`}
            onClick={() => onNavSelect?.(item.label)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onNavSelect?.(item.label)
              }
            }}
          >
            <span className="nav-icon">{item.icon}</span> {item.label}
          </li>
        ))}
      </ul>

      <div className="sidebar-user">
        <div className="user-avatar">{userInitials}</div>
        <div className="user-info">
          <span className="user-name">{userName}</span>
          <span className="user-role">{userSub}</span>
        </div>
        <button onClick={logout} className="logout-btn" title="Logout">⇥</button>
      </div>
    </nav>
  )
}
