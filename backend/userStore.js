import { mkdir, readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import { supabase, hasSupabaseConfig, createSupabaseUserClient } from './supabaseClient.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const usersFile = path.join(dataDir, 'users.json')

const seedUsers = [
  {
    id: 'seed-director',
    name: 'Dr. Rajesh Mehta',
    email: 'director@pf.com',
    password: 'Admin@123',
    role: 'director',
    department: 'Administration',
    phone: '9000000001',
  },
  {
    id: 'seed-coordinator',
    name: 'Dr. Priya Sharma',
    email: 'coord@pf.com',
    password: 'Coord@123',
    role: 'coordinator',
    department: 'Computer Science',
    phone: '9000000002',
  },
  {
    id: 'seed-student',
    name: 'Aanya Singh',
    email: 'student@pf.com',
    password: 'Student@123',
    role: 'student',
    department: 'Computer Science',
    phone: '9000000003',
  },
]

async function ensureStore() {
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  if (!existsSync(usersFile)) {
    await writeFile(usersFile, JSON.stringify(seedUsers, null, 2), 'utf8')
  }
}

async function readUsers() {
  await ensureStore()
  const raw = await readFile(usersFile, 'utf8')
  return JSON.parse(raw)
}

async function writeUsers(users) {
  await ensureStore()
  await writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8')
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    phone: user.phone,
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

async function getUserFromSupabaseByAuthId(authId, accessToken) {
  const userClient = createSupabaseUserClient(accessToken)
  if (!userClient || !authId) return null

  const { data, error } = await userClient
    .from('users')
    .select('id, name, email, role, department, phone, auth_id')
    .eq('auth_id', authId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

function sanitizeAuthProfile(authUser) {
  const metadata = authUser?.user_metadata || {}
  const rawRole = String(metadata.role || 'student').toLowerCase()
  const role = ['director', 'coordinator', 'student'].includes(rawRole) ? rawRole : 'student'

  return {
    id: authUser?.id,
    name: metadata.name || authUser?.email?.split('@')[0] || 'User',
    email: normalizeEmail(authUser?.email),
    role,
    department: metadata.department || '',
    phone: metadata.phone || '',
  }
}

export async function authenticateUser(email, password) {
  const normalizedEmail = normalizeEmail(email)

  if (hasSupabaseConfig) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (!error && data?.user) {
      const profile = await getUserFromSupabaseByAuthId(data.user.id, data.session?.access_token)
      if (profile) {
        return sanitizeUser(profile)
      }

      return sanitizeAuthProfile(data.user)
    }
  }

  const users = await readUsers()
  const match = users.find(user => normalizeEmail(user.email) === normalizedEmail && user.password === password)
  return match ? sanitizeUser(match) : null
}

export async function registerUser(input) {
  const normalizedEmail = normalizeEmail(input.email)
  const newUser = {
    id: randomUUID(),
    name: String(input.name || '').trim(),
    email: normalizedEmail,
    password: String(input.password || ''),
    role: input.role,
    department: String(input.department || '').trim(),
    phone: String(input.phone || '').trim(),
  }

  const users = await readUsers()
  if (users.some(user => normalizeEmail(user.email) === normalizedEmail)) {
    const error = new Error('This email is already registered.')
    error.status = 409
    throw error
  }

  if (hasSupabaseConfig) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: String(input.password || ''),
      options: {
        data: {
          name: newUser.name,
          role: newUser.role,
          department: newUser.department,
          phone: newUser.phone,
        },
      },
    })

    if (error) {
      const message = String(error.message || '').toLowerCase()
      if (message.includes('already registered') || error.status === 422) {
        const duplicateError = new Error('This email is already registered.')
        duplicateError.status = 409
        throw duplicateError
      }

      if ((message.includes('rate limit') || message.includes('email rate limit')) && error.status === 429) {
        users.push(newUser)
        await writeUsers(users)
        return sanitizeUser(newUser)
      }

      const signupError = new Error(error.message || 'Unable to create account.')
      signupError.status = error.status || 500
      throw signupError
    }

    if (!data?.user) {
      const signupError = new Error('Unable to create account.')
      signupError.status = 500
      throw signupError
    }

    const profile = await getUserFromSupabaseByAuthId(data.user.id, data.session?.access_token)
    return profile ? sanitizeUser(profile) : sanitizeAuthProfile(data.user)
  }

  users.push(newUser)
  await writeUsers(users)

  return sanitizeUser(newUser)
}

export function getRedirectPath(role) {
  return `/${role}`
}