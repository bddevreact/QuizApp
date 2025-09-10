import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Download,
  Plus,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Activity,
  X
} from 'lucide-react'
import dataService from '../../services/dataService'
import AdminLayout from '../../components/AdminLayout'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  const loadUsers = async () => {
    try {
      // Load real users from data service
      const realUsers = await dataService.getAllUsers()
      setUsers(Array.isArray(realUsers) ? realUsers : [])
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        (user.fullName || user.telegramFullName || user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.telegramUsername || user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // Update in data service
      const success = await dataService.updateUserStatus(userId, newStatus)
      
      if (success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, status: newStatus } : user
          )
        )
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
    
    // Update user interface data in real-time
    const updatedUser = users.find(u => u.id === userId)
    if (updatedUser) {
      // Update localStorage for user interface
      const userInterfaceData = JSON.parse(localStorage.getItem('userData') || '{}')
      if (userInterfaceData.id === userId) {
        userInterfaceData.status = newStatus
        localStorage.setItem('userData', JSON.stringify(userInterfaceData))
      }
      
      // Show success notification
      alert(`User ${updatedUser.telegramFullName} status updated to ${newStatus}`)
    }
  }

  const toggleVerification = async (userId) => {
    try {
      // Update in data service
      const success = await dataService.toggleUserVerification(userId)
      
      if (success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, isVerified: !user.isVerified } : user
          )
        )
      }
    } catch (error) {
      console.error('Error toggling user verification:', error)
    }
    
    // Update user interface data in real-time
    const updatedUser = users.find(u => u.id === userId)
    if (updatedUser) {
      // Update localStorage for user interface
      const userInterfaceData = JSON.parse(localStorage.getItem('userData') || '{}')
      if (userInterfaceData.id === userId) {
        userInterfaceData.isVerified = !updatedUser.isVerified
        localStorage.setItem('userData', JSON.stringify(userInterfaceData))
      }
      
      // Show success notification
      alert(`User ${updatedUser.telegramFullName} verification ${!updatedUser.isVerified ? 'enabled' : 'disabled'}`)
    }
  }

  const deleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // Remove from data service
      dataService.deleteUser(userId)
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
      
      // Clear user interface data if it's the current user
      const userInterfaceData = JSON.parse(localStorage.getItem('userData') || '{}')
      if (userInterfaceData.id === userId) {
        localStorage.removeItem('userData')
        alert('User account deleted. Please log in again.')
      }
      
      // Show success notification
      alert('User deleted successfully')
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Name', 'Username', 'Email', 'Status', 'Level', 'Total Earned', 'Join Date'],
      ...filteredUsers.map(user => [
        user.id,
        user.fullName || user.telegramFullName || user.username || 'Unknown',
        user.telegramUsername || user.username || 'N/A',
        user.email || 'N/A',
        user.status || 'unknown',
        user.level || 1,
        user.totalEarned || 0,
        user.joinDate || 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      suspended: { color: 'bg-red-100 text-red-800', text: 'Suspended' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      banned: { color: 'bg-gray-100 text-gray-800', text: 'Banned' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getVerificationBadge = (isVerified) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isVerified 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {isVerified ? 'Verified' : 'Unverified'}
    </span>
  )

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                User Management
              </h2>
              <p className="text-slate-600 text-lg">Manage all users, their status, and account details</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportUsers}
                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Level & XP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Financial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(user.fullName || user.telegramFullName || user.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-800">
                            {user.fullName || user.telegramFullName || user.username || 'Unknown'}
                          </div>
                          <div className="text-sm text-slate-500">
                            @{user.telegramUsername || user.username || 'unknown'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {user.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getStatusBadge(user.status)}
                        {getVerificationBadge(user.isVerified)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">
                        Level {user.level || 1}
                      </div>
                      <div className="text-sm text-slate-500">
                        {user.xp || 0} XP
                      </div>
                      <div className="text-xs text-slate-400">
                        Joined {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">
                        ${(user.availableBalance || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-500">
                        Total: ${(user.totalEarned || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">
                        Deposited: ${(user.totalDeposited || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">
                        {user.averageScore || 0}% Avg
                      </div>
                      <div className="text-sm text-slate-500">
                        {user.correctAnswers || 0}/{user.questionsAnswered || 0} Correct
                      </div>
                      <div className="text-xs text-slate-400">
                        {user.tournamentsWon || 0}/{user.totalTournaments || 0} Wins
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleVerification(user.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.isVerified ? 'text-red-600 hover:text-red-900 hover:bg-red-50' : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={user.isVerified ? 'Remove Verification' : 'Verify User'}
                        >
                          {user.isVerified ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === 'active' ? 'text-red-600 hover:text-red-900 hover:bg-red-50' : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 px-6 py-3 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              Showing <span className="font-semibold">1</span> to <span className="font-semibold">{filteredUsers.length}</span> of{' '}
              <span className="font-semibold">{users.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Full Name:</span>
                      <span className="text-slate-900">{selectedUser.telegramFullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Username:</span>
                      <span className="text-slate-900">@{selectedUser.telegramUsername}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-900">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="text-slate-900">{selectedUser.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Join Date:</span>
                      <span className="text-slate-900">{selectedUser.joinDate}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Account Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verified:</span>
                      {getVerificationBadge(selectedUser.isVerified)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Level:</span>
                      <span className="text-slate-900">{selectedUser.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">XP:</span>
                      <span className="text-slate-900">{selectedUser.xp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Streak:</span>
                      <span className="text-slate-900">{selectedUser.streak} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsers
