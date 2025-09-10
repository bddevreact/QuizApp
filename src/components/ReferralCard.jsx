import React, { useState, useEffect } from 'react'
import { Copy, Share2, Users, DollarSign } from 'lucide-react'
import telegramService from '../services/telegramService'
import dataService from '../services/dataService'

const ReferralCard = () => {
  const [referralURL, setReferralURL] = useState('')
  const [copied, setCopied] = useState(false)
  const [userData, setUserData] = useState({})

  useEffect(() => {
    loadReferralData()
  }, [])

  const loadReferralData = () => {
    const user = dataService.getUserData()
    setUserData(user)
    
    // Generate referral URL
    const url = telegramService.generateReferralURL()
    if (url) {
      setReferralURL(url)
    } else if (user.referralCode) {
      const baseURL = window.location.origin
      setReferralURL(`${baseURL}?ref=${user.referralCode}`)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralURL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Crypto Quiz App',
        text: 'Earn USDT by playing crypto quizzes!',
        url: referralURL
      })
    } else {
      copyToClipboard()
    }
  }

  if (!referralURL) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Referral Program</h3>
        <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded text-xs">
          <Users className="w-3 h-3 text-green-400" />
          <span className="text-green-400">{userData.invitedFriends || 0}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-dark/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Invited</span>
            </div>
            <p className="text-lg font-bold text-white">{userData.invitedFriends || 0}</p>
          </div>
          <div className="bg-primary-dark/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Earned</span>
            </div>
            <p className="text-lg font-bold text-white">${userData.referralEarnings?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Referral URL */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Your Referral Link</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={referralURL}
              readOnly
              className="flex-1 bg-primary-dark/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={shareReferral}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-400">Copied to clipboard!</p>
          )}
        </div>

        {/* Referral Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-400">
            <strong>Earn 5 USDT</strong> for each friend who joins using your link!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Your friends get 2 USDT welcome bonus too.
          </p>
          <p className="text-xs text-yellow-400 mt-2">
            <strong>Note:</strong> Referral bonuses are added to bonus balance and require a deposit to unlock for playing.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReferralCard
