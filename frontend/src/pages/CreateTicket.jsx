import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketService } from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const CreateTicket = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    motherboardBrand: '',
    motherboardType: '',
    initialIssue: '',
    priority: 'MEDIUM'
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters'
    }
    
    if (!validatePhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid 10-digit Indian phone number'
    }
    
    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address'
    }
    
    if (!formData.motherboardBrand.trim()) {
      newErrors.motherboardBrand = 'Motherboard brand is required'
    }
    
    if (!formData.motherboardType.trim()) {
      newErrors.motherboardType = 'Motherboard model/type is required'
    }
    
    if (!formData.initialIssue.trim() || formData.initialIssue.trim().length < 10) {
      newErrors.initialIssue = 'Please provide a detailed description (at least 10 characters)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }
    
    setLoading(true)

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key])
      })
      if (image) {
        submitData.append('image', image)
      }

      const response = await ticketService.create(submitData)
      toast.success(`Ticket ${response.data.ticketNumber} created successfully!`)
      navigate('/tickets')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/tickets" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-500 mt-1">Enter customer and motherboard details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Customer Information */}
        <div>
          <h2 className="text-xl font-bold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                required
                className={`input ${errors.customerName ? 'border-red-500' : ''}`}
                value={formData.customerName}
                onChange={handleChange}
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input
                type="tel"
                name="customerPhone"
                required
                className={`input ${errors.customerPhone ? 'border-red-500' : ''}`}
                placeholder="+91XXXXXXXXXX or 10 digits"
                value={formData.customerPhone}
                onChange={handleChange}
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="label">Email (Optional)</label>
              <input
                type="email"
                name="customerEmail"
                className={`input ${errors.customerEmail ? 'border-red-500' : ''}`}
                value={formData.customerEmail}
                onChange={handleChange}
              />
              {errors.customerEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Motherboard Information */}
        <div>
          <h2 className="text-xl font-bold mb-4">Motherboard Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Brand *</label>
              <input
                type="text"
                name="motherboardBrand"
                required
                className={`input ${errors.motherboardBrand ? 'border-red-500' : ''}`}
                placeholder="ASUS, MSI, Gigabyte, etc."
                value={formData.motherboardBrand}
                onChange={handleChange}
              />
              {errors.motherboardBrand && (
                <p className="text-red-500 text-sm mt-1">{errors.motherboardBrand}</p>
              )}
            </div>
            <div>
              <label className="label">Model/Type *</label>
              <input
                type="text"
                name="motherboardType"
                required
                className={`input ${errors.motherboardType ? 'border-red-500' : ''}`}
                placeholder="ROG STRIX, Gaming X, etc."
                value={formData.motherboardType}
                onChange={handleChange}
              />
              {errors.motherboardType && (
                <p className="text-red-500 text-sm mt-1">{errors.motherboardType}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="label">Initial Issue/Problem *</label>
              <textarea
                name="initialIssue"
                required
                rows="4"
                className={`input ${errors.initialIssue ? 'border-red-500' : ''}`}
                placeholder="Describe the issue reported by customer..."
                value={formData.initialIssue}
                onChange={handleChange}
              />
              {errors.initialIssue && (
                <p className="text-red-500 text-sm mt-1">{errors.initialIssue}</p>
              )}
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                name="priority"
                className="input"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
          <Link to="/tickets" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default CreateTicket
