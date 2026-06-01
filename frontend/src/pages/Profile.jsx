import { useAuth } from '../contexts/AuthContext'
import { USER_ROLES } from '../utils/constants'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <p className="font-medium text-lg">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <p className="font-medium">{user?.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Role</label>
            <div className="mt-1">
              <span className={`badge ${USER_ROLES[user?.role]?.color || ''}`}>
                {USER_ROLES[user?.role]?.label || user?.role}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Account Created</label>
            <p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Security</h2>
        <p className="text-gray-600 mb-4">Password management features coming soon.</p>
        <button className="btn btn-secondary" disabled>
          Change Password
        </button>
      </div>
    </div>
  )
}

export default Profile
