import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authenticateUser, getRedirectPath, registerUser } from './userStore.js'
import { dashboardData } from './dashboardData.js'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'projectflow-backend' })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const user = await authenticateUser(email, password)

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  return res.json({
    user,
    redirectPath: getRedirectPath(user.role),
  })
})

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, role, department, password, confirmPassword, phone } = req.body || {}

  if (!name || !email || !role || !department || !password || !confirmPassword || !phone) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' })
  }

  if (!['director', 'coordinator', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Select a valid role.' })
  }

  try {
    const user = await registerUser({ name, email, role, department, password, phone })
    return res.status(201).json({
      user,
      redirectPath: getRedirectPath(user.role),
    })
  } catch (error) {
    const status = error.status || 500
    return res.status(status).json({ message: error.message || 'Unable to create account.' })
  }
})

app.get('/api/dashboard/:role', (req, res) => {
  const dashboard = dashboardData[req.params.role]

  if (!dashboard) {
    return res.status(404).json({ message: 'Dashboard not found.' })
  }

  return res.json(dashboard)
})

app.listen(port, () => {
  console.log(`ProjectFlow backend running on http://localhost:${port}`)
})