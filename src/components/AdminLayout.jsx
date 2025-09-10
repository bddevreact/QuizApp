import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminSidebar from './admin/AdminSidebar'
import AdminTopbar from './admin/AdminTopbar'

const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [location])

  const checkAuth = () => {
    const adminAuth = localStorage.getItem('adminAuthenticated')
    const isLoginPage = location.pathname === '/admin/login'
    
    if (!adminAuth && !isLoginPage) {
      navigate('/admin/login')
      return
    }
    
    if (adminAuth && isLoginPage) {
      navigate('/admin/dashboard')
      return
    }
    
    setIsAuthenticated(!!adminAuth)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Don't wrap login page with layout
  if (location.pathname === '/admin/login') {
    return children
  }

  // Check if user is authenticated for admin pages
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <AdminTopbar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />
      
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
