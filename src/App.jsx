import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DirectorDashboard from './pages/DirectorDashboard'
import CoordinatorDashboard from './pages/CoordinatorDashboard'
import StudentDashboard from './pages/StudentDashboard'

function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('pf_user') || localStorage.getItem('pf_user')
  return user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/director" element={<ProtectedRoute><DirectorDashboard /></ProtectedRoute>} />
        <Route path="/coordinator" element={<ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
