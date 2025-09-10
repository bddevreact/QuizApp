import React, { useState, useEffect } from 'react'
import { User, Wallet, TrendingUp, Trophy, Settings, Shield, CreditCard, History, Gift, Award, Star, Calendar, BarChart3, Target, Zap, Users, Crown, Flame, DollarSign, Copy, CheckCircle, AlertCircle, Clock, Network, Sword, ChevronDown, X } from 'lucide-react'
import dataService from '../services/dataService'
import walletService from '../services/walletService'

const Profile = () => {
  const [userProfile, setUserProfile] = useState({})
  const [transactionHistory, setTransactionHistory] = useState([])
  const [achievements, setAchievements] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [goals, setGoals] = useState([])
  
  // Deposit/Withdrawal states
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [transactionLimits, setTransactionLimits] = useState({})
  const [walletAddresses, setWalletAddresses] = useState({})
  const [availableNetworks, setAvailableNetworks] = useState([])
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const [walletAddressesList, setWalletAddressesList] = useState([])
  
  // Deposit proof states
  const [transactionId, setTransactionId] = useState('')
  const [depositProof, setDepositProof] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      // Initialize dataService if not already initialized
      if (!dataService.isInitialized) {
        await dataService.initializeData()
      }
      
      setUserProfile(dataService.userData || {})
      setTransactionHistory(dataService.transactions || [])
      setAchievements(dataService.achievements || [])
      
      // Load recent activity properly
      const activity = await dataService.getRecentActivity()
      setRecentActivity(Array.isArray(activity) ? activity : [])
    } catch (error) {
      console.error('Error loading profile data:', error)
      setUserProfile({})
      setTransactionHistory([])
      setAchievements([])
      setRecentActivity([])
    }
    
    // Load goals asynchronously
    try {
      const goalsData = await dataService.getGoals()
      setGoals(Array.isArray(goalsData) ? goalsData : [])
    } catch (error) {
      console.error('Error loading goals:', error)
      setGoals([])
    }
    
    setTransactionLimits(dataService.getTransactionLimits())
    setWalletAddresses(dataService.getWalletAddresses())
    
    // Load available networks from wallet service
    loadAvailableNetworks()
  }

  const loadAvailableNetworks = async () => {
    try {
      const networks = await walletService.getAvailableNetworks()
      console.log('Available networks:', networks)
      setAvailableNetworks(networks)
      
      // Load wallet addresses for each network
      const walletAddressesData = []
      for (const network of networks) {
        const wallet = await walletService.getDepositAddress(network)
        console.log(`Wallet for ${network}:`, wallet)
        if (wallet) {
          walletAddressesData.push({
            network,
            ...wallet
          })
        }
      }
      console.log('Wallet addresses data:', walletAddressesData)
      setWalletAddressesList(walletAddressesData)
      
      // Set default network if none selected
      if (!selectedNetwork && networks.length > 0) {
        const defaultNetwork = networks[0]
        setSelectedNetwork(defaultNetwork)
        
        // Load wallet for default network
        const defaultWallet = await walletService.getDepositAddress(defaultNetwork)
        setSelectedWallet(defaultWallet)
        
        // Update wallet addresses object
        if (defaultWallet) {
          setWalletAddresses(prev => ({
            ...prev,
            [defaultNetwork]: defaultWallet.address
          }))
        }
      }
    } catch (error) {
      console.error('Error loading available networks:', error)
      setAvailableNetworks([])
      setWalletAddressesList([])
    }
  }

  const handleNetworkSelect = async (network) => {
    setSelectedNetwork(network)
    setShowNetworkDropdown(false)
    
    // Load wallet info for selected network
    const wallet = await walletService.getDepositAddress(network)
    setSelectedWallet(wallet)
    
    // Also update the wallet addresses object for backward compatibility
    if (wallet) {
      setWalletAddresses(prev => ({
        ...prev,
        [network]: wallet.address
      }))
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || !selectedNetwork) {
      alert('Please enter amount and select network')
      return
    }

    if (!transactionId.trim()) {
      alert('Please enter transaction ID')
      return
    }

    if (!depositProof) {
      alert('Please upload deposit proof screenshot')
      return
    }

    // Validate deposit amount
    const validation = await walletService.validateDepositAmount(selectedNetwork, parseFloat(depositAmount))
    if (!validation.valid) {
      alert(validation.message)
      return
    }

    setIsProcessing(true)
    try {
      // Import balanceService to use the new deposit method
      const { default: balanceService } = await import('../services/balanceService')
      
      const result = await balanceService.depositMoney(
        userProfile.userId,
        parseFloat(depositAmount),
        'crypto',
        selectedWallet?.address,
        transactionId.trim(),
        depositProof
      )
      
      if (result.success) {
        alert(`Deposit request submitted for $${depositAmount}. Please wait for admin approval.`)
        setDepositAmount('')
        setSelectedNetwork('')
        setTransactionId('')
        setDepositProof(null)
        setProofPreview(null)
        setShowDepositModal(false)
        loadData() // Refresh data
      } else {
        alert(`Deposit failed: ${result.message}`)
      }
    } catch (error) {
      alert(`Deposit failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProofUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setDepositProof(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProofPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProof = () => {
    setDepositProof(null)
    setProofPreview(null)
  }

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || !selectedNetwork || !walletAddress) {
      alert('Please enter amount, select network, and provide wallet address')
      return
    }

    // Validate wallet address format
    if (!isValidWalletAddress(walletAddress, selectedNetwork)) {
      alert('Invalid wallet address for selected network')
      return
    }

    setIsProcessing(true)
    try {
      const result = await dataService.processWithdrawal(
        parseFloat(withdrawalAmount),
        selectedNetwork,
        walletAddress
      )
      
      alert(`Withdrawal request submitted! Transaction: ${result.txHash}`)
      setWithdrawalAmount('')
      setWalletAddress('')
      setShowWithdrawalModal(false)
      loadData() // Refresh data
    } catch (error) {
      alert(`Withdrawal failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const isValidWalletAddress = (address, network) => {
    switch (network) {
      case 'TRC20':
        return /^T[A-Za-z1-9]{33}$/.test(address)
      case 'ERC20':
        return /^0x[a-fA-F0-9]{40}$/.test(address)
      case 'BEP20':
        return /^0x[a-fA-F0-9]{40}$/.test(address)
      default:
        return false
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return <CreditCard className="w-4 h-4 text-green-400" />
      case 'withdrawal': return <CreditCard className="w-4 h-4 text-red-400" />
      case 'quiz_reward': return <Target className="w-4 h-4 text-blue-400" />
      case 'tournament_win': return <Trophy className="w-4 h-4 text-yellow-400" />
      case 'referral_bonus': return <Users className="w-4 h-4 text-purple-400" />
      case 'daily_bonus': return <Gift className="w-4 h-4 text-purple-400" />
      case 'streak_bonus': return <Flame className="w-4 h-4 text-orange-400" />
      default: return <CreditCard className="w-4 h-4 text-gray-400" />
    }
  }

  const getTransactionStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-400'
      case 'epic': return 'text-pink-400'
      case 'rare': return 'text-blue-400'
      case 'common': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'bg-purple-500/20'
      case 'epic': return 'bg-pink-500/20'
      case 'rare': return 'bg-blue-500/20'
      case 'common': return 'bg-gray-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  const getIconComponent = (iconName) => {
    const icons = {
      Target, Trophy, Star, Users, Crown, Flame, DollarSign, Award, Calendar, BarChart3
    }
    return icons[iconName] || Target
  }

  return (
    <div className="px-4 py-6 space-y-8 pb-32">
      {/* Profile Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-accent to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
          {userProfile.telegramPhotoUrl ? (
            <img 
              src={userProfile.telegramPhotoUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <span 
            className="text-white text-2xl font-bold flex items-center justify-center w-full h-full"
            style={{ display: userProfile.telegramPhotoUrl ? 'none' : 'flex' }}
          >
            {userProfile.telegramFullName?.charAt(0).toUpperCase() || userProfile.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{userProfile.telegramFullName || userProfile.username || 'User'}</h1>
        {userProfile.telegramUsername && (
          <p className="text-gray-400 text-sm mb-2">@{userProfile.telegramUsername}</p>
        )}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-base">🥇</span>
          <span className="text-base font-bold text-yellow-400">{userProfile.rank} Rank</span>
        </div>

      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Sword className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-gray-400 text-xs">Tournaments</p>
          <p className="text-white font-bold text-sm">{userProfile.totalTournaments || 0}</p>
        </div>
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-gray-400 text-xs">Avg Score</p>
          <p className="text-white font-bold text-sm">{userProfile.averageScore || 0}%</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Telegram Full Name</span>
            <span className="text-white font-medium">{userProfile.telegramFullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Telegram Username</span>
            <span className="text-white font-medium">@{userProfile.telegramUsername}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Mini App Join Date</span>
            <span className="text-white font-medium">{userProfile.joinDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Questions Answered</span>
            <span className="text-white font-medium">{userProfile.questionsAnswered || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Level</span>
            <span className="text-white font-medium">{userProfile.level || 0}/10</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">XP</span>
            <span className="text-white font-medium">{userProfile.xp || 0}</span>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Wallet</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Playable Balance</p>
              <p className="text-white font-bold text-base">${userProfile.playableBalance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Bonus Balance</p>
              <p className="text-white font-bold text-base">${userProfile.bonusBalance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Total Earned</p>
              <p className="text-white font-bold text-base">${userProfile.totalEarned?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Total Available</p>
              <p className="text-white font-bold text-base">${userProfile.availableBalance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Total Deposited</p>
              <p className="text-white font-bold text-base">${userProfile.totalDeposited?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Total Withdrawn</p>
              <p className="text-white font-bold text-base">${userProfile.totalWithdrawn?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDepositModal(true)}
              className="btn-primary flex-1"
            >
              Deposit
            </button>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="btn-secondary flex-1"
              disabled={!userProfile.withdrawalEnabled}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Deposit Addresses Section */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Deposit Addresses</h3>
        <div className="space-y-3">
          {walletAddressesList.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400">No deposit addresses available</p>
              <p className="text-gray-500 text-sm">Contact admin to add deposit addresses</p>
            </div>
          ) : (
            walletAddressesList.map((walletData) => {
              const networkInfo = walletService.getNetworkInfo(walletData.network)
              
              return (
                <div key={walletData.network} className="p-3 bg-primary-dark/30 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{networkInfo.icon}</span>
                      <span className={`font-medium ${networkInfo.color}`}>
                        {networkInfo.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {walletData.processingTime || '5-10 minutes'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-primary-dark rounded border border-gray-600">
                      <input
                        type="text"
                        value={walletData.address || ''}
                        readOnly
                        className="flex-1 bg-transparent text-white text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(walletData.address || '')}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Min: ${walletData.minDeposit || '1'}</span>
                      <span>Max: ${walletData.maxDeposit || '10000'}</span>
                      <span className={networkInfo.color}>{networkInfo.speed}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Transaction Limits */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Transaction Limits</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Daily Withdrawal Used</span>
            <span className="text-white font-medium">${transactionLimits.dailyWithdrawalUsed?.toFixed(2) || '0.00'} / ${dataService.settings?.dailyWithdrawalLimit || '100.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Monthly Withdrawal Used</span>
            <span className="text-white font-medium">${transactionLimits.monthlyWithdrawalUsed?.toFixed(2) || '0.00'} / ${dataService.settings?.monthlyWithdrawalLimit || '1000.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Daily Withdrawals</span>
            <span className="text-white font-medium">{transactionLimits.dailyWithdrawalsUsed || 0} / {dataService.settings?.maxDailyWithdrawals || 3}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Min Withdrawal</span>
            <span className="text-white font-medium">${dataService.settings?.minWithdrawal || '10.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Withdrawal Fee</span>
            <span className="text-white font-medium">${dataService.settings?.withdrawalFee || '2.00'}</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Transaction History</h3>
        <div className="space-y-3">
          {transactionHistory.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <History className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-gray-500 text-sm">Start playing to see your transactions!</p>
            </div>
          ) : (
            (Array.isArray(transactionHistory) ? transactionHistory : []).slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-primary-dark/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getTransactionIcon(transaction.type)}
                  {getTransactionStatusIcon(transaction.status)}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm capitalize">{transaction.type.replace('_', ' ')}</h4>
                  <p className="text-gray-400 text-xs">{transaction.txHash}</p>
                  <p className="text-gray-500 text-xs">{new Date(transaction.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${transaction.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount?.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings & Security */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Settings & Security</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-primary-dark/30 rounded-lg hover:bg-primary-dark/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-white">Settings</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-primary-dark/30 rounded-lg hover:bg-primary-dark/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-white">Security</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-primary-dark rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white">Deposit USDT</h3>
            </div>
            
            <div className="px-4 py-3 space-y-3">
              <div>
                <label className="block text-gray-300 text-xs mb-1">Amount (USDT) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={dataService.settings?.minDeposit || 10}
                  max={dataService.settings?.maxDeposit || 10000}
                  step="0.01"
                  className="w-full p-2 text-sm bg-primary-dark border border-gray-600 rounded text-white placeholder-gray-400 focus:border-primary-accent focus:outline-none"
                />
                <p className="text-gray-400 text-xs mt-0.5">
                  Min: ${dataService.settings?.minDeposit || 10} | Max: ${dataService.settings?.maxDeposit || 10000}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-1">Transaction ID <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction hash/ID"
                  className="w-full p-2 text-sm bg-primary-dark border border-gray-600 rounded text-white placeholder-gray-400 focus:border-primary-accent focus:outline-none"
                />
                <p className="text-gray-400 text-xs mt-0.5">
                  Enter the transaction hash from your wallet
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-1">Deposit Proof Screenshot <span className="text-red-400">*</span></label>
                <div className="space-y-1">
                  {!depositProof ? (
                    <div className="border-2 border-dashed border-gray-600 rounded p-2 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofUpload}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label
                        htmlFor="proof-upload"
                        className="cursor-pointer flex flex-col items-center space-y-1"
                      >
                        <CreditCard className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-300 text-xs">Click to upload</span>
                        <span className="text-gray-500 text-xs">PNG, JPG up to 5MB</span>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="relative">
                        <img
                          src={proofPreview}
                          alt="Deposit proof"
                          className="w-full h-24 object-cover rounded border border-gray-600"
                        />
                        <button
                          onClick={removeProof}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-green-400 text-xs">✓ {depositProof.name}</p>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-0.5">
                  Upload transaction confirmation screenshot
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-1">Network</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                    className="w-full p-2 text-sm bg-primary-dark border border-gray-600 rounded text-white focus:border-primary-accent focus:outline-none flex items-center justify-between"
                    disabled={availableNetworks.length === 0}
                  >
                    <span className="flex items-center space-x-2">
                      {selectedNetwork ? (
                        <>
                          <span className="text-sm">{walletService.getNetworkInfo(selectedNetwork).icon}</span>
                          <span className={`text-xs ${walletService.getNetworkInfo(selectedNetwork).color}`}>
                            {walletService.getNetworkInfo(selectedNetwork).name}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">Select Network</span>
                      )}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {showNetworkDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-primary-dark border border-gray-600 rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                      {availableNetworks.length === 0 ? (
                        <div className="p-2 text-center text-gray-400 text-xs">
                          No networks available
                        </div>
                      ) : (
                        availableNetworks.map((network) => {
                          const networkInfo = walletService.getNetworkInfo(network)
                          return (
                            <button
                              key={network}
                              type="button"
                              onClick={() => handleNetworkSelect(network)}
                              className="w-full p-2 text-left hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <span className="text-sm">{networkInfo.icon}</span>
                              <div>
                                <div className={`text-xs font-medium ${networkInfo.color}`}>{networkInfo.name}</div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-1">Deposit Address</label>
                <div className="flex items-center space-x-1 p-2 bg-primary-dark border border-gray-600 rounded">
                  <input
                    type="text"
                    value={selectedWallet?.address || 'No address available'}
                    readOnly
                    className="flex-1 bg-transparent text-white text-xs"
                    placeholder="Select a network to see address"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedWallet?.address || '')}
                    className="p-1 hover:bg-gray-600 rounded"
                    disabled={!selectedWallet?.address}
                  >
                    <Copy className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">
                  Send USDT to this address. Processing: {selectedWallet?.processingTime || '5-10 minutes'}
                </p>
                <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-xs">
                    <strong>Note:</strong> Your deposit will be pending until admin approval. You will be notified once approved.
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || !transactionId || !depositProof || isProcessing}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h3 className="text-base font-bold text-white mb-4">Withdraw USDT</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Amount (USDT)</label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={dataService.settings?.minWithdrawal || 10}
                  max={Math.min(dataService.settings?.maxWithdrawal || 1000, userProfile?.availableBalance || 0)}
                  step="0.01"
                  className="w-full p-3 bg-primary-dark border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-accent focus:outline-none"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Min: ${dataService.settings?.minWithdrawal || 10} | Max: ${Math.min(dataService.settings?.maxWithdrawal || 1000, userProfile?.availableBalance || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Network</label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="w-full p-3 bg-primary-dark border border-gray-600 rounded-lg text-white focus:border-primary-accent focus:outline-none"
                >
                  {dataService.settings?.supportedNetworks || ['TRC20', 'ERC20', 'BEP20'].map(network => (
                    <option key={network} value={network}>{network}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={`Enter ${selectedNetwork} address`}
                  className="w-full p-3 bg-primary-dark border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-accent focus:outline-none"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Double-check the address. Processing time: {dataService.settings?.processingTime?.withdrawal || '1-3 hours'}
                </p>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  <strong>Fee:</strong> ${dataService.settings?.withdrawalFee || '2.00'} USDT will be deducted
                </p>
                <p className="text-yellow-300 text-sm">
                  <strong>You'll receive:</strong> ${(parseFloat(withdrawalAmount) || 0) - (dataService.settings?.withdrawalFee || 2.00)} USDT
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="btn-secondary flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdrawal}
                  disabled={!withdrawalAmount || !walletAddress || isProcessing}
                  className="btn-primary flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Section */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Goals</h3>
        <div className="space-y-3">
          {(Array.isArray(goals) ? goals : []).map((goal) => {
            const IconComponent = getIconComponent(goal.icon)
            return (
              <div key={goal.id} className="flex items-center space-x-3 p-3 bg-primary-dark/30 rounded-lg">
                <div className="w-10 h-10 bg-primary-accent/20 rounded-full flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-primary-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{goal.title}</h4>
                  <p className="text-gray-400 text-xs">{goal.description}</p>
                  <div className="w-full bg-primary-dark rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-primary-accent to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{goal.current} / {goal.target}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400">No recent activity</p>
              <p className="text-gray-500 text-sm">Start playing to see your activity!</p>
            </div>
          ) : (
            (Array.isArray(recentActivity) ? recentActivity : []).slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-primary-dark/30 rounded-lg">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{activity.title}</h4>
                  <p className="text-gray-400 text-xs">{activity.description}</p>
                </div>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Achievements</h3>
        <div className="space-y-3">
          {(Array.isArray(achievements) ? achievements.filter(a => a.unlocked) : []).map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                <p className="text-gray-400 text-xs">{achievement.description}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </span>
                <p className="text-gray-500 text-xs">{achievement.date}</p>
              </div>
            </div>
          ))}
          
          {(!Array.isArray(achievements) || achievements.filter(a => a.unlocked).length === 0) && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400">No achievements yet</p>
              <p className="text-gray-500 text-sm">Keep playing to unlock achievements!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
