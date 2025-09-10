import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { 
  clearAllData, 
  clearUserDataOnly, 
  clearContentDataOnly, 
  clearLocalStorage, 
  getDatabaseStats, 
  resetDatabase 
} from '../../utils/clearDatabase'

const AdminDatabase = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLog, setActionLog] = useState([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const databaseStats = await getDatabaseStats()
      setStats(databaseStats)
    } catch (error) {
      console.error('Error loading database stats:', error)
      addToLog('❌ Error loading database stats', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addToLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setActionLog(prev => [...prev, { message, type, timestamp }])
  }

  const handleClearAllData = async () => {
    try {
      setLoading(true)
      addToLog('🚨 Starting to clear all database data...', 'warning')
      
      const success = await clearAllData()
      if (success) {
        addToLog('✅ All database data cleared successfully', 'success')
        await loadStats() // Refresh stats
      } else {
        addToLog('❌ Failed to clear database data', 'error')
      }
    } catch (error) {
      addToLog(`❌ Error clearing database: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClearUserData = async () => {
    try {
      setLoading(true)
      addToLog('🧹 Starting to clear user data only...', 'warning')
      
      const success = await clearUserDataOnly()
      if (success) {
        addToLog('✅ User data cleared successfully', 'success')
        await loadStats() // Refresh stats
      } else {
        addToLog('❌ Failed to clear user data', 'error')
      }
    } catch (error) {
      addToLog(`❌ Error clearing user data: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClearContentData = async () => {
    try {
      setLoading(true)
      addToLog('🧹 Starting to clear content data only...', 'warning')
      
      const success = await clearContentDataOnly()
      if (success) {
        addToLog('✅ Content data cleared successfully', 'success')
        await loadStats() // Refresh stats
      } else {
        addToLog('❌ Failed to clear content data', 'error')
      }
    } catch (error) {
      addToLog(`❌ Error clearing content data: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClearLocalStorage = async () => {
    try {
      setLoading(true)
      addToLog('🧹 Clearing localStorage...', 'info')
      
      const removedCount = clearLocalStorage()
      addToLog(`✅ Removed ${removedCount} items from localStorage`, 'success')
    } catch (error) {
      addToLog(`❌ Error clearing localStorage: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetDatabase = async () => {
    try {
      setLoading(true)
      addToLog('🔄 Starting database reset...', 'warning')
      
      const success = await resetDatabase()
      if (success) {
        addToLog('✅ Database reset completed successfully', 'success')
        await loadStats() // Refresh stats
      } else {
        addToLog('❌ Failed to reset database', 'error')
      }
    } catch (error) {
      addToLog(`❌ Error resetting database: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const clearLog = () => {
    setActionLog([])
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
          <p className="text-gray-600">Manage and clear Firebase database data</p>
        </div>

        {/* Database Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Database Statistics</h2>
            <button
              onClick={loadStats}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Stats'}
            </button>
          </div>

          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Total Documents</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDocuments}</p>
              </div>
              
              {Object.entries(stats.collections).map(([collection, count]) => (
                <div key={collection} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {collection.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-xl font-bold text-gray-600">
                    {typeof count === 'number' ? count : 'Error'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No statistics available</p>
            </div>
          )}
        </div>

        {/* Database Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Clear All Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear All Data</h3>
            <p className="text-gray-600 mb-4">
              Permanently delete ALL data from the database. This includes users, tasks, tournaments, 
              transactions, and all other collections.
            </p>
            <button
              onClick={handleClearAllData}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Clearing...' : 'Clear All Data'}
            </button>
          </div>

          {/* Reset Database */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Database</h3>
            <p className="text-gray-600 mb-4">
              Clear all data and seed the database with fresh initial data. This will restore 
              the database to its default state.
            </p>
            <button
              onClick={handleResetDatabase}
              disabled={loading}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Database'}
            </button>
          </div>

          {/* Clear User Data Only */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear User Data Only</h3>
            <p className="text-gray-600 mb-4">
              Clear only user-related data (users, transactions, activities, referrals) while 
              keeping system data (tasks, tournaments, settings).
            </p>
            <button
              onClick={handleClearUserData}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Clearing...' : 'Clear User Data'}
            </button>
          </div>

          {/* Clear Content Data Only */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear Content Data Only</h3>
            <p className="text-gray-600 mb-4">
              Clear only content data (tasks, tournaments, quiz questions, settings) while 
              keeping user data intact.
            </p>
            <button
              onClick={handleClearContentData}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Clearing...' : 'Clear Content Data'}
            </button>
          </div>
        </div>

        {/* Local Storage Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Storage</h3>
          <p className="text-gray-600 mb-4">
            Clear localStorage data (used as fallback when Firebase is not available).
          </p>
          <button
            onClick={handleClearLocalStorage}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Clearing...' : 'Clear Local Storage'}
          </button>
        </div>

        {/* Action Log */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Action Log</h3>
            <button
              onClick={clearLog}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear Log
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {actionLog.length === 0 ? (
              <p className="text-gray-500 text-center">No actions logged yet</p>
            ) : (
              <div className="space-y-2">
                {actionLog.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-xs text-gray-400 mt-1 min-w-[60px]">
                      {log.timestamp}
                    </span>
                    <span className={`text-sm ${getLogColor(log.type)}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Database operations are permanent and cannot be undone. Always backup your data 
                  before performing any clear operations. These actions will affect all users 
                  and may cause data loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDatabase
