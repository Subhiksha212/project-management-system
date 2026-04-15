import { useState } from 'react'
import '../assets/dashboard.css'

export default function DatePicker({ value, onChange }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = value ? new Date(value) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const isoDate = date.toISOString().split('T')[0]
    onChange(isoDate)
    setShowCalendar(false)
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthYear = currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="date-picker-wrapper">
      <div className="date-picker-input" onClick={() => setShowCalendar(!showCalendar)}>
        <span>{formatDisplayDate(value)}</span>
        <span className="calendar-icon">📅</span>
      </div>

      {showCalendar && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button type="button" onClick={handlePrevMonth} className="calendar-nav">←</button>
            <h3>{monthYear}</h3>
            <button type="button" onClick={handleNextMonth} className="calendar-nav">→</button>
          </div>

          <div className="calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="calendar-days">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty"></div>
            ))}
            {days.map((day) => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isoDate = date.toISOString().split('T')[0]
              const isSelected = value === isoDate
              const isToday = isoDate === new Date().toISOString().split('T')[0]

              return (
                <button
                  key={day}
                  type="button"
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
