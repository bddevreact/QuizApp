import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Users, Lock, Unlock, Eye, BarChart3, Clock } from 'lucide-react'
import quizSecurityService from '../../services/quizSecurityService'
import firebaseService from '../../services/firebaseService'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminSecurity = () => {
  const [securityStats, setSecurityStats] = useState(null)
  const [blockedUsers, setBlockedUsers] = useState([])
  const [securityFlags, setSecurityFlags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      setIsLoading(true)
      
      const [stats, blocks, flags] = await Promise.all([
        quizSecurityService.getSecurityStats(),
        firebaseService.queryCollection('user_blocks', [
          { field: 'status', operator: '==', value: 'active' }
        ]),
        firebaseService.read('security_flags')
      ])

      setSecurityStats(stats)
      setBlockedUsers(blocks || [])
      setSecurityFlags(flags || [])
    } catch (error) {
      console.error('Error loading security data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockUser = async (userId, reason, duration = 24) => {
    try {
      await quizSecurityService.blockUser(userId, reason, duration)
      await loadSecurityData()
      alert(`User ${userId} blocked for ${duration} hours`)
    } catch (error) {
      console.error('Error blocking user:', error)
      alert('Error blocking user')
    }
  }

  const handleUnblockUser = async (userId) => {
    try {
      await quizSecurityService.unblockUser(userId)
      await loadSecurityData()
      alert(`User ${userId} unblocked`)
    } catch (error) {
      console.error('Error unblocking user:', error)
      alert('Error unblocking user')
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
        <LoadingSpinner size="large" text="Loading security data..." color="primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <span>Security Dashboard</span>
          </h1>
          <p className="text-gray-400">Monitor and manage quiz security</p>
        </div>
        <button
          onClick={loadSecurityData}
          className="btn-primary flex items-center space-x-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">{securityStats?.totalUsers || 0}</div>
          <div className="text-gray-400 text-sm">Total Users</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-400">{securityStats?.blockedUsers || 0}</div>
          <div className="text-gray-400 text-sm">Blocked Users</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-400">{securityStats?.securityFlags || 0}</div>
          <div className="text-gray-400 text-sm">Security Flags</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-400">
            {securityStats?.averageScore ? Math.round(securityStats.averageScore) : 0}%
          </div>
          <div className="text-gray-400 text-sm">Avg Score</div>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocked Users */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-red-400" />
            <span>Blocked Users</span>
          </h3>
          <div className="space-y-3">
            {blockedUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No blocked users</div>
            ) : (
              blockedUsers.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{block.userId}</div>
                    <div className="text-gray-400 text-sm">{block.reason}</div>
                    <div className="text-gray-500 text-xs">
                      Blocked: {formatDate(block.blockedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblockUser(block.userId)}
                    className="btn-sm bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  >
                    <Unlock className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Flags */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span>Recent Security Flags</span>
          </h3>
          <div className="space-y-3">
            {securityFlags.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No security flags</div>
            ) : (
              securityFlags.slice(0, 5).map((flag) => (
                <div key={flag.id} className="p-3 bg-yellow-500/10 rounded-lg">
                  <div className="text-white font-medium">{flag.userId}</div>
                  <div className="text-gray-400 text-sm">{flag.reason}</div>
                  <div className="text-gray-500 text-xs">
                    {formatDate(flag.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Quiz Limits</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Quizzes:</span>
                <span className="text-white">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hourly Quizzes:</span>
                <span className="text-white">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min Time Between:</span>
                <span className="text-white">30s</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Security Rules</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Suspicious Score:</span>
                <span className="text-white">95%+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rapid Answer Time:</span>
                <span className="text-white">2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Consecutive:</span>
                <span className="text-white">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const userId = prompt('Enter user ID to block:')
              const reason = prompt('Enter reason:')
              const duration = prompt('Enter duration (hours):', '24')
              if (userId && reason) {
                handleBlockUser(userId, reason, parseInt(duration))
              }
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Block User</span>
          </button>
          <button
            onClick={() => {
              const userId = prompt('Enter user ID to unblock:')
              if (userId) {
                handleUnblockUser(userId)
              }
            }}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unblock User</span>
          </button>
          <button
            onClick={loadSecurityData}
            className="btn-accent flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View All Flags</span>
          </button>
        </div>
      </div>

      {/* Security Tips */}
      <div className="card bg-blue-500/10 border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span>Security Tips</span>
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <div>• Monitor users with consistently high scores (95%+)</div>
          <div>• Watch for rapid answer patterns (under 2 seconds)</div>
          <div>• Check for multiple perfect scores in a row</div>
          <div>• Review users who complete quizzes too quickly</div>
          <div>• Block users who show suspicious behavior patterns</div>
        </div>
      </div>
    </div>
  )
}

export default AdminSecurity
