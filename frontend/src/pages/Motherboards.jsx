import { useState, useEffect } from 'react'
import { motherboardService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Motherboards = () => {
  const [motherboards, setMotherboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    brandName: '',
    modelSeries: '',
    category: ''
  })

  useEffect(() => {
    fetchMotherboards()
  }, [])

  const fetchMotherboards = async () => {
    try {
      const response = await motherboardService.getAll()
      setMotherboards(response.data)
    } catch (error) {
      toast.error('Failed to fetch motherboards')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await motherboardService.create(formData)
      toast.success('Motherboard type added')
      setShowModal(false)
      setFormData({ brandName: '', modelSeries: '', category: '' })
      fetchMotherboards()
    } catch (error) {
      toast.error('Failed to add motherboard type')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      await motherboardService.delete(id)
      toast.success('Motherboard type deleted')
      fetchMotherboards()
    } catch (error) {
      toast.error('Failed to delete motherboard type')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Motherboard Types</h1>
          <p className="text-gray-500 mt-1">Manage motherboard brands and models</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motherboards.map(mb => (
          <div key={mb.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{mb.brandName}</h3>
                <p className="text-gray-600">{mb.modelSeries}</p>
                {mb.category && (
                  <span className="badge bg-gray-100 text-gray-800 mt-2">{mb.category}</span>
                )}
              </div>
              <button onClick={() => handleDelete(mb.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {motherboards.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No motherboard types added yet
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Motherboard Type</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Brand Name</label>
                <input type="text" required className="input" placeholder="ASUS, MSI, Gigabyte..."
                  value={formData.brandName}
                  onChange={(e) => setFormData({...formData, brandName: e.target.value})} />
              </div>
              <div>
                <label className="label">Model Series</label>
                <input type="text" required className="input" placeholder="ROG STRIX, Gaming X..."
                  value={formData.modelSeries}
                  onChange={(e) => setFormData({...formData, modelSeries: e.target.value})} />
              </div>
              <div>
                <label className="label">Category (Optional)</label>
                <input type="text" className="input" placeholder="Gaming, Workstation..."
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary flex-1">Add</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Motherboards
