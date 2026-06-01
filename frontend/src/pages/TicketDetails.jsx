import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ticketService, userService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const TicketDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  // Form states
  const [assignTo, setAssignTo] = useState('')
  const [diagnosis, setDiagnosis] = useState({
    diagnosisNotes: '',
    partsRequired: '',
    partsCost: '',
    laborCost: '',
    estimatedCompletionDays: ''
  })
  const [payment, setPayment] = useState({
    amountPaid: '',
    paymentMethod: 'CASH'
  })

  useEffect(() => {
    fetchTicket()
    if (user?.role === 'SUPER_ADMIN') {
      fetchEmployees()
    }
  }, [id])

  const fetchTicket = async () => {
    try {
      const response = await ticketService.getOne(id)
      setTicket(response.data)
    } catch (error) {
      toast.error('Failed to load ticket')
      navigate('/tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await userService.getAll({ role: 'EMPLOYEE' })
      setEmployees(response.data)
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const handleAssign = async () => {
    if (!assignTo) return toast.error('Please select an employee')
    try {
      await ticketService.assign(id, assignTo)
      toast.success('Ticket assigned successfully')
      fetchTicket()
    } catch (error) {
      toast.error('Failed to assign ticket')
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await ticketService.updateStatus(id, newStatus)
      toast.success('Status updated')
      fetchTicket()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault()
    try {
      await ticketService.submitDiagnosis(id, diagnosis)
      toast.success('Diagnosis submitted and notification sent!')
      setShowDiagnosis(false)
      fetchTicket()
    } catch (error) {
      toast.error('Failed to submit diagnosis')
    }
  }

  const handleApprovalUpdate = async (status) => {
    try {
      await ticketService.updateApproval(id, { approvalStatus: status })
      toast.success(`Marked as ${status}`)
      fetchTicket()
    } catch (error) {
      toast.error('Failed to update approval')
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    try {
      await ticketService.submitPayment(id, payment)
      toast.success('Payment recorded and ticket closed!')
      setShowPayment(false)
      fetchTicket()
    } catch (error) {
      toast.error('Failed to record payment')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!ticket) return <div>Ticket not found</div>

  const canEdit = ['SUPER_ADMIN', 'EMPLOYEE'].includes(user?.role)
  const isAssigned = ticket.assignedToId === user?.id || user?.role === 'SUPER_ADMIN'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/tickets" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{ticket.ticketNumber}</h1>
            <p className="text-gray-500 mt-1">Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Customer Info */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <p className="font-medium">{ticket.customerName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <p className="font-medium">{ticket.customerPhone}</p>
          </div>
          {ticket.customerEmail && (
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{ticket.customerEmail}</p>
            </div>
          )}
        </div>
      </div>

      {/* Motherboard Info */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Motherboard Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Brand</label>
            <p className="font-medium">{ticket.motherboardBrand}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Type/Model</label>
            <p className="font-medium">{ticket.motherboardType}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Initial Issue</label>
            <p className="mt-1">{ticket.initialIssue}</p>
          </div>
        </div>
      </div>

      {/* Assignment (Admin only) */}
      {user?.role === 'SUPER_ADMIN' && ticket.status === 'CREATED' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Assign Ticket</h2>
          <div className="flex gap-4">
            <select 
              className="input flex-1"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <button onClick={handleAssign} className="btn btn-primary">
              Assign
            </button>
          </div>
        </div>
      )}

      {/* Diagnosis Section */}
      {canEdit && isAssigned && ['ASSIGNED', 'IN_DIAGNOSIS'].includes(ticket.status) && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Submit Diagnosis</h2>
          {!showDiagnosis ? (
            <button onClick={() => setShowDiagnosis(true)} className="btn btn-primary">
              Add Diagnosis
            </button>
          ) : (
            <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
              <div>
                <label className="label">Diagnosis Notes</label>
                <textarea 
                  className="input"
                  rows="4"
                  required
                  value={diagnosis.diagnosisNotes}
                  onChange={(e) => setDiagnosis({...diagnosis, diagnosisNotes: e.target.value})}
                  placeholder="Describe the problems found..."
                />
              </div>
              <div>
                <label className="label">Parts Required</label>
                <textarea 
                  className="input"
                  rows="2"
                  value={diagnosis.partsRequired}
                  onChange={(e) => setDiagnosis({...diagnosis, partsRequired: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Parts Cost (₹)</label>
                  <input 
                    type="number"
                    className="input"
                    required
                    value={diagnosis.partsCost}
                    onChange={(e) => setDiagnosis({...diagnosis, partsCost: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Labor Cost (₹)</label>
                  <input 
                    type="number"
                    className="input"
                    required
                    value={diagnosis.laborCost}
                    onChange={(e) => setDiagnosis({...diagnosis, laborCost: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="label">Estimated Completion (days)</label>
                <input 
                  type="number"
                  className="input"
                  value={diagnosis.estimatedCompletionDays}
                  onChange={(e) => setDiagnosis({...diagnosis, estimatedCompletionDays: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Submit & Send WhatsApp
                </button>
                <button type="button" onClick={() => setShowDiagnosis(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Show Diagnosis if exists */}
      {ticket.diagnosis && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Diagnosis</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Notes</label>
              <p>{ticket.diagnosis.diagnosisNotes}</p>
            </div>
            {ticket.diagnosis.partsRequired && (
              <div>
                <label className="text-sm text-gray-600">Parts Required</label>
                <p>{ticket.diagnosis.partsRequired}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Parts Cost</label>
                <p className="font-medium">₹{ticket.diagnosis.partsCost}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Labor Cost</label>
                <p className="font-medium">₹{ticket.diagnosis.laborCost}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Total Cost</label>
                <p className="font-bold text-lg">₹{ticket.diagnosis.totalCost}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Actions */}
      {canEdit && isAssigned && ticket.status === 'AWAITING_APPROVAL' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Customer Approval</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => handleApprovalUpdate('APPROVED')}
              className="btn bg-green-600 text-white hover:bg-green-700"
            >
              Mark as Approved
            </button>
            <button 
              onClick={() => handleApprovalUpdate('DECLINED')}
              className="btn btn-danger"
            >
              Mark as Declined
            </button>
          </div>
        </div>
      )}

      {/* Status Actions */}
      {canEdit && isAssigned && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {ticket.status === 'APPROVED' && (
              <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="btn btn-primary">
                Start Repair
              </button>
            )}
            {ticket.status === 'IN_PROGRESS' && (
              <button onClick={() => handleStatusUpdate('RESOLVED')} className="btn bg-green-600 text-white">
                Mark as Resolved
              </button>
            )}
          </div>
        </div>
      )}

      {/* Payment Section */}
      {canEdit && isAssigned && ticket.status === 'RESOLVED' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Collect Payment</h2>
          {!showPayment ? (
            <button onClick={() => setShowPayment(true)} className="btn btn-primary">
              Record Payment
            </button>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="label">Amount Paid (₹)</label>
                <input 
                  type="number"
                  className="input"
                  required
                  placeholder={ticket.diagnosis?.totalCost || ''}
                  value={payment.amountPaid}
                  onChange={(e) => setPayment({...payment, amountPaid: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select 
                  className="input"
                  value={payment.paymentMethod}
                  onChange={(e) => setPayment({...payment, paymentMethod: e.target.value})}
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary">
                  Submit Payment & Close Ticket
                </button>
                <button type="button" onClick={() => setShowPayment(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Payment Info if exists */}
      {ticket.payment && (
        <div className="card bg-green-50">
          <h2 className="text-xl font-bold mb-4 text-green-800">Payment Received</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-green-700">Amount</label>
              <p className="font-bold text-xl text-green-900">₹{ticket.payment.amountPaid}</p>
            </div>
            <div>
              <label className="text-sm text-green-700">Method</label>
              <p className="font-medium text-green-900">{ticket.payment.paymentMethod}</p>
            </div>
            <div>
              <label className="text-sm text-green-700">Date</label>
              <p className="font-medium text-green-900">
                {new Date(ticket.payment.paymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketDetails
