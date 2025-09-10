import React, { useState, useEffect } from 'react'
import { DollarSign, CreditCard, Wallet, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import balanceService from '../services/balanceService'
import dataService from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner'

const Deposit = () => {
  const [depositAmount, setDepositAmount] = useState(10)
  const [selectedMethod, setSelectedMethod] = useState('crypto')
  const [isProcessing, setIsProcessing] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [depositHistory, setDepositHistory] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userData = dataService.getUserData()
      const balanceResult = await balanceService.checkMinimumBalance(userData.userId)
      setUserBalance(balanceResult.currentBalance)
      
      // Load deposit history
      const history = await balanceService.getUserBettingHistory(userData.userId, 10)
      setDepositHistory(history.filter(tx => tx.type === 'deposit'))
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleDeposit = async () => {
    if (depositAmount < 1) {
      alert('Minimum deposit amount is $1')
      return
    }

    setIsProcessing(true)
    
    try {
      const userData = dataService.getUserData()
      const result = await balanceService.depositMoney(userData.userId, depositAmount, selectedMethod)
      
      if (result.success) {
        setShowSuccess(true)
        await loadUserData()
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error processing deposit:', error)
      alert('Error processing deposit. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Address copied to clipboard!')
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

  const paymentMethods = [
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: '₿',
      description: 'USDT (TRC20, ERC20, BEP20)',
      minAmount: 10,
      fee: 0
    },
    {
      id: 'card',
      name: 'Credit Card',
      icon: '💳',
      description: 'Visa, Mastercard, American Express',
      minAmount: 10,
      fee: 2.5
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Wire transfer, ACH',
      minAmount: 50,
      fee: 1.0
    }
  ]

  const cryptoAddresses = {
    TRC20: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    ERC20: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    BEP20: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Deposit Money</h1>
          <p className="text-gray-300">Add funds to your account to play betting quiz</p>
        </div>

        {/* Current Balance */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Wallet className="w-6 h-6 text-blue-400" />
              <span className="text-gray-300">Current Balance</span>
            </div>
            <span className="text-white font-bold text-2xl">${userBalance.toFixed(2)}</span>
          </div>
          
          {userBalance < 10 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium">Minimum Balance Required</p>
                  <p className="text-gray-300 text-sm">You need at least $10 to play betting quiz</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="card bg-green-500/10 border border-green-500/30">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Deposit Successful!</p>
                <p className="text-gray-300 text-sm">Your balance has been updated</p>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Amount */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Deposit Amount</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USDT)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                className="input-field w-full"
                placeholder="Enter deposit amount"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDepositAmount(amount)}
                  className={`btn-sm ${
                    depositAmount === amount
                      ? 'bg-primary-accent text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary-accent bg-primary-accent/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="text-left">
                      <h4 className="text-white font-medium">{method.name}</h4>
                      <p className="text-gray-400 text-sm">{method.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Min: ${method.minAmount}</p>
                    <p className="text-gray-400 text-sm">Fee: {method.fee}%</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Crypto Payment Details */}
        {selectedMethod === 'crypto' && (
          <div className="card bg-blue-500/10 border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-4">Crypto Payment Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 text-sm mb-2">Send USDT to any of these addresses:</p>
                {Object.entries(cryptoAddresses).map(([network, address]) => (
                  <div key={network} className="bg-gray-800/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{network}</span>
                      <button
                        onClick={() => copyToClipboard(address)}
                        className="btn-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm break-all">{address}</p>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Make sure to send USDT only. Sending other cryptocurrencies will result in permanent loss.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card Payment Details */}
        {selectedMethod === 'card' && (
          <div className="card bg-green-500/10 border border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4">Card Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="input-field w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Details */}
        {selectedMethod === 'bank' && (
          <div className="card bg-purple-500/10 border border-purple-500/30">
            <h3 className="text-lg font-bold text-white mb-4">Bank Transfer</h3>
            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-white font-medium">Account Details</p>
                <p className="text-gray-300 text-sm">Account Name: Crypto Quiz Inc.</p>
                <p className="text-gray-300 text-sm">Account Number: 1234567890</p>
                <p className="text-gray-300 text-sm">Routing Number: 987654321</p>
                <p className="text-gray-300 text-sm">Bank: Chase Bank</p>
              </div>
              <p className="text-gray-400 text-sm">
                Please include your user ID in the transfer memo for faster processing.
              </p>
            </div>
          </div>
        )}

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={isProcessing || depositAmount < 1}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <LoadingSpinner size="small" color="white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              <span>Deposit ${depositAmount.toFixed(2)}</span>
            </>
          )}
        </button>

        {/* Deposit History */}
        {depositHistory.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Recent Deposits</h3>
            <div className="space-y-3">
              {depositHistory.slice(0, 5).map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Deposit</div>
                    <div className="text-gray-400 text-sm">{formatDate(deposit.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+${deposit.amount.toFixed(2)}</div>
                    <div className="text-gray-400 text-sm">{deposit.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/betting-quiz'}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>Play Quiz</span>
          </button>
          <button
            onClick={() => window.location.href = '/profile'}
            className="btn-accent flex items-center justify-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>View Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Deposit
