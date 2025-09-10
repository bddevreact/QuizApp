import React, { useState, useEffect } from 'react'
import { 
  Gift, 
  Settings, 
  Save, 
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Info,
  AlertCircle
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import dataService from '../../services/dataService'

const AdminDailyBonus = () => {
  const [settings, setSettings] = useState({
    amount: 1.0,
    enabled: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const bonusSettings = await dataService.getDailyBonusSettings()
      setSettings({
        amount: bonusSettings.amount || 1.0,
        enabled: bonusSettings.enabled !== false
      })
    } catch (error) {
      console.error('Error loading daily bonus settings:', error)
      setMessage('Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage('')
      
      await dataService.updateDailyBonusSettings(settings)
      setMessage('Daily bonus settings updated successfully!')
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving daily bonus settings:', error)
      setMessage('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    setSettings(prev => ({
      ...prev,
      amount: Math.max(0, value) // Ensure non-negative
    }))
  }

  const toggleEnabled = () => {
    setSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading daily bonus settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily Bonus Settings</h1>
              <p className="text-gray-600">Configure daily bonus amount and activation for users</p>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Daily Bonus Configuration</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ToggleRight className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Daily Bonus Status</h3>
                  <p className="text-sm text-gray-500">
                    {settings.enabled ? 'Daily bonus is currently active' : 'Daily bonus is currently disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Bonus Amount */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Daily Bonus Amount</h3>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={settings.amount}
                  onChange={handleAmountChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="block w-full pl-7 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                  placeholder="0.00"
                />
              </div>
              
              <p className="text-sm text-gray-500">
                Amount users will receive as daily bonus (in USDT)
              </p>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-1">How Daily Bonus Works:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Users can claim daily bonus once per day</li>
                    <li>• Bonus is automatically added to user's balance</li>
                    <li>• When disabled, users won't see the daily bonus option</li>
                    <li>• Changes take effect immediately for all users</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Warning when disabled */}
            {!settings.enabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <h4 className="font-medium mb-1">Daily Bonus Disabled</h4>
                    <p>Users will not be able to claim daily bonus until you re-enable this feature.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-800' 
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {message.includes('Error') ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Settings Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Status</p>
                <p className="text-sm text-gray-500">
                  {settings.enabled ? 'Active' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Bonus Amount</p>
                <p className="text-sm text-gray-500">${settings.amount.toFixed(2)} USDT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDailyBonus
