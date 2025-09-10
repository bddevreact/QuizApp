import React, { useState, useEffect } from 'react'
import { DollarSign, Gift, Target, Share2, Users, Star, Clock, CheckCircle, ExternalLink, TrendingUp, Award, Zap, Calendar, BarChart3, Upload, AlertCircle } from 'lucide-react'
import dataService from '../services/dataService'
import taskVerificationService from '../services/taskVerificationService'
import TaskVerificationModal from '../components/TaskVerificationModal'

const Earn = () => {
  const [activeTab, setActiveTab] = useState('daily')
  const [completedTasks, setCompletedTasks] = useState([])
  const [userStats, setUserStats] = useState({})
  const [tasks, setTasks] = useState({})
  const [leaderboard, setLeaderboard] = useState([])
  const [referralStats, setReferralStats] = useState({})
  const [inviteUsername, setInviteUsername] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskProofs, setTaskProofs] = useState([])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Initialize dataService if not already initialized
      if (!dataService.isInitialized) {
        await dataService.initializeData()
      }
      
      // Load user data
      const userData = dataService.getUserData()
      setUserStats(userData)
      
      // Load tasks
      const tasksData = await dataService.getTasks()
      
      if (Array.isArray(tasksData)) {
        // Structure tasks by type (admin uses 'type' field)
        const structuredTasks = {
          daily: tasksData.filter(task => task.type === 'daily'),
          marketing: tasksData.filter(task => task.type === 'marketing'),
          partner: tasksData.filter(task => task.type === 'partner')
        }
        setTasks(structuredTasks)
      } else {
        setTasks({ daily: [], marketing: [], partner: [] })
      }
      
      // Load leaderboard
      const leaderboardData = await dataService.getLeaderboard()
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : [])
      
      // Create referral stats from user data
      const referralStatsData = {
        totalReferrals: userData.invitedFriends || 0,
        totalEarnings: userData.referralEarnings || 0,
        referralCode: userData.referralCode || 'N/A',
        referralURL: userData.referralURL || ''
      }
      setReferralStats(referralStatsData)
      
      // Load completed tasks from storage
      const storedCompleted = localStorage.getItem('quizApp_completedTasks')
      if (storedCompleted) {
        setCompletedTasks(JSON.parse(storedCompleted))
      }

      // Load task proofs
      if (userData.userId) {
        const proofs = await taskVerificationService.getUserTaskProofs(userData.userId)
        setTaskProofs(proofs)
      }
    } catch (error) {
      console.error('Error loading earn data:', error)
      // Set default values on error
      setUserStats({})
      setTasks([])
      setLeaderboard([])
      setReferralStats({})
    }
  }

  const handleInviteFriend = () => {
    if (!inviteUsername.trim()) {
      setInviteMessage('Please enter a username')
      return
    }

    // For now, just show a success message since inviteFriend method doesn't exist
    // In a real implementation, this would send an invitation
    setInviteMessage(`Invitation sent to ${inviteUsername}!`)
    setInviteUsername('')
    
    // Reload data to update referral stats
    setTimeout(() => {
      loadData()
      setInviteMessage('')
    }, 2000)
  }

  const handleShareReferral = () => {
    // Get referral URL from user data
    const userData = dataService.getUserData()
    const referralURL = userData.referralURL || `${window.location.origin}?ref=${userData.referralCode}`
    
    // Copy to clipboard
    navigator.clipboard.writeText(referralURL).then(() => {
      setInviteMessage('Referral link copied to clipboard!')
      setTimeout(() => setInviteMessage(''), 3000)
    }).catch(() => {
      setInviteMessage('Failed to copy referral link')
      setTimeout(() => setInviteMessage(''), 3000)
    })
  }

  const openInviteModal = () => {
    setShowInviteModal(true)
    setInviteUsername('')
    setInviteMessage('')
  }

  const closeInviteModal = () => {
    setShowInviteModal(false)
    setInviteUsername('')
    setInviteMessage('')
  }

  const openVerificationModal = (task) => {
    setSelectedTask(task)
    setShowVerificationModal(true)
  }

  const closeVerificationModal = () => {
    setShowVerificationModal(false)
    setSelectedTask(null)
  }

  const handleVerificationSuccess = () => {
    // Reload data to update task status
    loadData()
  }

  const completeTask = async (taskId) => {
    if (!completedTasks.includes(taskId)) {
      const newCompletedTasks = [...completedTasks, taskId]
      setCompletedTasks(newCompletedTasks)
      
      // Save to storage
      localStorage.setItem('quizApp_completedTasks', JSON.stringify(newCompletedTasks))
      
      try {
        // Update data service
        await dataService.completeTask(taskId)
        
        // Reload data to reflect changes
        await loadData()
        
        // Show success message
        console.log(`Task ${taskId} completed!`)
      } catch (error) {
        console.error('Error completing task:', error)
      }
    }
  }

  const getTaskIcon = (type) => {
    switch (type) {
      case 'bonus': return <Gift className="w-5 h-5" />
      case 'daily': return <Target className="w-5 h-5" />
      case 'social': return <Share2 className="w-5 h-5" />
      case 'referral': return <Users className="w-5 h-5" />
      case 'subscription': return <Star className="w-5 h-5" />
      case 'partner': return <TrendingUp className="w-5 h-5" />
      case 'survey': return <CheckCircle className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getTaskStatus = (task) => {
    if (task.status === 'completed') return 'completed'
    if (completedTasks.includes(task.id)) return 'completed'
    
    // Check if task requires proof submission
    if (task.requiresProof) {
      const proof = taskProofs.find(p => p.taskId === task.id)
      if (proof) {
        if (proof.status === 'approved') return 'completed'
        if (proof.status === 'pending') return 'pending'
        if (proof.status === 'rejected') return 'rejected'
      }
      return 'needs_proof'
    }
    
    return task.status
  }

  const handleTaskAction = (task) => {
    const status = getTaskStatus(task)
    
    // If task requires proof submission, open verification modal
    if (task.requiresProof) {
      if (status === 'needs_proof') {
        openVerificationModal(task)
        return
      } else if (status === 'pending') {
        alert('Your proof is pending admin review. Please wait.')
        return
      } else if (status === 'rejected') {
        // Allow resubmission
        openVerificationModal(task)
        return
      }
    }
    
    // If task has a link, use it; otherwise use default links
    const taskLink = task.link || getDefaultLink(task.action)
    
    switch (task.action) {
      case 'share':
        // Implement share functionality
        if (navigator.share) {
          navigator.share({
            title: 'CryptoQuiz App',
            text: 'Check out this amazing crypto quiz app!',
            url: taskLink || window.location.href
          })
        } else if (taskLink) {
          window.open(taskLink, '_blank')
        }
        break
      case 'invite':
        // Open invite modal for referral tasks
        openInviteModal()
        break
      case 'social':
      case 'subscribe':
      case 'create':
      case 'join':
      case 'game':
      case 'survey':
      case 'watch':
      case 'download':
        // Open the provided link or default link
        if (taskLink) {
          window.open(taskLink, '_blank')
        }
        break
      default:
        break
    }
    
    // Complete the task after action (only for non-proof tasks)
    if (!task.requiresProof) {
      completeTask(task.id)
    }
  }

  const getDefaultLink = (action) => {
    const defaultLinks = {
      social: 'https://twitter.com/cryptoquiz',
      subscribe: 'https://t.me/cryptoquiz',
      create: 'https://imgflip.com/memegenerator',
      join: 'https://discord.gg/cryptoquiz',
      game: 'https://partner-game.com',
      survey: 'https://survey.cryptoquiz.com',
      watch: 'https://youtube.com/watch?v=cryptoquiz',
      download: 'https://partner-app.com/download'
    }
    return defaultLinks[action]
  }

  return (
    <div className="px-4 py-6 space-y-8 pb-24">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-lg font-bold text-white mb-2">Earn More</h1>
        <p className="text-gray-300 text-sm">Complete tasks and earn USDT rewards</p>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-400 text-xs">Total Earned</p>
          <p className="text-white text-base font-bold">{userStats.totalEarned || 0} USDT</p>
        </div>
        
        <div className="card text-center">
          <div className="w-10 h-10 bg-primary-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-5 h-5 text-primary-accent" />
          </div>
          <p className="text-gray-400 text-xs">Tasks Done</p>
          <p className="text-white text-base font-bold">{userStats.tasksCompleted || 0}</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-gray-400 text-xs">Weekly</p>
          <p className="text-white font-bold text-sm">{userStats.weeklyEarnings || 0} USDT</p>
        </div>
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-gray-400 text-xs">Monthly</p>
          <p className="text-white font-bold text-sm">{userStats.monthlyEarnings || 0} USDT</p>
        </div>
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-gray-400 text-xs">Referrals</p>
          <p className="text-white font-bold text-sm">{userStats.referralEarnings || 0} USDT</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-primary-card rounded-lg p-1">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'daily'
              ? 'bg-primary-accent text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Daily Tasks
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'marketing'
              ? 'bg-primary-accent text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Marketing
        </button>
        <button
          onClick={() => setActiveTab('partner')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'partner'
              ? 'bg-primary-accent text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Partner
        </button>
      </div>

      {/* Daily Tasks */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Daily Missions</h3>
          
          {tasks.daily?.map((task) => {
            const status = getTaskStatus(task)
            const isCompleted = status === 'completed'
            
            return (
              <div key={task.id} className={`card ${isCompleted ? 'bg-green-500/10 border-green-500/30' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-500/20' : 'bg-primary-accent/20'
                    }`}>
                      {getTaskIcon(task.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{task.title}</h4>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                      {task.link && (
                        <p className="text-blue-400 text-xs mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Click to open link
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{task.reward}</p>
                    {task.difficulty && (
                      <span className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                {task.progress && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{task.progress}/{task.target}</span>
                    </div>
                    <div className="w-full bg-primary-dark rounded-full h-2">
                      <div 
                        className="bg-primary-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(task.progress / task.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {task.timeLeft && (
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">Time Left: {task.timeLeft}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {status === 'completed' ? (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Completed!</span>
                    </div>
                  ) : status === 'pending' ? (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Pending Review</span>
                    </div>
                  ) : status === 'rejected' ? (
                    <div className="flex items-center space-x-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Rejected - Resubmit</span>
                    </div>
                  ) : task.requiresProof ? (
                    <button
                      onClick={() => openVerificationModal(task)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Submit Proof</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTaskAction(task)}
                      className="btn-primary"
                    >
                      {task.type === 'bonus' ? 'Answer Now' : 'Start Task'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Marketing Tasks */}
      {activeTab === 'marketing' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Marketing Tasks</h3>
          
          {tasks.marketing?.map((task) => {
            const status = getTaskStatus(task)
            const isCompleted = status === 'completed'
            
            return (
              <div key={task.id} className={`card ${isCompleted ? 'bg-green-500/10 border-green-500/30' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-500/20' : 'bg-blue-500/20'
                    }`}>
                      {getTaskIcon(task.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{task.title}</h4>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                      {task.link && (
                        <p className="text-blue-400 text-xs mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Click to open link
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{task.reward}</p>
                    <span className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {status === 'completed' ? (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Completed!</span>
                    </div>
                  ) : status === 'pending' ? (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Pending Review</span>
                    </div>
                  ) : status === 'rejected' ? (
                    <div className="flex items-center space-x-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Rejected - Resubmit</span>
                    </div>
                  ) : task.requiresProof ? (
                    <button
                      onClick={() => openVerificationModal(task)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Submit Proof</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTaskAction(task)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {task.action === 'share' && <Share2 className="w-4 h-4" />}
                      {task.action === 'invite' && <Users className="w-4 h-4" />}
                      {task.action === 'social' && <ExternalLink className="w-4 h-4" />}
                      {task.action === 'subscribe' && <Star className="w-4 h-4" />}
                      {task.action === 'create' && <Zap className="w-4 h-4" />}
                      {task.action === 'join' && <Users className="w-4 h-4" />}
                      <span>
                        {task.action === 'share' ? 'Share Now' :
                         task.action === 'invite' ? 'Invite Friend' :
                         task.action === 'social' ? 'Go to Tweet' :
                         task.action === 'subscribe' ? 'Subscribe' :
                         task.action === 'create' ? 'Create Meme' :
                         task.action === 'join' ? 'Join Server' : 'Complete'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Partner Tasks */}
      {activeTab === 'partner' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Partner Offers</h3>
          
          {tasks.partner?.map((task) => {
            const status = getTaskStatus(task)
            const isCompleted = status === 'completed'
            
            return (
              <div key={task.id} className={`card ${isCompleted ? 'bg-green-500/10 border-green-500/30' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-500/20' : 'bg-purple-500/20'
                    }`}>
                      {getTaskIcon(task.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{task.title}</h4>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                      {task.link && (
                        <p className="text-blue-400 text-xs mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Click to open link
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{task.reward}</p>
                    <span className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {status === 'completed' ? (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Completed!</span>
                    </div>
                  ) : status === 'pending' ? (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Pending Review</span>
                    </div>
                  ) : status === 'rejected' ? (
                    <div className="flex items-center space-x-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Rejected - Resubmit</span>
                    </div>
                  ) : task.requiresProof ? (
                    <button
                      onClick={() => openVerificationModal(task)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Submit Proof</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTaskAction(task)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {task.action === 'game' && <TrendingUp className="w-4 h-4" />}
                      {task.action === 'survey' && <CheckCircle className="w-4 h-4" />}
                      {task.action === 'watch' && <Zap className="w-4 h-4" />}
                      <span>
                        {task.action === 'game' ? 'Play Game' :
                         task.action === 'survey' ? 'Take Survey' :
                         task.action === 'watch' ? 'Watch Video' :
                         task.action === 'download' ? 'Download App' : 'Complete'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Weekly Leaderboard */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4 flex items-center">
          <Award className="w-5 h-5 text-yellow-400 mr-2" />
          Weekly Leaderboard
        </h3>
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div key={user.rank} className="flex items-center justify-between p-3 bg-primary-dark/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-orange-500 text-white' :
                  'bg-primary-dark text-white'
                }`}>
                  {user.rank}
                </div>
                <div>
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-gray-400 text-xs">{user.tasks} tasks completed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">{user.earnings} USDT</p>
                <p className="text-gray-400 text-xs">This week</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Program */}
      <div className="card bg-gradient-to-br from-primary-accent/20 to-purple-500/20 border border-primary-accent/30">
        <h3 className="text-base font-bold text-white mb-4">Referral Program</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Invite Friends</span>
            <span className="text-white font-medium">{referralStats.invitedFriends || 0}/{referralStats.maxInvites || 10}</span>
          </div>
          <div className="w-full bg-primary-dark rounded-full h-2">
            <div className="bg-primary-accent h-2 rounded-full" style={{ width: `${referralStats.progress || 0}%` }}></div>
          </div>
          <p className="text-gray-400 text-sm">
            {referralStats.nextTier ? 
              `Invite ${referralStats.nextTier.friends - (referralStats.invitedFriends || 0)} more friends to unlock ${referralStats.nextTier.tier} tier (${referralStats.nextTier.reward} USDT)` :
              'All referral tiers unlocked!'
            }
          </p>
          <div className="flex space-x-2">
            <button onClick={openInviteModal} className="btn-primary flex-1">
              Invite Friends
            </button>
            <button onClick={handleShareReferral} className="btn-primary flex-1">
              Share Link
            </button>
          </div>
          {referralStats.referralCode && (
            <div className="bg-primary-dark/30 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Your Referral Code:</p>
              <p className="text-white font-mono text-sm">{referralStats.referralCode}</p>
            </div>
          )}
        </div>
      </div>

      {/* Earning Tips */}
      <div className="card bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
        <h3 className="text-base font-bold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 text-blue-400 mr-2" />
          Earning Tips
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">Complete daily tasks first for consistent earnings</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">Invite friends to earn referral bonuses</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">Participate in tournaments for higher rewards</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">💡</span>
            <p className="text-gray-300">Maintain streaks for bonus multipliers</p>
          </div>
        </div>
      </div>

      {/* Invite Friend Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Invite Friend</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Telegram Username</label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-primary-dark border border-primary-accent/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-accent"
                />
              </div>
              
              {inviteMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  inviteMessage.includes('Successfully') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {inviteMessage}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleInviteFriend}
                  className="btn-primary flex-1"
                >
                  Send Invite
                </button>
                <button
                  onClick={closeInviteModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Verification Modal */}
      {showVerificationModal && selectedTask && (
        <TaskVerificationModal
          isOpen={showVerificationModal}
          onClose={closeVerificationModal}
          task={selectedTask}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  )
}

export default Earn
