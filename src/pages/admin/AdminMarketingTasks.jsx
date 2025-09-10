import React, { useState, useEffect } from 'react'
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Star,
  Activity,
  Zap,
  Award,
  X
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import dataService from '../../services/dataService' // Added import for dataService

const AdminMarketingTasks = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'daily',
    action: 'share',
    link: '',
    reward: 0,
    maxCompletions: 0,
    startDate: '',
    endDate: '',
    partnerId: '',
    requirements: '',
    isActive: true
  })

  useEffect(() => {
    loadTasks()
    loadStats()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, statusFilter, typeFilter])

  const loadTasks = async () => {
    try {
      // Initialize dataService if not already initialized
      if (!dataService.isInitialized) {
        await dataService.initializeData()
      }
      
      // Load tasks from dataService
      const tasksData = await dataService.getTasks()
      setTasks(Array.isArray(tasksData) ? tasksData : [])
    } catch (error) {
      console.error('Error loading marketing tasks:', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Calculate real stats from tasks data
      const tasksData = await dataService.getTasks()
      const allTasks = Array.isArray(tasksData) ? tasksData : []
      
      const realStats = {
        totalTasks: allTasks.length,
        activeTasks: allTasks.filter(task => task.status === 'active').length,
        completedTasks: allTasks.filter(task => task.status === 'completed').length,
        totalCompletions: allTasks.reduce((sum, task) => sum + (task.completions || 0), 0),
        uniqueUsers: allTasks.reduce((sum, task) => sum + (task.uniqueUsers || 0), 0),
        avgCompletions: allTasks.length > 0 ? allTasks.reduce((sum, task) => sum + (task.completions || 0), 0) / allTasks.length : 0,
        totalRewards: allTasks.reduce((sum, task) => sum + (task.reward || 0), 0),
        avgReward: allTasks.length > 0 ? allTasks.reduce((sum, task) => sum + (task.reward || 0), 0) / allTasks.length : 0,
        topPartner: allTasks.find(task => task.partnerName)?.partnerName || 'None',
        conversionRate: allTasks.length > 0 ? allTasks.reduce((sum, task) => sum + (task.conversionRate || 0), 0) / allTasks.length : 0,
        successRate: allTasks.length > 0 ? allTasks.reduce((sum, task) => sum + (task.successRate || 0), 0) / allTasks.length : 0,
        engagementScore: allTasks.length > 0 ? allTasks.reduce((sum, task) => sum + (task.engagementScore || 0), 0) / allTasks.length : 0
      }
      setStats(realStats)
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats({
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        totalCompletions: 0,
        uniqueUsers: 0,
        avgCompletions: 0,
        totalRewards: 0,
        avgReward: 0,
        topPartner: 'None',
        conversionRate: 0,
        successRate: 0,
        engagementScore: 0
      })
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.partnerName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.type === typeFilter)
    }

    setFilteredTasks(filtered)
  }

  const createTask = async () => {
    try {
      const task = {
        id: Date.now().toString(),
        ...newTask,
        createdAt: new Date().toISOString(),
        completions: 0,
        status: newTask.isActive ? 'active' : 'inactive'
      }
      
      // Add task to database
      const createdTask = await dataService.addTask(task)
      
      // Update local state
      setTasks(prev => [...prev, createdTask])
      setShowCreateModal(false)
      setNewTask({
        title: '',
        description: '',
        type: 'daily',
        action: 'share',
        link: '',
        reward: 0,
        maxCompletions: 0,
        startDate: '',
        endDate: '',
        partnerId: '',
        requirements: '',
        isActive: true
      })
      
      // Reload tasks and stats
      await loadTasks()
      await loadStats()
      
      // Show success notification
      alert(`Marketing task "${task.title}" created successfully!`)
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    }
  }

  const updateTask = (taskId, updates) => {
    setTasks(prev => 
      prev.map(task => task.id === taskId ? { ...task, ...updates } : task)
    )
    
    // Update data service
    dataService.updateTask(taskId, updates)
    
    // Update user interface tasks
    const userTasks = JSON.parse(localStorage.getItem('userTasks') || '[]')
    const updatedUserTasks = userTasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    )
    localStorage.setItem('userTasks', JSON.stringify(updatedUserTasks))
    
    loadStats()
    
    // Show success notification
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      alert(`Task "${task.title}" updated successfully!`)
    }
  }

  const deleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      const taskToDelete = tasks.find(t => t.id === taskId)
      
      setTasks(prev => prev.filter(task => task.id !== taskId))
      
      // Remove from data service
      dataService.deleteTask(taskId)
      
      // Remove from user interface tasks
      const userTasks = JSON.parse(localStorage.getItem('userTasks') || '[]')
      const filteredUserTasks = userTasks.filter(task => task.id !== taskId)
      localStorage.setItem('userTasks', JSON.stringify(filteredUserTasks))
      
      loadStats()
      
      // Show success notification
      if (taskToDelete) {
        alert(`Task "${taskToDelete.title}" deleted successfully!`)
      }
    }
  }

  const toggleTaskStatus = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const newStatus = task.status === 'active' ? 'inactive' : 'active'
      updateTask(taskId, { status: newStatus, isActive: newStatus === 'active' })
      
      // Notify users about task status change
      if (newStatus === 'active') {
        // Task activated - notify users
        const notification = {
          type: 'task_activated',
          title: 'New Task Available!',
          message: `Task "${task.title}" is now active. Complete it to earn $${task.reward.toFixed(2)}!`,
          timestamp: new Date().toISOString()
        }
        
        // Store notification for user interface
        const userNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]')
        userNotifications.push(notification)
        localStorage.setItem('userNotifications', JSON.stringify(userNotifications))
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active', icon: Play },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactive', icon: Pause },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800', text: 'Expired', icon: XCircle }
    }
    
    const config = statusConfig[status] || statusConfig.inactive
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      daily: { color: 'bg-blue-100 text-blue-800', text: 'Daily' },
      partner: { color: 'bg-purple-100 text-purple-800', text: 'Partner' },
      campaign: { color: 'bg-orange-100 text-orange-800', text: 'Campaign' },
      referral: { color: 'bg-green-100 text-green-800', text: 'Referral' }
    }
    
    const config = typeConfig[type] || typeConfig.daily
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading marketing tasks...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Marketing Task Management
          </h2>
          <p className="text-slate-600 text-lg">Create, manage, and track marketing tasks and campaigns</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalTasks || 0}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 font-semibold">{stats.activeTasks || 0} active</span>
              <span className="text-slate-500 ml-2">• {stats.completedTasks || 0} completed</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Completions</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalCompletions || 0}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-semibold">{stats.uniqueUsers || 0} unique users</span>
              <span className="text-slate-500 ml-2">• {stats.avgCompletions || 0} avg/task</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Rewards</p>
                  <p className="text-2xl font-bold text-slate-800">${stats.totalRewards?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 font-semibold">${stats.avgReward?.toFixed(2) || '0.00'} avg reward</span>
              <span className="text-slate-500 ml-2">• {stats.topPartner || 'N/A'} top partner</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.conversionRate || 0}%</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-pink-600 font-semibold">{stats.successRate || 0}% success</span>
              <span className="text-slate-500 ml-2">• {stats.engagementScore || 0}/10 engagement</span>
            </div>
          </div>
        </div>

        {/* Create Task Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title, description, or partner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Types</option>
                <option value="daily">Daily</option>
                <option value="partner">Partner</option>
                <option value="campaign">Campaign</option>
                <option value="referral">Referral</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Type & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Rewards & Completions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-slate-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-slate-800">{task.title}</div>
                          <div className="text-sm text-slate-500 max-w-xs truncate">{task.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getTypeBadge(task.type)}
                        {getStatusBadge(task.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">
                        <div className="font-semibold">${task.reward.toFixed(2)}</div>
                        <div className="text-slate-500">{task.completions}/{task.maxCompletions || '∞'} completed</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(task.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {task.partnerName || 'Internal'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTask(task)
                            setShowTaskModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            task.status === 'active' 
                              ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={task.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {task.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 px-6 py-3 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              Showing <span className="font-semibold">1</span> to <span className="font-semibold">{filteredTasks.length}</span> of{' '}
              <span className="font-semibold">{tasks.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Create New Marketing Task</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task Type</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="partner">Partner</option>
                    <option value="campaign">Campaign</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Action Type</label>
                  <select
                    value={newTask.action}
                    onChange={(e) => setNewTask({...newTask, action: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="share">Share</option>
                    <option value="invite">Invite</option>
                    <option value="social">Social Media</option>
                    <option value="subscribe">Subscribe</option>
                    <option value="create">Create Content</option>
                    <option value="join">Join Community</option>
                    <option value="game">Play Game</option>
                    <option value="survey">Take Survey</option>
                    <option value="watch">Watch Video</option>
                    <option value="download">Download App</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task Link (URL)</label>
                  <input
                    type="url"
                    value={newTask.link}
                    onChange={(e) => setNewTask({...newTask, link: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">Required for social, YouTube, join, watch, download tasks</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reward Amount ($)</label>
                  <input
                    type="number"
                    value={newTask.reward || ''}
                    onChange={(e) => setNewTask({...newTask, reward: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Completions</label>
                  <input
                    type="number"
                    value={newTask.maxCompletions || ''}
                    onChange={(e) => setNewTask({...newTask, maxCompletions: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0 (unlimited)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter task description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Requirements</label>
                  <textarea
                    value={newTask.requirements}
                    onChange={(e) => setNewTask({...newTask, requirements: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter task requirements"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Task Details</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Task Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Title:</span>
                      <span className="text-slate-900 font-medium">{selectedTask.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type:</span>
                      {getTypeBadge(selectedTask.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      {getStatusBadge(selectedTask.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reward:</span>
                      <span className="text-slate-900 font-medium">${selectedTask.reward.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Completions:</span>
                      <span className="text-slate-900 font-medium">{selectedTask.completions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Completions:</span>
                      <span className="text-slate-900 font-medium">{selectedTask.maxCompletions || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Success Rate:</span>
                      <span className="text-slate-900 font-medium">{selectedTask.successRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Created:</span>
                      <span className="text-slate-900 font-medium">{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-slate-900 mb-3">Description</h4>
                <p className="text-sm text-slate-600 mb-4">{selectedTask.description}</p>
                
                <h4 className="font-semibold text-slate-900 mb-3">Requirements</h4>
                <p className="text-sm text-slate-600">{selectedTask.requirements || 'No specific requirements'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminMarketingTasks
