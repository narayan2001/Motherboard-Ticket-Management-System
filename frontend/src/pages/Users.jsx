import { useState, useEffect } from 'react'
import { userService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'RECEPTIONIST',
    phone: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll()
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await userService.create(formData)
      toast.success('User created successfully')
      setShowModal(false)
      setFormData({ email: '', password: '', name: '', role: 'RECEPTIONIST', phone: '' })
      fetchUsers()
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? If the user has created tickets or data, they will be deactivated instead.')) return
    try {
      const response = await userService.delete(id)
      toast.success(response.message || 'User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users and roles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      <div className="card overflow-x-auto">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map(user => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="badge bg-blue-100 text-blue-800">{user.role}</span>
                  </td>
                  <td className="py-3">
                    <span className={`badge ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded active:bg-red-100 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {users.map(user => (
            <div key={user.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {user.phone && <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>}
                </div>
                <button 
                  onClick={() => handleDelete(user.id)} 
                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded active:bg-red-100 transition-colors ml-2 flex-shrink-0"
                  title="Delete user"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-blue-100 text-blue-800">{user.role}</span>
                <span className={`badge ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input type="text" required className="input" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" required className="input" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" required className="input" value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" className="input" value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
