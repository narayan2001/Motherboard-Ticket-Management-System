import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ticketService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { StatusBadge, PaymentStatusBadge } from '../components/StatusBadge'
import { ArrowLeft, Upload, Camera, X, ZoomIn } from 'lucide-react'
import toast from 'react-hot-toast'

const TicketDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Form states
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
      toast.success('Diagnosis submitted!')
      setShowDiagnosis(false)
      fetchTicket()
    } catch (error) {
      toast.error('Failed to submit diagnosis')
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

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return

    const totalImages = (ticket.images?.length || 0) + files.length
    if (totalImages > 8) {
      toast.error(`Cannot add ${files.length} images. Maximum 8 images allowed.`)
      return
    }

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('images', file)
      })

      await ticketService.addImages(id, formData)
      toast.success('Images uploaded successfully')
      fetchTicket()
    } catch (error) {
      toast.error('Failed to upload images')
    }
  }

  const handleDeleteImage = async (imageIndex) => {
    try {
      await ticketService.deleteImage(id, imageIndex)
      toast.success('Image deleted')
      fetchTicket()
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  if (loading) return <LoadingSpinner />
  if (!ticket) return <div>Ticket not found</div>

  const canEdit = ['SUPER_ADMIN', 'RECEPTIONIST'].includes(user?.role)
  const remainingImageSlots = 8 - (ticket.images?.length || 0)

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
          <PaymentStatusBadge status={ticket.paymentStatus || 'PENDING'} />
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

      {/* Images */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Images ({ticket.images?.length || 0}/8)</h2>
          {canEdit && remainingImageSlots > 0 && (
            <div className="flex gap-2">
              <button onClick={openFileSelector} className="btn btn-secondary text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload ({remainingImageSlots} left)
              </button>
              <button onClick={openCamera} className="btn btn-secondary text-sm flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Camera
              </button>
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />

        {ticket.images && ticket.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ticket.images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Ticket image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setSelectedImage(image)}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  {canEdit && (
                    <button 
                      onClick={() => handleDeleteImage(index)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No images uploaded yet</p>
        )}
      </div>

      {/* Diagnosis Section */}
      {canEdit && ['CREATED', 'IN_PROGRESS'].includes(ticket.status) && (
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
                <button type="submit" className="btn btn-primary">
                  Submit Diagnosis
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

      {/* Status Actions */}
      {canEdit && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {ticket.status === 'CREATED' && (
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
      {canEdit && ticket.status === 'RESOLVED' && (
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

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketDetails
