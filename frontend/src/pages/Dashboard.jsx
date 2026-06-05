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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardStats()
    }, 30000)
    
    return () => clearInterval(interval)
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
      link: '/tickets'
    },
    {
      title: 'Created',
      value: stats?.statusCounts?.CREATED || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/tickets?status=CREATED'
    },
    {
      title: 'In Progress',
      value: stats?.statusCounts?.IN_PROGRESS || 0,
      icon: AlertCircle,
      color: 'bg-purple-500',
      link: '/tickets?status=IN_PROGRESS'
    },
    {
      title: 'Resolved',
      value: stats?.statusCounts?.RESOLVED || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/tickets?status=RESOLVED'
    },
    {
      title: 'Closed',
      value: stats?.statusCounts?.CLOSED || 0,
      icon: CheckCircle,
      color: 'bg-gray-500',
      link: '/tickets?status=CLOSED'
    }
  ]

  // Add revenue card for SUPER_ADMIN and RECEPTIONIST
  if (['SUPER_ADMIN', 'RECEPTIONIST'].includes(user?.role)) {
    cards.push({
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      link: null
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.name}! <span className="text-sm">(Overall statistics - All time)</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${cards.length} gap-6`}>
        {cards.map((card, index) => {
          const Icon = card.icon
          const CardWrapper = card.link ? Link : 'div'
          return (
            <CardWrapper 
              key={index} 
              to={card.link}
              className={`card hover:shadow-lg transition-all ${card.link ? 'cursor-pointer hover:scale-105' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                  {card.link && (
                    <p className="text-xs text-primary-600 mt-2">
                      Click to view →
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardWrapper>
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
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Motherboard</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created By</th>
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
                  <td className="py-4 font-medium">{ticket.customerName}</td>
                  <td className="py-4 text-gray-600">{ticket.customerPhone}</td>
                  <td className="py-4">
                    <div>
                      <p className="font-medium">{ticket.motherboardBrand}</p>
                      <p className="text-xs text-gray-500">{ticket.motherboardType}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-4 text-gray-600">
                    {ticket.createdBy?.name || '-'}
                  </td>
                  <td className="py-4 text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.recentTickets || stats.recentTickets.length === 0) && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default Dashboard
