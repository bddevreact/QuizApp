import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Users,
  Calendar,
  X
} from 'lucide-react'
import dataService from '../../services/dataService'

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, statusFilter, typeFilter])

  const loadTransactions = async () => {
    try {
      // Initialize dataService if not already initialized
      if (!dataService.isInitialized) {
        await dataService.initializeData()
      }
      
      // Load real transactions from dataService
      const transactionsData = await dataService.getTransactions()
      const realTransactions = await Promise.all((Array.isArray(transactionsData) ? transactionsData : []).map(async tx => {
        const user = await dataService.getUserById(tx.userId) || dataService.userData
        return {
          ...tx,
          userFullName: user?.telegramFullName || user?.fullName || 'Unknown User',
          userUsername: user?.telegramUsername || user?.username || 'unknown',
          walletAddress: tx.walletAddress || 'N/A',
          notes: tx.notes || `${tx.type} transaction`
        }
      }))
      setTransactions(realTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
      setTransactions([])
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.userUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.txHash.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    setFilteredTransactions(filtered)
  }

  const approveTransaction = async (transactionId) => {
    try {
      // Import balanceService for deposit approval
      const { default: balanceService } = await import('../../services/balanceService')
      
      // Check if it's a deposit transaction
      const transaction = transactions.find(t => t.id === transactionId)
      if (transaction && transaction.type === 'deposit') {
        const result = await balanceService.approveDeposit(transactionId)
        if (result.success) {
          setTransactions(prev => 
            prev.map(t => t.id === transactionId ? { ...t, status: 'completed' } : t)
          )
          alert(`Deposit approved! User balance updated.`)
        } else {
          alert(`Failed to approve deposit: ${result.message}`)
        }
      } else {
        // Handle other transaction types
        const success = await dataService.approveTransaction(transactionId)
        if (success) {
          setTransactions(prev => 
            prev.map(t => t.id === transactionId ? { ...t, status: 'completed' } : t)
          )
        }
      }
    } catch (error) {
      console.error('Error approving transaction:', error)
      alert(`Error approving transaction: ${error.message}`)
    }
  }

  const rejectTransaction = async (transactionId) => {
    try {
      // Import balanceService for deposit rejection
      const { default: balanceService } = await import('../../services/balanceService')
      
      // Check if it's a deposit transaction
      const transaction = transactions.find(t => t.id === transactionId)
      if (transaction && transaction.type === 'deposit') {
        const reason = prompt('Enter rejection reason:') || 'Admin rejected'
        const result = await balanceService.rejectDeposit(transactionId, reason)
        if (result.success) {
          setTransactions(prev => 
            prev.map(t => t.id === transactionId ? { ...t, status: 'rejected' } : t)
          )
          alert(`Deposit rejected: ${reason}`)
        } else {
          alert(`Failed to reject deposit: ${result.message}`)
        }
      } else {
        // Handle other transaction types
        const success = await dataService.rejectTransaction(transactionId, 'Admin rejected')
        if (success) {
          setTransactions(prev => 
            prev.map(t => t.id === transactionId ? { ...t, status: 'failed' } : t)
          )
        }
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      alert(`Error rejecting transaction: ${error.message}`)
    }
  }

  const exportTransactions = () => {
    const csvContent = [
      ['ID', 'User', 'Type', 'Amount', 'Network', 'Status', 'Date', 'Hash'],
      ...filteredTransactions.map(t => [
        t.id,
        t.userFullName,
        t.type,
        t.amount,
        t.network,
        t.status,
        new Date(t.timestamp).toLocaleDateString(),
        t.txHash
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status) => {
    const config = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed', icon: XCircle },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected', icon: XCircle },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing', icon: Activity }
    }
    
    const statusConfig = config[status] || config.pending
    const Icon = statusConfig.icon
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.text}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const config = {
      deposit: { color: 'bg-green-100 text-green-800', text: 'Deposit' },
      withdrawal: { color: 'bg-red-100 text-red-800', text: 'Withdrawal' },
      quiz_reward: { color: 'bg-blue-100 text-blue-800', text: 'Quiz Reward' },
      tournament_win: { color: 'bg-purple-100 text-purple-800', text: 'Tournament Win' },
      referral_bonus: { color: 'bg-orange-100 text-orange-800', text: 'Referral Bonus' }
    }
    
    const typeConfig = config[type] || config.deposit
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig.color}`}>
        {typeConfig.text}
      </span>
    )
  }

  const getNetworkBadge = (network) => (
    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
      {network}
    </span>
  )

  const getStats = () => {
    const totalTransactions = transactions.length
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length
    const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const completedTransactions = transactions.filter(t => t.status === 'completed').length

    return { totalTransactions, pendingTransactions, totalVolume, completedTransactions }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
              <p className="text-gray-600">Review and approve deposits, withdrawals, and rewards</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportTransactions}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">${(stats.totalVolume || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTransactions || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
              </select>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="quiz_reward">Quiz Rewards</option>
                <option value="tournament_win">Tournament Wins</option>
                <option value="referral_bonus">Referral Bonuses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Network
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount & Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proof
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(transaction.userFullName || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.userFullName || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{transaction.userUsername || 'unknown'}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {(transaction.txHash || 'N/A').substring(0, 20)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getTypeBadge(transaction.type)}
                        {transaction.network !== 'N/A' && getNetworkBadge(transaction.network)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(transaction.amount || 0).toFixed(2)}
                      </div>
                      {transaction.fee > 0 && (
                        <div className="text-xs text-gray-500">
                          Fee: ${(transaction.fee || 0).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.type === 'deposit' && transaction.details?.proofUrl ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 text-xs">Proof</span>
                        </div>
                      ) : transaction.type === 'deposit' ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-600 text-xs">No Proof</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction)
                            setShowTransactionModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveTransaction(transaction.id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTransactions.length}</span> of{' '}
              <span className="font-medium">{transactions.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Name:</span>
                      <span className="text-gray-900">{selectedTransaction.userFullName || 'Unknown User'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Username:</span>
                      <span className="text-gray-900">@{selectedTransaction.userUsername || 'unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">User ID:</span>
                      <span className="text-gray-900">{selectedTransaction.userId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      {getTypeBadge(selectedTransaction.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="text-gray-900">${(selectedTransaction.amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fee:</span>
                      <span className="text-gray-900">${(selectedTransaction.fee || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Technical Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction Hash:</span>
                    <span className="text-gray-900 font-mono text-xs">{selectedTransaction.txHash || 'N/A'}</span>
                  </div>
                  {selectedTransaction.network !== 'N/A' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Network:</span>
                      {getNetworkBadge(selectedTransaction.network)}
                    </div>
                  )}
                  {selectedTransaction.walletAddress !== 'N/A' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wallet Address:</span>
                      <span className="text-gray-900 font-mono text-xs">{selectedTransaction.walletAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Timestamp:</span>
                    <span className="text-gray-900">{new Date(selectedTransaction.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deposit Proof Section */}
              {selectedTransaction.type === 'deposit' && selectedTransaction.details?.proofUrl && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Deposit Proof</h4>
                  <div className="space-y-3">
                    {selectedTransaction.details?.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="text-gray-900 font-mono text-xs">{selectedTransaction.details.transactionId}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 block mb-2">Proof Screenshot:</span>
                      <div className="border border-gray-200 rounded-lg p-2">
                        <img
                          src={selectedTransaction.details.proofUrl}
                          alt="Deposit proof"
                          className="w-full max-w-md h-auto rounded cursor-pointer hover:opacity-80"
                          onClick={() => window.open(selectedTransaction.details.proofUrl, '_blank')}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Click image to view full size</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTransaction.notes && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedTransaction.notes}
                  </p>
                </div>
              )}

              {selectedTransaction.status === 'pending' && (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      approveTransaction(selectedTransaction.id)
                      setShowTransactionModal(false)
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve Transaction
                  </button>
                  <button
                    onClick={() => {
                      rejectTransaction(selectedTransaction.id)
                      setShowTransactionModal(false)
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject Transaction
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

export default AdminTransactions
