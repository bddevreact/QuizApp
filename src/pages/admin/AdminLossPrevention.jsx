import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingDown, AlertTriangle, Shield, BarChart3, Users, Clock } from 'lucide-react'
import firebaseService from '../../services/firebaseService'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminLossPrevention = () => {
  const [lossData, setLossData] = useState(null)
  const [suspiciousUsers, setSuspiciousUsers] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLossPreventionData()
  }, [])

  const loadLossPreventionData = async () => {
    try {
      setIsLoading(true)
      
      // Load various data for loss prevention analysis
      const [users, transactions, quizSessions] = await Promise.all([
        firebaseService.read('users'),
        firebaseService.read('transactions'),
        firebaseService.queryCollection('quiz_sessions', [], 'startedAt', 'desc', 100)
      ])

      // Calculate loss prevention metrics
      const totalUsers = users.length
      const totalTransactions = transactions.length
      const totalQuizSessions = quizSessions.length
      
      // Calculate total rewards given
      const totalRewards = transactions
        .filter(tx => tx.type === 'quiz_reward' || tx.type === 'daily_bonus' || tx.type === 'streak_bonus')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0)
      
      // Calculate suspicious users
      const suspicious = users.filter(user => {
        const winRate = user.winRate || 0
        const questionsAnswered = user.questionsAnswered || 0
        const totalEarned = user.totalEarned || 0
        
        return (
          (winRate > 95 && questionsAnswered > 50) ||
          (totalEarned > 1000 && questionsAnswered < 100) ||
          (winRate > 90 && questionsAnswered > 20 && totalEarned > 500)
        )
      })

      // Calculate recent high-value transactions
      const recentHighValue = transactions
        .filter(tx => (tx.amount || 0) > 10)
        .slice(0, 10)

      setLossData({
        totalUsers,
        totalTransactions,
        totalQuizSessions,
        totalRewards,
        suspiciousUsers: suspicious.length,
        averageReward: totalRewards / Math.max(totalTransactions, 1)
      })

      setSuspiciousUsers(suspicious)
      setRecentTransactions(recentHighValue)

    } catch (error) {
      console.error('Error loading loss prevention data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
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

  const getRiskLevel = (user) => {
    const winRate = user.winRate || 0
    const questionsAnswered = user.questionsAnswered || 0
    const totalEarned = user.totalEarned || 0

    if (winRate > 95 && questionsAnswered > 50) return 'high'
    if (totalEarned > 1000 && questionsAnswered < 100) return 'high'
    if (winRate > 90 && questionsAnswered > 20) return 'medium'
    return 'low'
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" text="Loading loss prevention data..." color="primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Shield className="w-8 h-8 text-red-400" />
            <span>Loss Prevention Dashboard</span>
          </h1>
          <p className="text-gray-400">Monitor and prevent admin losses</p>
        </div>
        <button
          onClick={loadLossPreventionData}
          className="btn-primary flex items-center space-x-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loss Prevention Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">{lossData?.totalUsers || 0}</div>
          <div className="text-gray-400 text-sm">Total Users</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-400">{lossData?.suspiciousUsers || 0}</div>
          <div className="text-gray-400 text-sm">Suspicious Users</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {formatCurrency(lossData?.totalRewards || 0)}
          </div>
          <div className="text-gray-400 text-sm">Total Rewards Given</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(lossData?.averageReward || 0)}
          </div>
          <div className="text-gray-400 text-sm">Avg Reward</div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="card bg-red-500/10 border border-red-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Risk Alerts</span>
        </h3>
        <div className="space-y-3">
          {lossData?.suspiciousUsers > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
              <div>
                <div className="text-white font-medium">High-Risk Users Detected</div>
                <div className="text-gray-400 text-sm">
                  {lossData.suspiciousUsers} users showing suspicious patterns
                </div>
              </div>
              <div className="text-red-400 font-bold">HIGH RISK</div>
            </div>
          )}
          
          {lossData?.totalRewards > 10000 && (
            <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg">
              <div>
                <div className="text-white font-medium">High Reward Distribution</div>
                <div className="text-gray-400 text-sm">
                  Total rewards exceed $10,000
                </div>
              </div>
              <div className="text-yellow-400 font-bold">MEDIUM RISK</div>
            </div>
          )}
        </div>
      </div>

      {/* Suspicious Users */}
      <div className="card">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-red-400" />
          <span>Suspicious Users</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">User ID</th>
                <th className="text-left py-3 px-4 text-gray-300">Win Rate</th>
                <th className="text-left py-3 px-4 text-gray-300">Questions</th>
                <th className="text-left py-3 px-4 text-gray-300">Total Earned</th>
                <th className="text-left py-3 px-4 text-gray-300">Risk Level</th>
                <th className="text-left py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suspiciousUsers.map((user) => {
                const riskLevel = getRiskLevel(user)
                return (
                  <tr key={user.userId} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{user.userId}</div>
                      <div className="text-gray-400 text-sm">{user.telegramFullName || user.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${getRiskColor(riskLevel)}`}>
                        {user.winRate || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {user.questionsAnswered || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {formatCurrency(user.totalEarned || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        riskLevel === 'high' 
                          ? 'bg-red-500/20 text-red-400'
                          : riskLevel === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Block user
                            if (confirm(`Block user ${user.userId}?`)) {
                              // Implement block functionality
                              console.log('Block user:', user.userId)
                            }
                          }}
                          className="btn-sm bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          Block
                        </button>
                        <button
                          onClick={() => {
                            // View details
                            console.log('View user details:', user)
                          }}
                          className="btn-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent High-Value Transactions */}
      <div className="card">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span>Recent High-Value Transactions</span>
        </h3>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-4 text-gray-400">No high-value transactions</div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div>
                  <div className="text-white font-medium">{tx.type}</div>
                  <div className="text-gray-400 text-sm">User: {tx.userId}</div>
                  <div className="text-gray-500 text-xs">
                    {formatDate(tx.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">
                    +{formatCurrency(tx.amount || 0)}
                  </div>
                  <div className="text-gray-400 text-sm">{tx.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Loss Prevention Tips */}
      <div className="card bg-blue-500/10 border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span>Loss Prevention Tips</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="text-white font-medium mb-2">Monitor These Patterns:</h4>
            <ul className="space-y-1">
              <li>• Users with 95%+ win rate</li>
              <li>• High earnings with few questions</li>
              <li>• Rapid quiz completion times</li>
              <li>• Multiple perfect scores</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Take These Actions:</h4>
            <ul className="space-y-1">
              <li>• Block suspicious users</li>
              <li>• Reduce reward multipliers</li>
              <li>• Implement time delays</li>
              <li>• Review transaction patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLossPrevention
