import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CircuitBoard } from 'lucide-react'

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    
    if (!credentials.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!credentials.password) {
      newErrors.password = 'Password is required'
    } else if (credentials.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field, value) => {
    setCredentials({ ...credentials, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    const success = await login(credentials)
    
    if (success) {
      navigate('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full">
              <CircuitBoard className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Motherboard Ticket System
          </h1>
          <p className="text-primary-100">
            Sign in to manage repair tickets
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className={`input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Demo credentials:</p>
            <div className="space-y-1 font-mono text-xs">
              <p>Employee: employee@example.com / employee123</p>
              <p>Receptionist: receptionist@example.com / receptionist123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
