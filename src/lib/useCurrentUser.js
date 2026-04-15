import { useState, useEffect } from 'react'

export function useCurrentUser() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pf_user') || localStorage.getItem('pf_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser(parsed)
      }
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }, [])

  return user
}
