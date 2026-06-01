import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { StatusBadge } from '../components/StatusBadge'
import { 
  Ticket, 
  Users, 
  DollarSign, 
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardService.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const cards = [
    {
      title: 'Total Tickets',
      value: stats?.totalTickets || 0,
      icon: Ticket,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Pending',
      value: (stats?.statusCounts?.CREATED || 0) + (stats?.statusCounts?.ASSIGNED || 0),
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'In Progress',
      value: (stats?.statusCounts?.IN_DIAGNOSIS || 0) + (stats?.statusCounts?.IN_PROGRESS || 0),
      icon: AlertCircle,
      color: 'bg-purple-500'
    },
    {
      title: 'Completed',
      value: (stats?.statusCounts?.RESOLVED || 0) + (stats?.statusCounts?.CLOSED || 0),
      icon: CheckCircle,
      color: 'bg-green-500'
    }
  ]

  // Only add revenue card for SUPER_ADMIN
  if (user?.role === 'SUPER_ADMIN') {
    cards.push({
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '+8%'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.name}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'SUPER_ADMIN' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6`}>
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                  {card.change && (
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {card.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Ticket #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Motherboard</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Assigned To</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {stats?.recentTickets?.map((ticket) => (
                <tr key={ticket.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4">
                    <Link 
                      to={`/tickets/${ticket.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {ticket.ticketNumber}
                    </Link>
                  </td>
                  <td className="py-4">{ticket.customerName}</td>
                  <td className="py-4">{ticket.motherboardBrand} {ticket.motherboardType}</td>
                  <td className="py-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-4">
                    {ticket.assignedTo?.name || '-'}
                  </td>
                  <td className="py-4 text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.recentTickets || stats.recentTickets.length === 0) && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Workload (Admin only) */}
      {user?.role === 'SUPER_ADMIN' && stats?.employeeStats?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Employee Workload</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.employeeStats.map((employee) => (
              <div key={employee.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {employee._count.assignedTickets} active tickets
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
