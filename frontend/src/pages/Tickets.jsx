import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ticketService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { StatusBadge, PaymentStatusBadge } from '../components/StatusBadge'
import { Plus, Search, RefreshCw } from 'lucide-react'

const Tickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('') // Actual query used for API call
  const [statusFilter, setStatusFilter] = useState('')
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Get status from URL query params if present
    const statusFromUrl = searchParams.get('status')
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    fetchTickets()
  }, [searchQuery, statusFilter])

  useEffect(() => {
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      fetchTickets(true) // Silent refresh
    }, 15000)

    return () => clearInterval(interval)
  }, [searchQuery, statusFilter])

  const fetchTickets = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter) params.status = statusFilter
      
      const response = await ticketService.getAll(params)
      setTickets(response.data.tickets)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await fetchTickets(true)
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(search)
    }
  }

  const canCreateTicket = ['SUPER_ADMIN', 'RECEPTIONIST'].includes(user?.role)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 mt-1">Manage all repair tickets</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {canCreateTicket && (
            <Link to="/tickets/new" className="btn btn-primary inline-flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create Ticket
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ticket #, customer name, or phone... (Press Enter to search)"
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>
          </div>
          <div>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="CREATED">Created</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="card">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Ticket #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Motherboard</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tickets.map((ticket) => (
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
                  <td className="py-4">
                    <PaymentStatusBadge status={ticket.paymentStatus || 'PENDING'} />
                  </td>
                  <td className="py-4 text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Search className="h-12 w-12 text-gray-300 mb-4" />
                      <p>No tickets found</p>
                      {canCreateTicket && (
                        <Link to="/tickets/new" className="text-primary-600 hover:text-primary-700 mt-2">
                          Create your first ticket
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {tickets.map((ticket) => (
            <Link 
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-primary-600 font-semibold text-sm">{ticket.ticketNumber}</p>
                  <p className="font-medium text-gray-900 mt-1">{ticket.customerName}</p>
                  <p className="text-sm text-gray-600">{ticket.customerPhone}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <StatusBadge status={ticket.status} />
                  <PaymentStatusBadge status={ticket.paymentStatus || 'PENDING'} />
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Motherboard:</span>
                  <span className="font-medium text-gray-900">{ticket.motherboardBrand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Model:</span>
                  <span className="text-gray-700">{ticket.motherboardType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-700">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
          {tickets.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <Search className="h-12 w-12 text-gray-300 mb-4" />
                <p>No tickets found</p>
                {canCreateTicket && (
                  <Link to="/tickets/new" className="text-primary-600 hover:text-primary-700 mt-2">
                    Create your first ticket
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tickets
