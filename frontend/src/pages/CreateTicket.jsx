import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketService } from '../services/api'
import { compressImages } from '../utils/imageCompression'
import { ArrowLeft, Upload, Camera, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const CreateTicket = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    motherboardBrand: '',
    motherboardType: '',
    initialIssue: ''
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageSelect = async (files) => {
    if (!files || files.length === 0) return

    const totalImages = images.length + files.length
    if (totalImages > 8) {
      toast.error(`Cannot add ${files.length} images. Maximum 8 images allowed.`)
      return
    }

    toast.loading('Compressing images...', { id: 'compress' })
    
    try {
      // Compress images to reduce memory usage
      const compressedFiles = await compressImages(files, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        maxSizeMB: 1
      })
      
      const newImages = compressedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))
      
      setImages([...images, ...newImages])
      toast.success('Images added successfully', { id: 'compress' })
    } catch (error) {
      console.error('Image compression error:', error)
      toast.error('Failed to process images', { id: 'compress' })
    }
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(images[index].preview)
    setImages(newImages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Append images
      images.forEach(img => {
        formDataToSend.append('images', img.file)
      })

      const response = await ticketService.create(formDataToSend)
      toast.success('Ticket created successfully!')
      
      // Cleanup object URLs
      images.forEach(img => URL.revokeObjectURL(img.preview))
      
      navigate(`/tickets/${response.data.id}`)
    } catch (error) {
      console.error('Create ticket error:', error)
      
      // Show specific validation errors if available
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err, { duration: 5000 })
        })
      } else {
        toast.error(error.response?.data?.message || 'Failed to create ticket')
      }
    } finally {
      setLoading(false)
    }
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  const remainingSlots = 8 - images.length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/tickets" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-500 mt-1">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                required
                minLength="2"
                className="input"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer name (min 2 chars)"
              />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input
                type="tel"
                name="customerPhone"
                required
                pattern="[6-9][0-9]{9}"
                className="input"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="9876543210 (10 digits)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
            </div>
            <div className="md:col-span-2">
              <label className="label">Email (Optional)</label>
              <input
                type="email"
                name="customerEmail"
                className="input"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="customer@example.com"
              />
            </div>
          </div>
        </div>

        {/* Motherboard Information */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Motherboard Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Brand *</label>
              <input
                type="text"
                name="motherboardBrand"
                required
                minLength="2"
                className="input"
                value={formData.motherboardBrand}
                onChange={handleChange}
                placeholder="e.g., ASUS, MSI, Gigabyte"
              />
            </div>
            <div>
              <label className="label">Model/Type *</label>
              <input
                type="text"
                name="motherboardType"
                required
                minLength="2"
                className="input"
                value={formData.motherboardType}
                onChange={handleChange}
                placeholder="e.g., ROG STRIX B550-F"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Initial Issue *</label>
              <textarea
                name="initialIssue"
                required
                minLength="10"
                rows="4"
                className="input"
                value={formData.initialIssue}
                onChange={handleChange}
                placeholder="Describe the problem in detail (min 10 characters)..."
              />
              <p className="text-xs text-gray-500 mt-1">Provide detailed information about the motherboard issue</p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Images ({images.length}/8)</h2>
            {remainingSlots > 0 && (
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={openFileSelector} 
                  className="btn btn-secondary text-sm flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload ({remainingSlots} left)
                </button>
                <button 
                  type="button"
                  onClick={openCamera} 
                  className="btn btn-secondary text-sm flex items-center gap-2"
                >
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
            onChange={(e) => handleImageSelect(e.target.files)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleImageSelect(e.target.files)}
          />

          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={img.preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No images selected</p>
              <p className="text-sm mt-1">Add up to 8 images using the buttons above</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
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
