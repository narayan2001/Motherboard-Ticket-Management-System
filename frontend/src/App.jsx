import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import TicketDetails from './pages/TicketDetails'
import CreateTicket from './pages/CreateTicket'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Motherboards from './pages/Motherboards'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<TicketDetails />} />
        <Route 
          path="tickets/new" 
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'RECEPTIONIST']}>
              <CreateTicket />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="users" 
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="motherboards" 
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <Motherboards />
            </ProtectedRoute>
          } 
        />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
