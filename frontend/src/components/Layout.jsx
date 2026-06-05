import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  CircuitBoard, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'RECEPTIONIST'] },
    { name: 'Tickets', href: '/tickets', icon: Ticket, roles: ['SUPER_ADMIN', 'RECEPTIONIST'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['SUPER_ADMIN'] },
    { name: 'Motherboards', href: '/motherboards', icon: CircuitBoard, roles: ['SUPER_ADMIN'] }
  ]

  const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 w-72 sm:w-64 h-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b">
            <div className="flex items-center space-x-2">
              <CircuitBoard className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Ticket System</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg transition-colors min-h-[48px]
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="border-t p-3 sm:p-4">
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[48px]"
            >
              <User className="h-5 w-5 text-gray-700 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg hover:bg-red-50 active:bg-red-100 text-red-600 transition-colors mt-2 min-h-[48px]"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm h-14 sm:h-16 flex items-center px-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 p-2 -ml-2 hover:bg-gray-100 rounded active:bg-gray-200"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <div className="ml-2 sm:ml-4 flex items-center space-x-2">
            <CircuitBoard className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            <span className="text-base sm:text-lg font-bold text-gray-900">Ticket System</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
