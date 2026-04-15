import { useEffect, useState } from 'react'
import { fetchDashboard } from './api'

export function useDashboardData(role, fallbackData) {
  const [data, setData] = useState(fallbackData)

  useEffect(() => {
    let active = true

    fetchDashboard(role)
      .then(nextData => {
        if (active) setData(nextData)
      })
      .catch(() => {
        if (active) setData(fallbackData)
      })

    return () => {
      active = false
    }
  }, [fallbackData, role])

  return data
}