import React, { useState, useEffect } from 'react'
import { 
  Users, 
  DollarSign, 
  Target, 
  Trophy, 
  BarChart3, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  Calendar,
  Clock,
  Bell
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import dataService from '../../services/dataService'
import AdminLayout from '../../components/AdminLayout'

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Calculate comprehensive stats from real data
      const allUsers = await dataService.getAllUsers()
      const totalUsers = Array.isArray(allUsers) ? allUsers.length : 0
      const telegramUsers = Array.isArray(allUsers) ? allUsers.filter(user => user.userType === 'telegram').length : 0
      const externalUsers = Array.isArray(allUsers) ? allUsers.filter(user => user.userType === 'external').length : 0
      const activeUsers = Array.isArray(allUsers) ? allUsers.filter(user => user.status === 'active').length : 0
      const verifiedUsers = Array.isArray(allUsers) ? allUsers.filter(user => user.isVerified).length : 0
      
      // Calculate today's users (joined today)
      const today = new Date().toDateString()
      const todayUsers = Array.isArray(allUsers) ? allUsers.filter(user => 
        new Date(user.joinDate).toDateString() === today
      ).length : 0
      
      // Calculate online users (active in last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const onlineUsers = Array.isArray(allUsers) ? allUsers.filter(user => 
        new Date(user.lastActivity) > yesterday
      ).length : 0
      
      // Calculate earnings and financial stats
      const totalEarnings = Array.isArray(allUsers) ? allUsers.reduce((sum, user) => sum + (user.totalEarned || 0), 0) : 0
      const totalDeposits = Array.isArray(allUsers) ? allUsers.reduce((sum, user) => sum + (user.totalDeposited || 0), 0) : 0
      const totalWithdrawals = Array.isArray(allUsers) ? allUsers.reduce((sum, user) => sum + (user.totalWithdrawn || 0), 0) : 0
      const totalReferralEarnings = Array.isArray(allUsers) ? allUsers.reduce((sum, user) => sum + (user.referralEarnings || 0), 0) : 0
      
      // Calculate quiz and task stats
      const totalQuizAnswered = Array.isArray(allUsers) ? allUsers.reduce((sum, user) => sum + (user.questionsAnswered || 0), 0) : 0
      const totalTasksCompleted = Array.isArray(allUsers) ? allUsers.reduce((sum, user) => sum + (user.tasksCompleted || 0), 0) : 0
      const totalReferrals = Array.isArray(allUsers) ? allUsers.reduce((sum, user) => sum + (user.invitedFriends || 0), 0) : 0
      
      const transactions = await dataService.getTransactions()
      const totalTransactions = Array.isArray(transactions) ? transactions.length : 0
      
      const tournaments = await dataService.getTournaments()
      const activeTournaments = Array.isArray(tournaments) ? tournaments.filter(t => t.status === 'active').length : 0
      const completedTournaments = Array.isArray(tournaments) ? tournaments.filter(t => t.status === 'completed').length : 0
      
      const questions = await dataService.getQuizQuestions('easy', 1000) // Get a large number to count all
      const totalQuestions = Array.isArray(questions) ? questions.length : 0
      
      const achievements = await dataService.getAchievements()
      const unlockedAchievements = Array.isArray(achievements) ? achievements.filter(a => a.unlocked).length : 0

      setStats({
        totalUsers,
        telegramUsers,
        externalUsers,
        activeUsers,
        verifiedUsers,
        todayUsers,
        onlineUsers,
        totalEarnings,
        totalDeposits,
        totalWithdrawals,
        totalReferralEarnings,
        totalQuizAnswered,
        totalTasksCompleted,
        totalReferrals,
        totalTransactions,
        activeTournaments,
        completedTournaments,
        totalQuestions,
        unlockedAchievements
      })

      // Load recent activity
      const activity = await dataService.getRecentActivity()
      setRecentActivity(Array.isArray(activity) ? activity.slice(0, 8) : [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set default values on error
      setStats({
        totalUsers: 0,
        telegramUsers: 0,
        externalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        todayUsers: 0,
        onlineUsers: 0,
        totalEarnings: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalReferralEarnings: 0,
        totalQuizAnswered: 0,
        totalTasksCompleted: 0,
        totalReferrals: 0,
        totalTransactions: 0,
        activeTournaments: 0,
        completedTournaments: 0,
        totalQuestions: 0,
        unlockedAchievements: 0
      })
      setRecentActivity([])
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h2>
          <p className="text-slate-600 text-lg">Monitor your crypto quiz app performance and user activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalUsers || 0}</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 font-semibold">{stats.telegramUsers || 0} Telegram</span>
              <span className="text-slate-500 ml-2">• {stats.externalUsers || 0} External</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Today's Users</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.todayUsers || 0}</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-semibold">{stats.onlineUsers || 0} online</span>
              <span className="text-slate-500 ml-2">• {stats.activeUsers || 0} active</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Quiz & Tasks</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalQuizAnswered || 0}</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 font-semibold">{stats.totalQuizAnswered || 0} quiz</span>
              <span className="text-slate-500 ml-2">• {stats.totalTasksCompleted || 0} tasks</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Referrals</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalReferrals || 0}</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-600 font-semibold">${stats.totalReferralEarnings?.toFixed(2) || '0.00'} earned</span>
              <span className="text-slate-500 ml-2">• Referral system</span>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {(Array.isArray(recentActivity) ? recentActivity : []).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.description}</p>
                  </div>
                  <div className="flex items-center text-xs text-slate-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Quick Actions</h3>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-900 font-semibold">Manage Users</span>
                <ArrowUpRight className="w-4 h-4 text-blue-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
              
              <Link
                to="/admin/quiz"
                className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-emerald-900 font-semibold">Add Questions</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
              
              <Link
                to="/admin/tournaments"
                className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="text-purple-900 font-semibold">Create Tournament</span>
                <ArrowUpRight className="w-4 h-4 text-purple-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
              
              <Link
                to="/admin/transactions"
                className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-orange-900 font-semibold">Review Transactions</span>
                <ArrowUpRight className="w-4 h-4 text-orange-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
              
              <Link
                to="/admin/marketing-tasks"
                className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-pink-900 font-semibold">Marketing Tasks</span>
                <ArrowUpRight className="w-4 h-4 text-pink-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            </div>
          </div>
        </div>

        {/* Real-Time User Interface Monitoring */}
        <div className="mt-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Real-Time User Interface Monitoring</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Live</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.activeSessions || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Online Users</p>
                    <p className="text-2xl font-bold text-green-800">{stats.currentOnlineUsers || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Pending Notifications</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.pendingNotifications || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.activeTasks || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent User Activity */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Recent User Interface Activity</h4>
              <div className="space-y-3">
                {stats.recentUserActivity && Array.isArray(stats.recentUserActivity) && stats.recentUserActivity.length > 0 ? (
                  stats.recentUserActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm">{activity.icon || '👤'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.user}</p>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No recent user activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
