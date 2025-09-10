import React, { useState, useEffect } from 'react'
import { Gift, Target, TrendingUp, Trophy, Star, Zap, Clock, DollarSign, Users, Crown, Award, Calendar, BarChart3, TrendingDown, Wallet, Copy } from 'lucide-react'
import dataService from '../services/dataService'
import walletService from '../services/walletService'
import ReferralCard from '../components/ReferralCard'

const Home = () => {
  const [userData, setUserData] = useState({})
  const [dailyBonus, setDailyBonus] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [quickStats, setQuickStats] = useState({})
  const [walletAddresses, setWalletAddresses] = useState([])

  useEffect(() => {
    loadData()
    // Update data every 10 seconds to reflect real-time changes (reduced frequency)
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      // Initialize dataService if not already initialized
      if (!dataService.isInitialized) {
        await dataService.initializeData()
      }
      
      setUserData(dataService.userData)
      
      // Load recent activity properly
      const activity = await dataService.getRecentActivity()
      setRecentActivity(Array.isArray(activity) ? activity : [])
    } catch (error) {
      console.error('Error loading recent activity:', error)
      setRecentActivity([])
    }
    
    const userData = dataService.getUserData()
    setQuickStats({
      todayEarnings: (userData.weeklyEarnings || 0) / 7, // Daily average
      weeklyProgress: Math.round(((userData.weeklyEarnings || 0) / 350) * 100),
      monthlyProgress: Math.round(((userData.monthlyEarnings || 0) / 1000) * 100),
      levelProgress: Math.round(((userData.xp || 0) % 100) / 100 * 100)
    })
    
    // Check for daily bonus
    checkDailyBonus()
    
    // Load wallet addresses
    loadWalletAddresses()
  }

  const checkDailyBonus = async () => {
    try {
      // Get daily bonus settings from admin
      const bonusSettings = await dataService.getDailyBonusSettings()
      
      // If daily bonus is disabled by admin, don't show it
      if (!bonusSettings.enabled) {
        setDailyBonus(null)
        return
      }

      const today = new Date().toDateString()
      const lastBonusDate = localStorage.getItem('quizApp_lastBonusDate')
      
      if (lastBonusDate !== today) {
        setDailyBonus({
          available: true,
          reward: bonusSettings.amount,
          timeLeft: "23:59:59"
        })
      } else {
        setDailyBonus({
          available: false,
          reward: bonusSettings.amount,
          timeLeft: "00:00:00"
        })
      }
    } catch (error) {
      console.error('Error checking daily bonus settings:', error)
      // Fallback to default behavior if settings can't be loaded
      const today = new Date().toDateString()
      const lastBonusDate = localStorage.getItem('quizApp_lastBonusDate')
      
      if (lastBonusDate !== today) {
        setDailyBonus({
          available: true,
          reward: 1.0, // Default amount
          timeLeft: "23:59:59"
        })
      } else {
        setDailyBonus({
          available: false,
          reward: 1.0, // Default amount
          timeLeft: "00:00:00"
        })
      }
    }
  }

  const claimDailyBonus = () => {
    if (!dailyBonus?.available) return

    // Update user data
    const userData = dataService.getUserData()
    dataService.updateUserData({
      totalEarned: (userData.totalEarned || 0) + dailyBonus.reward,
      streak: (userData.streak || 0) + 1
    })

    // Add transaction
    dataService.addTransaction({
      type: "daily_bonus",
      amount: dailyBonus.reward,
      status: "completed",
      txHash: `Daily #${new Date().getDate()}`
    })

    // Mark as claimed
    localStorage.setItem('quizApp_lastBonusDate', new Date().toDateString())
    
    // Update daily bonus status
    setDailyBonus({
      ...dailyBonus,
      available: false
    })

    // Add activity
    dataService.addActivity({
      type: "daily_bonus_claimed",
      title: "Daily Bonus Claimed!",
      description: `Earned ${dailyBonus.reward} USDT from daily bonus`,
      time: "Just now",
      icon: "🎁"
    })

    alert(`Daily bonus claimed! +${dailyBonus.reward} USDT`)
  }

  const loadWalletAddresses = async () => {
    try {
      const networks = await walletService.getAvailableNetworks()
      const walletAddressesData = []
      
      for (const network of networks) {
        const wallet = await walletService.getDepositAddress(network)
        if (wallet) {
          walletAddressesData.push({
            network,
            ...wallet
          })
        }
      }
      setWalletAddresses(walletAddressesData)
    } catch (error) {
      console.error('Error loading wallet addresses:', error)
      setWalletAddresses([])
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Diamond': return 'text-cyan-400'
      case 'Platinum': return 'text-gray-400'
      case 'Gold': return 'text-yellow-400'
      case 'Silver': return 'text-gray-300'
      default: return 'text-orange-400'
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'Diamond': return '💎'
      case 'Platinum': return '🥇'
      case 'Gold': return '🥇'
      case 'Silver': return '🥈'
      default: return '🥉'
    }
  }

  return (
    <div className="px-4 py-6 space-y-8 pb-32">
      {/* Welcome Section */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-accent to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">
            {userData.telegramFullName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">
          Welcome back, {userData.telegramFullName || 'Crypto Master'}!
        </h1>
        <div className="flex items-center justify-center space-x-2">
          <span className={`text-base ${getRankColor(userData.rank)}`}>
            {getRankIcon(userData.rank)}
          </span>
          <span className={`text-base font-bold ${getRankColor(userData.rank)}`}>
            {userData.rank} Rank
          </span>
        </div>
      </div>

      {/* Referral Card */}
      <ReferralCard />

      {/* Daily Bonus Card */}
      {dailyBonus && (
        <div className="card bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Daily Bonus</h3>
                <p className="text-yellow-300 text-sm">Claim your daily reward!</p>
              </div>
            </div>
            <div className="text-right">
                             <p className="text-yellow-400 font-bold text-base">+{dailyBonus.reward} USDT</p>
              <p className="text-yellow-300 text-xs">Available</p>
            </div>
          </div>
          
          {dailyBonus.available ? (
            <button
              onClick={claimDailyBonus}
              className="btn-accent w-full"
            >
              Claim Daily Bonus
            </button>
          ) : (
            <div className="text-center py-3">
              <p className="text-gray-400">Already claimed today</p>
              <p className="text-gray-500 text-sm">Come back tomorrow!</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center py-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-gray-400 text-xs">Today's Earnings</p>
          <p className="text-white font-bold text-base">+{quickStats.todayEarnings?.toFixed(2) || '0.00'} USDT</p>
        </div>
        
        <div className="card text-center py-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-400 text-xs">Questions Today</p>
          <p className="text-white font-bold text-base">{userData.dailyQuizzesCompleted || 0}/{userData.maxDailyQuizzes || 10}</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-gray-400 text-xs">Weekly</p>
          <p className="text-white font-bold text-sm">{userData.weeklyEarnings?.toFixed(2) || '0.00'} USDT</p>
        </div>
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-gray-400 text-xs">Monthly</p>
          <p className="text-white font-bold text-sm">{userData.monthlyEarnings?.toFixed(2) || '0.00'} USDT</p>
        </div>
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-gray-400 text-xs">Referrals</p>
          <p className="text-white font-bold text-sm">{userData.referralEarnings?.toFixed(2) || '0.00'} USDT</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">Level Progress</span>
            </div>
            <span className="text-gray-400 text-sm">Level {userData.level || 0}</span>
          </div>
          <div className="w-full bg-primary-dark rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${quickStats.levelProgress || 0}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-xs mt-2">{userData.xp || 0} XP / {(userData.level || 1) * 100} XP</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">Weekly Goal</span>
            </div>
            <span className="text-gray-400 text-sm">{quickStats.weeklyProgress || 0}%</span>
          </div>
          <div className="w-full bg-primary-dark rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(quickStats.weeklyProgress || 0, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-xs mt-2">{userData.weeklyEarnings || 0} / 350 USDT</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">Monthly Goal</span>
            </div>
            <span className="text-gray-400 text-sm">{quickStats.monthlyProgress || 0}%</span>
          </div>
          <div className="w-full bg-primary-dark rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(quickStats.monthlyProgress || 0, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-xs mt-2">{userData.monthlyEarnings || 0} / 1000 USDT</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
                 <h3 className="text-base font-bold text-white">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => window.location.href = '/quiz'}
            className="card hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <div className="w-10 h-10 bg-primary-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-5 h-5 text-primary-accent" />
            </div>
            <p className="text-white font-medium text-sm">Start Quiz</p>
                        <p className="text-gray-400 text-xs">Challenge & Win USDT</p>
          </button>

          <button 
            onClick={() => window.location.href = '/tournaments'}
            className="card hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-white font-medium text-sm">Tournaments</p>
            <p className="text-gray-400 text-xs">Compete & Win</p>
          </button>

          <button 
            onClick={() => window.location.href = '/earn'}
            className="card hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-white font-medium text-sm">Earn More</p>
            <p className="text-gray-400 text-xs">Complete Tasks</p>
          </button>

          <button 
            onClick={() => window.location.href = '/profile'}
            className="card hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-white font-medium text-sm">Profile</p>
            <p className="text-gray-400 text-xs">View Stats</p>
          </button>
        </div>
      </div>

      {/* Deposit Addresses Section */}
      {walletAddresses.length > 0 && (
        <div className="card">
          <h3 className="text-base font-bold text-white mb-4 flex items-center">
            <Wallet className="w-5 h-5 text-blue-400 mr-2" />
            Deposit Addresses
          </h3>
          <div className="space-y-3">
            {walletAddresses.slice(0, 3).map((walletData) => {
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
            })}
            
            {walletAddresses.length > 3 && (
              <div className="text-center">
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="text-blue-400 text-sm hover:text-blue-300"
                >
                  View All Addresses ({walletAddresses.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Overview */}
      <div className="card">
                 <h3 className="text-base font-bold text-white mb-4">Performance Overview</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Win Rate</p>
                             <p className="text-white font-bold text-base">{userData.winRate || 0}%</p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Tournaments Won</p>
                             <p className="text-white font-bold text-base">{userData.tournamentsWon || 0}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Questions Answered</p>
                             <p className="text-white font-bold text-base">{userData.questionsAnswered || 0}</p>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Average Score</p>
                             <p className="text-white font-bold text-base">{userData.averageScore || 0}%</p>
            </div>
          </div>
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

      {/* Achievement Preview */}
      <div className="card">
                 <h3 className="text-base font-bold text-white mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {(Array.isArray(dataService.achievements) ? dataService.achievements.filter(a => a.unlocked) : []).slice(0, 5).map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                <p className="text-gray-400 text-xs">{achievement.description}</p>
              </div>
              <div className="text-right">
                <span className="text-green-400 text-xs font-medium capitalize">{achievement.rarity}</span>
                <p className="text-gray-500 text-xs">{achievement.date}</p>
              </div>
            </div>
          ))}
          
          {(!Array.isArray(dataService.achievements) || dataService.achievements.filter(a => a.unlocked).length === 0) && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400">No achievements yet</p>
              <p className="text-gray-500 text-sm">Keep playing to unlock achievements!</p>
            </div>
          )}
        </div>
      </div>

      {/* Streak Info */}
      {userData.streak > 0 && (
        <div className="card bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-base">🔥</span>
              </div>
              <div>
                <h4 className="text-white font-bold">Streak Active!</h4>
                <p className="text-orange-300 text-sm">{userData.streak} day streak</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-orange-400 font-bold">+{userData.streak * 2}% Bonus</p>
              <p className="text-orange-300 text-xs">On earnings</p>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="card bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                 <h3 className="text-base font-bold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 text-blue-400 mr-2" />
          Daily Tips
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">Complete daily tasks first for consistent earnings</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">Maintain streaks for bonus multipliers</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">Join tournaments for higher rewards</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">Invite friends to earn referral bonuses</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
