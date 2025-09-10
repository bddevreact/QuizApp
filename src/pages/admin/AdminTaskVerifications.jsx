import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Search, Filter, RefreshCw, Eye, AlertCircle, Image, ExternalLink } from 'lucide-react'
import taskVerificationService from '../../services/taskVerificationService'
import firebaseService from '../../services/firebaseService'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminTaskVerifications = () => {
  const [verifications, setVerifications] = useState([])
  const [taskProofs, setTaskProofs] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTaskType, setFilterTaskType] = useState('all')
  const [selectedProof, setSelectedProof] = useState(null)
  const [showProofModal, setShowProofModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load all data in parallel
      const [verificationsData, proofsData, tasksData, usersData] = await Promise.all([
        firebaseService.read('task_completions'),
        taskVerificationService.getPendingTaskProofs(),
        firebaseService.read('tasks'),
        firebaseService.read('users')
      ])

      setVerifications(verificationsData || [])
      setTaskProofs(proofsData || [])
      setTasks(tasksData || [])
      setUsers(usersData || [])
    } catch (error) {
      console.error('Error loading verification data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId)
  }

  const getUserById = (userId) => {
    return users.find(user => user.userId === userId)
  }

  const handleViewProof = (proof) => {
    setSelectedProof(proof)
    setShowProofModal(true)
  }

  const handleApproveProof = async (proofId) => {
    try {
      const result = await taskVerificationService.approveTaskProof(proofId)
      if (result.success) {
        alert('Task proof approved successfully!')
        loadData() // Reload data
      } else {
        alert(`Failed to approve proof: ${result.message}`)
      }
    } catch (error) {
      console.error('Error approving proof:', error)
      alert('Failed to approve proof')
    }
  }

  const handleRejectProof = async (proofId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      const result = await taskVerificationService.rejectTaskProof(proofId, rejectionReason)
      if (result.success) {
        alert('Task proof rejected successfully!')
        setRejectionReason('')
        setShowProofModal(false)
        loadData() // Reload data
      } else {
        alert(`Failed to reject proof: ${result.message}`)
      }
    } catch (error) {
      console.error('Error rejecting proof:', error)
      alert('Failed to reject proof')
    }
  }

  const filteredTaskProofs = taskProofs.filter(proof => {
    const task = getTaskById(proof.taskId)
    const user = getUserById(proof.userId)
    
    // Search filter
    const matchesSearch = searchTerm === '' || 
      (task?.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user?.telegramFullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user?.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (proof.username?.toLowerCase().includes(searchTerm.toLowerCase()))

    // Status filter
    const matchesStatus = filterStatus === 'all' || proof.status === filterStatus

    // Task type filter
    const matchesTaskType = filterTaskType === 'all' || task?.type === filterTaskType

    return matchesSearch && matchesStatus && matchesTaskType
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      case 'pending':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" text="Loading verifications..." color="primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Task Verifications</h1>
          <p className="text-gray-400">Monitor and manage task completion verifications</p>
        </div>
        <button
          onClick={loadData}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">{taskProofs.length}</div>
          <div className="text-gray-400 text-sm">Total Proofs</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-400">
            {taskProofs.filter(p => p.status === 'approved').length}
          </div>
          <div className="text-gray-400 text-sm">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-400">
            {taskProofs.filter(p => p.status === 'rejected').length}
          </div>
          <div className="text-gray-400 text-sm">Rejected</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {taskProofs.filter(p => p.status === 'pending').length}
          </div>
          <div className="text-gray-400 text-sm">Pending Review</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by task name or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filterTaskType}
              onChange={(e) => setFilterTaskType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="daily_bonus">Daily Bonus</option>
              <option value="referral">Referral</option>
              <option value="level_up">Level Up</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Proofs Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Task</th>
                <th className="text-left py-3 px-4 text-gray-300">User</th>
                <th className="text-left py-3 px-4 text-gray-300">Proof Details</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-gray-300">Submitted At</th>
                <th className="text-left py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaskProofs.map((proof) => {
                const task = getTaskById(proof.taskId)
                const user = getUserById(proof.userId)
                
                return (
                  <tr key={proof.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-white font-medium">{task?.title || 'Unknown Task'}</div>
                        <div className="text-gray-400 text-sm">{task?.description || ''}</div>
                        <div className="text-green-400 text-sm font-medium">Reward: ${task?.reward || 0}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-white font-medium">
                          {user?.telegramFullName || user?.username || 'Unknown User'}
                        </div>
                        <div className="text-gray-400 text-sm">ID: {proof.userId}</div>
                        <div className="text-blue-400 text-sm">Username: {proof.username}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="w-4 h-4 text-blue-400" />
                          <a 
                            href={proof.taskUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm hover:underline truncate max-w-32"
                          >
                            View Task
                          </a>
                        </div>
                        {proof.screenshot && (
                          <div className="flex items-center space-x-2">
                            <Image className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">Screenshot provided</span>
                          </div>
                        )}
                        {proof.description && (
                          <div className="text-gray-400 text-xs max-w-32 truncate">
                            {proof.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(proof.status)}
                        <span className={getStatusColor(proof.status)}>
                          {proof.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {formatDate(proof.submittedAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProof(proof)}
                          className="btn-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {proof.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveProof(proof.id)}
                              className="btn-sm bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason:')
                                if (reason) {
                                  setRejectionReason(reason)
                                  handleRejectProof(proof.id)
                                }
                              }}
                              className="btn-sm bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredTaskProofs.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400">No task proofs found</div>
          </div>
        )}
      </div>

      {/* Proof Viewing Modal */}
      {showProofModal && selectedProof && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Task Proof Review</h3>
                <button
                  onClick={() => setShowProofModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Task Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {getTaskById(selectedProof.taskId)?.title || 'Unknown Task'}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {getTaskById(selectedProof.taskId)?.description || ''}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    Reward: ${getTaskById(selectedProof.taskId)?.reward || 0} USDT
                  </span>
                  <a
                    href={selectedProof.taskUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open Task
                  </a>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Name: </span>
                    <span className="text-sm font-medium">
                      {getUserById(selectedProof.userId)?.telegramFullName || 'Unknown User'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">User ID: </span>
                    <span className="text-sm font-mono">{selectedProof.userId}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Task Username: </span>
                    <span className="text-sm font-medium">{selectedProof.username}</span>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              {selectedProof.screenshot && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Screenshot</h4>
                  <img
                    src={selectedProof.screenshot}
                    alt="Task completion screenshot"
                    className="w-full max-w-2xl mx-auto rounded-lg border"
                  />
                </div>
              )}

              {/* Description */}
              {selectedProof.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Additional Description</h4>
                  <p className="text-sm text-gray-600">{selectedProof.description}</p>
                </div>
              )}

              {/* Submission Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Submitted: </span>
                    <span className="text-sm">{formatDate(selectedProof.submittedAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status: </span>
                    <span className={`text-sm font-medium ${
                      selectedProof.status === 'approved' ? 'text-green-600' :
                      selectedProof.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {selectedProof.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedProof.status === 'pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleApproveProof(selectedProof.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:')
                      if (reason) {
                        setRejectionReason(reason)
                        handleRejectProof(selectedProof.id)
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTaskVerifications