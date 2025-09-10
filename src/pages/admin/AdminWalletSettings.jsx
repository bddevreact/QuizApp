import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Wallet, Network, Copy, Check } from 'lucide-react'
import firebaseService from '../../services/firebaseService'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminWalletSettings = () => {
  const [walletAddresses, setWalletAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [copiedAddress, setCopiedAddress] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    network: '',
    address: '',
    name: '',
    isActive: true,
    minDeposit: 1,
    maxDeposit: 10000,
    processingTime: '5-10 minutes'
  })

  useEffect(() => {
    loadWalletAddresses()
  }, [])

  const loadWalletAddresses = async () => {
    try {
      setIsLoading(true)
      const addresses = await firebaseService.read('wallet_addresses')
      setWalletAddresses(Array.isArray(addresses) ? addresses : [])
    } catch (error) {
      console.error('Error loading wallet addresses:', error)
      setWalletAddresses([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.network || !formData.address || !formData.name) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const walletData = {
        ...formData,
        id: editingWallet ? editingWallet.id : `wallet_${Date.now()}`,
        updatedAt: new Date().toISOString(),
        createdAt: editingWallet ? editingWallet.createdAt : new Date().toISOString()
      }

      if (editingWallet) {
        // Update existing wallet
        await firebaseService.update('wallet_addresses', editingWallet.id, walletData)
        setWalletAddresses(prev => 
          prev.map(wallet => wallet.id === editingWallet.id ? walletData : wallet)
        )
      } else {
        // Add new wallet
        await firebaseService.create('wallet_addresses', walletData)
        setWalletAddresses(prev => [...prev, walletData])
      }

      // Reset form
      setFormData({
        network: '',
        address: '',
        name: '',
        isActive: true,
        minDeposit: 1,
        maxDeposit: 10000,
        processingTime: '5-10 minutes'
      })
      setShowAddModal(false)
      setEditingWallet(null)
      
      alert(editingWallet ? 'Wallet updated successfully!' : 'Wallet added successfully!')
    } catch (error) {
      console.error('Error saving wallet:', error)
      alert('Failed to save wallet. Please try again.')
    }
  }

  const handleEdit = (wallet) => {
    setFormData({
      network: wallet.network,
      address: wallet.address,
      name: wallet.name,
      isActive: wallet.isActive,
      minDeposit: wallet.minDeposit,
      maxDeposit: wallet.maxDeposit,
      processingTime: wallet.processingTime
    })
    setEditingWallet(wallet)
    setShowAddModal(true)
  }

  const handleDelete = async (walletId) => {
    if (!confirm('Are you sure you want to delete this wallet address?')) {
      return
    }

    try {
      await firebaseService.delete('wallet_addresses', walletId)
      setWalletAddresses(prev => prev.filter(wallet => wallet.id !== walletId))
      alert('Wallet deleted successfully!')
    } catch (error) {
      console.error('Error deleting wallet:', error)
      alert('Failed to delete wallet. Please try again.')
    }
  }

  const copyToClipboard = async (address) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const getNetworkIcon = (network) => {
    const icons = {
      'TRC20': '🔴',
      'ERC20': '🔵',
      'BEP20': '🟡',
      'Polygon': '🟣',
      'Arbitrum': '🔵',
      'Optimism': '🔴'
    }
    return icons[network] || '💰'
  }

  const getNetworkColor = (network) => {
    const colors = {
      'TRC20': 'text-red-400',
      'ERC20': 'text-blue-400',
      'BEP20': 'text-yellow-400',
      'Polygon': 'text-purple-400',
      'Arbitrum': 'text-blue-400',
      'Optimism': 'text-red-400'
    }
    return colors[network] || 'text-gray-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" text="Loading wallet settings..." color="primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Settings</h1>
          <p className="text-gray-400">Manage deposit wallet addresses and networks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Wallet</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">{walletAddresses.length}</div>
          <div className="text-gray-400 text-sm">Total Networks</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-400">
            {walletAddresses.filter(w => w.isActive).length}
          </div>
          <div className="text-gray-400 text-sm">Active Networks</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-400">
            {walletAddresses.filter(w => w.network === 'TRC20').length}
          </div>
          <div className="text-gray-400 text-sm">TRC20 Wallets</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {walletAddresses.filter(w => w.network === 'ERC20').length}
          </div>
          <div className="text-gray-400 text-sm">ERC20 Wallets</div>
        </div>
      </div>

      {/* Wallet Addresses Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Network</th>
                <th className="text-left py-3 px-4 text-gray-300">Name</th>
                <th className="text-left py-3 px-4 text-gray-300">Address</th>
                <th className="text-left py-3 px-4 text-gray-300">Limits</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {walletAddresses.map((wallet) => (
                <tr key={wallet.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getNetworkIcon(wallet.network)}</span>
                      <span className={`font-medium ${getNetworkColor(wallet.network)}`}>
                        {wallet.network}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{wallet.name}</div>
                    <div className="text-gray-400 text-sm">{wallet.processingTime}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 font-mono text-sm max-w-32 truncate">
                        {wallet.address}
                      </span>
                      <button
                        onClick={() => copyToClipboard(wallet.address)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedAddress === wallet.address ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="text-gray-300">Min: ${wallet.minDeposit}</div>
                      <div className="text-gray-300">Max: ${wallet.maxDeposit}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      wallet.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {wallet.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(wallet)}
                        className="btn-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(wallet.id)}
                        className="btn-sm bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {walletAddresses.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400">No wallet addresses configured</div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary mt-4"
              >
                Add First Wallet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingWallet(null)
                    setFormData({
                      network: '',
                      address: '',
                      name: '',
                      isActive: true,
                      minDeposit: 1,
                      maxDeposit: 10000,
                      processingTime: '5-10 minutes'
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Network <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="network"
                    value={formData.network}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Network</option>
                    <option value="TRC20">TRC20 (Tron)</option>
                    <option value="ERC20">ERC20 (Ethereum)</option>
                    <option value="BEP20">BEP20 (BSC)</option>
                    <option value="Polygon">Polygon (MATIC)</option>
                    <option value="Arbitrum">Arbitrum</option>
                    <option value="Optimism">Optimism</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Main USDT Wallet"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter wallet address..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Deposit ($)
                  </label>
                  <input
                    type="number"
                    name="minDeposit"
                    value={formData.minDeposit}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Deposit ($)
                  </label>
                  <input
                    type="number"
                    name="maxDeposit"
                    value={formData.maxDeposit}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Time
                </label>
                <input
                  type="text"
                  name="processingTime"
                  value={formData.processingTime}
                  onChange={handleInputChange}
                  placeholder="e.g., 5-10 minutes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active (available for deposits)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingWallet(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingWallet ? 'Update' : 'Add'} Wallet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWalletSettings
