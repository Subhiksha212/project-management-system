import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signupUser } from '../lib/api'
import '../assets/login.css'
import '../assets/signup.css'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', role: '', department: '',
    password: '', confirmPassword: '', phone: ''
  })
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [errors, setErrors] = useState({})
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      setErrors(v => ({ ...v, [field]: '' }))
    }
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required.'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address.'
    if (!form.role) errs.role = 'Please select a role.'
    if (!form.department.trim()) errs.department = 'Department is required.'
    if (!form.password || form.password.length < 6)
      errs.password = 'Password must be at least 6 characters.'
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.'
    if (!form.phone || !/^\d{10}$/.test(form.phone.replace(/[\s-]/g, '')))
      errs.phone = 'Enter a valid 10-digit phone number.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate() || loading) return

    setLoading(true)
    try {
      await signupUser({
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phone: form.phone,
      })

      setMsg({ text: '✓ Account created! Redirecting to login…', type: 'ok' })
      setTimeout(() => navigate('/'), 1400)
    } catch (error) {
      if (String(error.message || '').toLowerCase().includes('registered')) {
        setErrors({ email: error.message })
      } else {
        setMsg({ text: error.message || 'Unable to create account.', type: 'bad' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="login-card signup-card">

        {/* Logo */}
        <div className="logo">
          <svg viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="2" fill="#1a3faa"/>
            <rect x="16" y="2" width="10" height="10" rx="2" fill="#7b9aed"/>
            <rect x="2" y="16" width="10" height="10" rx="2" fill="#7b9aed"/>
            <rect x="16" y="16" width="10" height="10" rx="2" fill="#1a3faa"/>
          </svg>
          <span>ProjectFlow</span>
        </div>

        <h1 className="title" style={{ textAlign: 'center', marginBottom: 24 }}>Sign up</h1>

        <form onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className="field">
            <label htmlFor="name">Name <span style={{color:'#c0392b'}}>*</span></label>
            <input type="text" id="name" value={form.name} onChange={set('name')}
              placeholder="Enter a Full Name" className={errors.name ? 'err' : ''} />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="field">
            <label htmlFor="email">Email <span style={{color:'#c0392b'}}>*</span></label>
            <input type="email" id="email" value={form.email} onChange={set('email')}
              placeholder="Enter a valid Mail ID" className={errors.email ? 'err' : ''} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* Role + Department */}
          <div className="form-row">
            <div className="field">
              <label htmlFor="role">Role <span style={{color:'#c0392b'}}>*</span></label>
              <select id="role" value={form.role} onChange={set('role')}
                className={`field-input${errors.role ? ' err' : ''}`}>
                <option value="" disabled>Select the role</option>
                <option value="director">Director</option>
                <option value="coordinator">Coordinator</option>
                <option value="student">Student</option>
              </select>
              {errors.role && <span className="error">{errors.role}</span>}
            </div>
            <div className="field">
              <label htmlFor="department">Department <span style={{color:'#c0392b'}}>*</span></label>
              <input type="text" id="department" value={form.department} onChange={set('department')}
                placeholder="Enter your Department" className={errors.department ? 'err' : ''} />
              {errors.department && <span className="error">{errors.department}</span>}
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <label htmlFor="password">Password <span style={{color:'#c0392b'}}>*</span></label>
            <div className="pw-wrap">
              <input type={showPw ? 'text' : 'password'} id="password" value={form.password}
                onChange={set('password')} placeholder="Enter your password"
                className={errors.password ? 'err' : ''} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password <span style={{color:'#c0392b'}}>*</span></label>
            <div className="pw-wrap">
              <input type={showCpw ? 'text' : 'password'} id="confirmPassword" value={form.confirmPassword}
                onChange={set('confirmPassword')} placeholder="Re-enter your password"
                className={errors.confirmPassword ? 'err' : ''} />
              <button type="button" className="pw-toggle" onClick={() => setShowCpw(v => !v)} aria-label="Toggle">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          {/* Phone */}
          <div className="field">
            <label htmlFor="phone">Phone Number <span style={{color:'#c0392b'}}>*</span></label>
            <input type="tel" id="phone" value={form.phone} onChange={set('phone')}
              placeholder="Enter the phone number" className={errors.phone ? 'err' : ''} />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <button type="submit" className="btn" style={{ marginTop: 4 }} disabled={loading}>{loading ? 'Creating…' : 'Sign-up'}</button>
          {msg.text && <p className={`msg ${msg.type}`}>{msg.text}</p>}
        </form>

        <p className="footer-text" style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" className="link">Back to login</Link>
        </p>
      </div>
      <footer className="page-footer">© 2026 ProjectFlow &nbsp;·&nbsp; Project Management System</footer>
    </div>
  )
}
