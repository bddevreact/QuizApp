// Data Service for managing app data with Firebase integration
import firebaseService from './firebaseService'
import firebaseAuthService from './firebaseAuth'
import telegramService from './telegramService'

class DataService {
  constructor() {
    this.currentUser = null
    this.isInitialized = false
    this.isTelegramUser = false
    this.userData = null
    // Don't auto-initialize - let components call initializeData when needed
  }

  // Initialize data service
  async initializeData() {
    try {
      // Initialize Telegram service
      const telegramInit = await telegramService.initializeUser()
      
      if (telegramInit.isTelegramUser) {
        // Telegram user - store data in Firebase
        this.isTelegramUser = true
        await this.initializeTelegramUser(telegramInit.userData, telegramInit.referralSource)
      } else {
        // External user - also use Firebase (not localStorage)
        this.isTelegramUser = false
        await this.initializeExternalUser()
      }
      
      this.isInitialized = true
    } catch (error) {
      console.error('Error initializing data service:', error)
    }
  }

  // Initialize Telegram user
  async initializeTelegramUser(userData, referralSource) {
    try {
      // Check if user exists in Firebase
      const existingUser = await firebaseService.getUser(userData.userId).catch(() => null)
      
      if (existingUser) {
        // User exists, load their data
        this.userData = existingUser
        // Telegram user loaded from Firebase
      } else {
        // New user, create in Firebase
        const newUserData = {
          ...userData,
          totalEarned: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          availableBalance: 0,
          playableBalance: 0, // Only deposited money can be used for playing
          bonusBalance: 0, // Referral bonuses (can't be used until deposit)
          level: 1,
          xp: 0,
          rank: "Bronze",
          streak: 0,
          dailyQuizzesCompleted: 0,
          maxDailyQuizzes: 10,
          weeklyEarnings: 0,
          monthlyEarnings: 0,
          referralEarnings: 0,
          tournamentsWon: 0,
          totalTournaments: 0,
          winRate: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          averageScore: 0,
          isVerified: false,
          withdrawalEnabled: false,
          invitedFriends: 0,
          maxInvites: 10,
          referralSource: referralSource,
          lastActivity: new Date().toISOString(),
          status: 'active',
          hasDeposited: false // Track if user has ever deposited
        }
        
        // Save to Firebase
        await firebaseService.createUser(userData.userId, newUserData)
        this.userData = newUserData
        
        // Handle referral if user came from referral link
        if (referralSource) {
          await this.handleReferral(referralSource, userData.userId)
        }
        
        // New Telegram user created in Firebase
      }
    } catch (error) {
      console.error('Error initializing Telegram user:', error)
      // Fallback to localStorage
      await this.initializeExternalUser()
    }
  }

  // Initialize external user (also use Firebase)
  async initializeExternalUser() {
    try {
      // Generate a unique external user ID
      const externalUserId = `ext_${Date.now()}`
      
      // Check if external user exists in Firebase
      const existingUser = await firebaseService.getUser(externalUserId).catch(() => null)
      
      if (existingUser) {
        // External user exists, load their data from Firebase
        this.userData = existingUser
      } else {
        // Create new external user in Firebase
        const newUserData = {
          userId: externalUserId,
          username: "External User",
          fullName: "External User",
          userType: "external",
          totalEarned: 1250.00,
          totalDeposited: 500.00,
          totalWithdrawn: 200.00,
          availableBalance: 1050.00,
          playableBalance: 1000.00, // Only deposited money can be used for playing
          bonusBalance: 50.00, // Referral bonuses (can't be used until deposit)
          level: 4,
          xp: 350,
          rank: "Gold",
          streak: 7,
          dailyQuizzesCompleted: 3,
          maxDailyQuizzes: 10,
          weeklyEarnings: 245.50,
          monthlyEarnings: 890.25,
          referralEarnings: 45.75,
          tournamentsWon: 8,
          totalTournaments: 12,
          winRate: 67,
          questionsAnswered: 156,
          correctAnswers: 120,
          averageScore: 78,
          joinDate: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          isVerified: true,
          withdrawalEnabled: true,
          referralCode: this.generateReferralCode(),
          invitedFriends: 0,
          maxInvites: 10,
          hasDeposited: true // External user has deposited
        }
        
        // Save to Firebase
        await firebaseService.createUser(externalUserId, newUserData)
        this.userData = newUserData
      }
    } catch (error) {
      console.error('Error initializing external user:', error)
      // Fallback to localStorage if Firebase fails
      await this.initializeExternalUserFallback()
    }
  }

  // Fallback for external user (localStorage only if Firebase fails)
  async initializeExternalUserFallback() {
    try {
      const storedUserData = localStorage.getItem('quizApp_userData')
      if (storedUserData) {
        this.userData = JSON.parse(storedUserData)
      } else {
        this.userData = {
          userId: `ext_${Date.now()}`,
          username: "External User",
          fullName: "External User",
          userType: "external",
          totalEarned: 1250.00,
          totalDeposited: 500.00,
          totalWithdrawn: 200.00,
          availableBalance: 1050.00,
          playableBalance: 1000.00, // Only deposited money can be used for playing
          bonusBalance: 50.00, // Referral bonuses (can't be used until deposit)
          level: 4,
          xp: 350,
          rank: "Gold",
          streak: 7,
          dailyQuizzesCompleted: 3,
          maxDailyQuizzes: 10,
          weeklyEarnings: 245.50,
          monthlyEarnings: 890.25,
          referralEarnings: 45.75,
          tournamentsWon: 8,
          totalTournaments: 12,
          winRate: 67,
          questionsAnswered: 156,
          correctAnswers: 120,
          averageScore: 78,
          joinDate: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          isVerified: true,
          withdrawalEnabled: true,
          referralCode: "EXT123",
          invitedFriends: 0,
          maxInvites: 10,
          hasDeposited: true // External user has deposited
        }
        localStorage.setItem('quizApp_userData', JSON.stringify(this.userData))
      }
    } catch (error) {
      console.error('Error initializing external user fallback:', error)
    }
  }

  // Load user data from Firebase
  async loadUserData(userId) {
    try {
      const userData = await firebaseService.getUser(userId)
      if (userData) {
        this.userData = userData
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Get current user data
  getUserData() {
    return this.userData || {}
  }

  // Update user data
  async updateUserData(newData) {
    try {
      // Update local data
      this.userData = { ...this.userData, ...newData, lastActivity: new Date().toISOString() }
      
      // Always update Firebase for both Telegram and external users
      await firebaseService.updateUser(this.userData.userId, this.userData)
      
      return this.userData
    } catch (error) {
      console.error('Error updating user data:', error)
      // Fallback to localStorage if Firebase fails
      localStorage.setItem('quizApp_userData', JSON.stringify(this.userData))
      throw error
    }
  }

  // Handle referral system
  async handleReferral(referralCode, newUserId) {
    try {
      if (!this.isTelegramUser) return
      
      // Find referrer by referral code
      const referrer = await firebaseService.queryCollection('users', [
        { field: 'referralCode', operator: '==', value: referralCode }
      ])
      
      if (referrer && referrer.length > 0) {
        const referrerData = referrer[0]
        
        // Update referrer's stats - add to bonus balance (can't play until deposit)
        await firebaseService.updateUser(referrerData.userId, {
          invitedFriends: (referrerData.invitedFriends || 0) + 1,
          referralEarnings: (referrerData.referralEarnings || 0) + 5, // 5 USDT bonus
          totalEarned: (referrerData.totalEarned || 0) + 5,
          bonusBalance: (referrerData.bonusBalance || 0) + 5 // Add to bonus balance
        })
        
        // Update new user's referral source - add to bonus balance
        await firebaseService.updateUser(newUserId, {
          referralSource: referralCode,
          referralEarnings: 2, // 2 USDT welcome bonus
          bonusBalance: 2 // Add to bonus balance (can't play until deposit)
        })
        
        // Referral processed successfully
      }
    } catch (error) {
      console.error('Error handling referral:', error)
    }
  }

  // Quiz Questions - Get from Firebase or fallback
  async getQuizQuestions(difficulty = 'easy', count = 10) {
    if (this.isTelegramUser) {
      try {
        const questions = await firebaseService.getQuestions({
          difficulty,
          status: 'active'
        })
        
        // Shuffle and return requested count
        const shuffled = questions.sort(() => 0.5 - Math.random())
        return shuffled.slice(0, count)
      } catch (error) {
        console.error('Error getting quiz questions from Firebase:', error)
        // Return fallback questions if Firebase fails
        return this.getFallbackQuestions(difficulty, count)
      }
    } else {
      // External user - use fallback questions directly
      return this.getFallbackQuestions(difficulty, count)
    }
  }

  // Fallback questions for when Firebase is unavailable
  getFallbackQuestions(difficulty = 'easy', count = 10) {
    const fallbackQuestions = {
      easy: [
        {
          id: 'fallback_easy_1',
          question: "What is Bitcoin?",
          options: ["A digital currency", "A physical coin", "A bank account", "A credit card"],
          correct: 0,
          category: "Basics",
          explanation: "Bitcoin is a decentralized digital currency that operates on blockchain technology.",
          difficulty: "easy",
          source: "fallback"
        },
        {
          id: 'fallback_easy_2',
          question: "What does 'HODL' mean in crypto?",
          options: ["Hold On for Dear Life", "High Order Digital Logic", "Hold", "High Output Digital Ledger"],
          correct: 2,
          category: "Slang",
          explanation: "HODL is a misspelling of 'hold' that became popular in the crypto community.",
          difficulty: "easy",
          source: "fallback"
        }
      ],
      medium: [
        {
          id: 'fallback_medium_1',
          question: "What is a smart contract?",
          options: ["A legal document", "Self-executing code on blockchain", "A type of cryptocurrency", "A trading agreement"],
          correct: 1,
          category: "Technology",
          explanation: "Smart contracts are self-executing contracts with terms written in code on the blockchain.",
          difficulty: "medium",
          source: "fallback"
        }
      ],
      hard: [
        {
          id: 'fallback_hard_1',
          question: "What is the Byzantine Generals Problem?",
          options: ["A military strategy", "A consensus problem in distributed systems", "A trading algorithm", "A security protocol"],
          correct: 1,
          category: "Advanced",
          explanation: "The Byzantine Generals Problem is a fundamental problem in distributed systems about reaching consensus.",
          difficulty: "hard",
          source: "fallback"
        }
      ]
    }

    const questions = fallbackQuestions[difficulty] || fallbackQuestions.easy
    return questions.slice(0, count)
  }

  // Complete a quiz and update stats
  async completeQuiz(score, totalQuestions, difficulty) {
    try {
      const correctAnswers = Math.round((score / 100) * totalQuestions)
      const xpGained = correctAnswers * 10
      const usdtEarned = correctAnswers * this.getDifficultyReward(difficulty)

      // Update user stats
      await this.updateUserData({
        xp: (this.userData.xp || 0) + xpGained,
        totalEarned: (this.userData.totalEarned || 0) + usdtEarned,
        playableBalance: (this.userData.playableBalance || 0) + usdtEarned,
        availableBalance: (this.userData.playableBalance || 0) + usdtEarned + (this.userData.bonusBalance || 0),
        questionsAnswered: (this.userData.questionsAnswered || 0) + totalQuestions,
        correctAnswers: (this.userData.correctAnswers || 0) + correctAnswers,
        dailyQuizzesCompleted: (this.userData.dailyQuizzesCompleted || 0) + 1,
        lastActivity: new Date().toISOString()
      })

      // Check for level up
      await this.checkLevelUp()

      // Create transaction record
      const transaction = {
        id: Date.now(),
        userId: this.userData.userId,
        type: "quiz_reward",
        amount: usdtEarned,
        status: "completed",
        txHash: `Quiz_${Date.now()}`,
        timestamp: new Date().toISOString(),
        details: {
          score,
          totalQuestions,
          difficulty,
          correctAnswers
        }
      }

      // Create activity record
      const activity = {
        id: Date.now(),
        userId: this.userData.userId,
        type: "quiz_completed",
        title: "Quiz Completed",
        description: `Scored ${score}% on ${difficulty} quiz`,
        timestamp: new Date().toISOString(),
        icon: "🎯"
      }

      // Always store in Firebase for both Telegram and external users
      await firebaseService.createTransaction(transaction)
      await firebaseService.createActivity(activity)

      return {
        xpGained,
        usdtEarned,
        correctAnswers,
        newLevel: this.userData.level
      }
    } catch (error) {
      console.error('Error completing quiz:', error)
      throw error
    }
  }

  // Get difficulty reward
  getDifficultyReward(difficulty) {
    switch (difficulty) {
      case 'easy': return 0.5
      case 'medium': return 1.0
      case 'hard': return 2.0
      default: return 0.5
    }
  }

  // Check and update user level
  async checkLevelUp() {
    try {
      const currentLevel = this.userData.level || 1
      const newLevel = Math.floor((this.userData.xp || 0) / 100) + 1

      if (newLevel > currentLevel) {
        await this.updateUserData({ level: newLevel })
        
        // Add level up bonus
        const levelBonus = newLevel * 5
        await this.updateUserData({
          totalEarned: (this.userData.totalEarned || 0) + levelBonus,
          playableBalance: (this.userData.playableBalance || 0) + levelBonus,
          availableBalance: (this.userData.playableBalance || 0) + levelBonus + (this.userData.bonusBalance || 0)
        })

        // Create transaction for level bonus
        const transaction = {
          id: Date.now(),
          type: "level_bonus",
          amount: levelBonus,
          status: "completed",
          txHash: `Level_${newLevel}`,
          timestamp: new Date().toISOString()
        }

        // Create activity for level up
        const activity = {
          id: Date.now(),
          type: "level_up",
          title: "Level Up!",
          description: `Reached level ${newLevel} and earned ${levelBonus} USDT bonus!`,
          timestamp: new Date().toISOString(),
          icon: "⭐"
        }

        // Always store in Firebase for both Telegram and external users
        await firebaseService.createTransaction(transaction)
        await firebaseService.createActivity(activity)
      }
    } catch (error) {
      console.error('Error checking level up:', error)
    }
  }

  // Get tournaments
  async getTournaments(status = null) {
    try {
      // Always use Firebase for both Telegram and external users
      return await firebaseService.getTournaments(status)
    } catch (error) {
      console.log('Tournaments not available (Firebase not configured)')
      // Fallback to localStorage if Firebase fails
      return this.getFallbackTournaments(status)
    }
  }

  // Create tournament
  async createTournament(tournamentData) {
    try {
      return await firebaseService.createTournament(tournamentData)
    } catch (error) {
      console.error('Error creating tournament:', error)
      throw error
    }
  }

  // Get transactions
  async getTransactions() {
    try {
      // Always use Firebase for both Telegram and external users
      return await firebaseService.getTransactions(this.userData.userId)
    } catch (error) {
      console.error('Error getting transactions:', error)
      // Fallback to localStorage if Firebase fails
      const transactions = JSON.parse(localStorage.getItem('quizApp_transactions') || '[]')
      return transactions
    }
  }

  // Create transaction
  async createTransaction(transactionData) {
    try {
      const transaction = {
        id: Date.now(),
        ...transactionData,
        timestamp: new Date().toISOString()
      }

      // Always store in Firebase for both Telegram and external users
      await firebaseService.createTransaction(transaction)
      return transaction
    } catch (error) {
      console.error('Error creating transaction:', error)
      // Fallback to localStorage if Firebase fails
      const transactions = JSON.parse(localStorage.getItem('quizApp_transactions') || '[]')
      transactions.unshift(transaction)
      localStorage.setItem('quizApp_transactions', JSON.stringify(transactions))
      throw error
    }
  }

  // Get tasks
  async getTasks(type = null) {
    try {
      // Always use Firebase for both Telegram and external users
      return await firebaseService.getTasks(type)
    } catch (error) {
      console.log('Tasks not available (Firebase not configured)')
      // Fallback to localStorage if Firebase fails
      return this.getFallbackTasks(type)
    }
  }

  // Add new task (for admin)
  async addTask(taskData) {
    try {
      // Always store in Firebase for both Telegram and external users
      const task = {
        ...taskData,
        id: taskData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: taskData.isActive ? 'active' : 'inactive',
        completions: 0,
        uniqueUsers: 0
      }
      
      await firebaseService.create('tasks', task)
      return task
    } catch (error) {
      console.error('Error adding task:', error)
      // Fallback to localStorage if Firebase fails
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      const task = {
        ...taskData,
        id: taskData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: taskData.isActive ? 'active' : 'inactive',
        completions: 0
      }
      
      tasks.push(task)
      localStorage.setItem('tasks', JSON.stringify(tasks))
      return task
    }
  }

  // Update task (for admin)
  async updateTask(taskId, updates) {
    try {
      // Always use Firebase for both Telegram and external users
      await firebaseService.update('tasks', taskId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating task:', error)
      // Fallback to localStorage if Firebase fails
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      const taskIndex = tasks.findIndex(task => task.id === taskId)
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates }
        localStorage.setItem('tasks', JSON.stringify(tasks))
      }
      throw error
    }
  }

  // Delete task (for admin)
  async deleteTask(taskId) {
    try {
      // Always use Firebase for both Telegram and external users
      await firebaseService.delete('tasks', taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
      // Fallback to localStorage if Firebase fails
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      const filteredTasks = tasks.filter(task => task.id !== taskId)
      localStorage.setItem('tasks', JSON.stringify(filteredTasks))
      throw error
    }
  }

  // Add new tournament (for admin)
  async addTournament(tournamentData) {
    try {
      // Always store in Firebase for both Telegram and external users
      const tournament = {
        ...tournamentData,
        id: tournamentData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: [],
        status: tournamentData.status || 'upcoming'
      }
      
      await firebaseService.create('tournaments', tournament)
      return tournament
    } catch (error) {
      console.error('Error adding tournament:', error)
      // Fallback to localStorage if Firebase fails
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
      const tournament = {
        ...tournamentData,
        id: tournamentData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        participants: [],
        status: tournamentData.status || 'upcoming'
      }
      
      tournaments.push(tournament)
      localStorage.setItem('tournaments', JSON.stringify(tournaments))
      return tournament
    }
  }

  // Update tournament (for admin)
  async updateTournament(tournamentId, updates) {
    try {
      // Always use Firebase for both Telegram and external users
      await firebaseService.update('tournaments', tournamentId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating tournament:', error)
      // Fallback to localStorage if Firebase fails
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
      const tournamentIndex = tournaments.findIndex(tournament => tournament.id === tournamentId)
      if (tournamentIndex !== -1) {
        tournaments[tournamentIndex] = { ...tournaments[tournamentIndex], ...updates }
        localStorage.setItem('tournaments', JSON.stringify(tournaments))
      }
      throw error
    }
  }

  // Delete tournament (for admin)
  async deleteTournament(tournamentId) {
    try {
      // Always use Firebase for both Telegram and external users
      await firebaseService.delete('tournaments', tournamentId)
    } catch (error) {
      console.error('Error deleting tournament:', error)
      // Fallback to localStorage if Firebase fails
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
      const filteredTournaments = tournaments.filter(tournament => tournament.id !== tournamentId)
      localStorage.setItem('tournaments', JSON.stringify(filteredTournaments))
      throw error
    }
  }

  // Complete task
  async completeTask(taskId) {
    try {
      const task = await firebaseService.read('tasks', taskId)
      if (task && task.status !== 'completed') {
        await firebaseService.updateTask(taskId, { status: 'completed' })
        
        // Give reward
        await this.updateUserData({
          totalEarned: (this.userData.totalEarned || 0) + task.reward
        })

        // Create transaction
        await this.createTransaction({
          type: "task_reward",
          amount: task.reward,
          status: "completed",
          txHash: `Task_${taskId}`,
          timestamp: new Date().toISOString()
        })

        // Create activity
        await firebaseService.createActivity({
          userId: this.currentUser.uid,
          type: "task_completed",
          title: "Task Completed",
          description: `Earned ${task.reward} USDT for completing task`,
          timestamp: new Date().toISOString(),
          icon: "✅"
        })
      }
    } catch (error) {
      console.error('Error completing task:', error)
      throw error
    }
  }

  // Get achievements
  async getAchievements() {
    try {
      return await firebaseService.getAchievements()
    } catch (error) {
      console.log('Achievements not available (Firebase not configured)')
      return []
    }
  }

  // Get leaderboard
  async getLeaderboard() {
    try {
      // Always use Firebase for both Telegram and external users
      return await firebaseService.getLeaderboard()
    } catch (error) {
      console.log('Leaderboard not available (Firebase not configured)')
      // Fallback to mock data if Firebase fails
      return this.getFallbackLeaderboard()
    }
  }

  // Get recent activities
  async getRecentActivity() {
    try {
      // Always use Firebase for both Telegram and external users
      return await firebaseService.getActivities(this.userData.userId)
    } catch (error) {
      console.error('Error getting recent activity:', error)
      // Fallback to localStorage if Firebase fails
      const activities = JSON.parse(localStorage.getItem('quizApp_activities') || '[]')
      return activities
    }
  }

  // Get goals
  async getGoals() {
    try {
      // Goals can be calculated from user data
      const userData = this.getUserData()
      return [
        {
          id: 1,
          title: "Weekly Quiz Goal",
          target: 100,
          current: userData.questionsAnswered || 0,
          unit: "questions",
          icon: "Target",
          color: "blue"
        },
        {
          id: 2,
          title: "Monthly Earnings",
          target: 350,
          current: userData.totalEarned || 0,
          unit: "USDT",
          icon: "DollarSign",
          color: "green"
        },
        {
          id: 3,
          title: "Tournament Wins",
          target: 25,
          current: userData.tournamentsWon || 0,
          unit: "wins",
          icon: "Trophy",
          color: "yellow"
        }
      ]
    } catch (error) {
      console.error('Error getting goals:', error)
      return []
    }
  }

  // Admin methods
  async getAllUsers() {
    try {
      return await firebaseService.read('users')
    } catch (error) {
      console.log('Users not available (Firebase not configured)')
      return []
    }
  }

  async getPendingTransactions() {
    try {
      return await firebaseService.queryCollection('transactions', [
        { field: 'status', operator: '==', value: 'pending' }
      ])
    } catch (error) {
      console.error('Error getting pending transactions:', error)
      return []
    }
  }

  // Get pending deposits
  async getPendingDeposits() {
    try {
      return await firebaseService.queryCollection('transactions', [
        { field: 'type', operator: '==', value: 'deposit' },
        { field: 'status', operator: '==', value: 'pending' }
      ])
    } catch (error) {
      console.error('Error getting pending deposits:', error)
      return []
    }
  }

  async approveTransaction(txId) {
    try {
      return await firebaseService.updateTransaction(txId, { status: 'completed' })
    } catch (error) {
      console.error('Error approving transaction:', error)
      throw error
    }
  }

  async rejectTransaction(txId, reason) {
    try {
      return await firebaseService.updateTransaction(txId, { 
        status: 'failed',
        rejectionReason: reason
      })
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      throw error
    }
  }

  // Question management methods
  async addQuestion(question) {
    try {
      return await firebaseService.createQuestion(question)
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  async updateQuestion(questionId, updates) {
    try {
      return await firebaseService.updateQuestion(questionId, updates)
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  }

  async deleteQuestion(questionId) {
    try {
      return await firebaseService.deleteQuestion(questionId)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  async getAllAIQuestions(filters = {}) {
    try {
      return await firebaseService.getQuestions(filters)
    } catch (error) {
      console.error('Error getting AI questions:', error)
      return []
    }
  }

  async getQuestionStats() {
    try {
      return await firebaseService.getQuestionStats()
    } catch (error) {
      console.error('Error getting question stats:', error)
      return {
        total: 0,
        byDifficulty: { easy: 0, medium: 0, hard: 0 },
        byCategory: {},
        bySource: { ai: 0, fallback: 0, manual: 0 },
        active: 0,
        inactive: 0
      }
    }
  }

  // Authentication methods (for Telegram Mini App)
  async authenticateWithTelegram(telegramData) {
    try {
      // For Telegram Mini App, we just update user data
      const userData = {
        telegramId: telegramData.id.toString(),
        telegramUsername: telegramData.username,
        telegramFullName: `${telegramData.first_name} ${telegramData.last_name || ''}`.trim(),
        telegramPhotoUrl: telegramData.photo_url,
        totalEarned: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        availableBalance: 0,
        level: 1,
        xp: 0,
        rank: "Bronze",
        streak: 0,
        dailyQuizzesCompleted: 0,
        maxDailyQuizzes: 10,
        questionsAnswered: 0,
        correctAnswers: 0,
        averageScore: 0,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isVerified: false,
        withdrawalEnabled: false,
        referralCode: this.generateReferralCode(),
        invitedFriends: 0,
        maxInvites: 10
      }

      this.userData = userData
      localStorage.setItem('quizApp_userData', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      console.error('Error authenticating with Telegram:', error)
      throw error
    }
  }

  async signOut() {
    try {
      // Clear local data
      this.userData = null
      this.currentUser = null
      localStorage.removeItem('quizApp_userData')
      localStorage.removeItem('quizApp_transactions')
      localStorage.removeItem('quizApp_activities')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Generate referral code
  generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Utility methods
  async resetDailyTasks() {
    try {
      const today = new Date().toDateString()
      const lastReset = localStorage.getItem('lastDailyReset')
      
      if (lastReset !== today) {
        await this.updateUserData({ dailyQuizzesCompleted: 0 })
        localStorage.setItem('lastDailyReset', today)
      }
    } catch (error) {
      console.error('Error resetting daily tasks:', error)
    }
  }

  // Calculate user rank
  calculateRank(level, totalEarned) {
    if (level >= 20 && totalEarned >= 1000) return "Diamond"
    if (level >= 15 && totalEarned >= 500) return "Platinum"
    if (level >= 10 && totalEarned >= 200) return "Gold"
    if (level >= 5 && totalEarned >= 50) return "Silver"
    return "Bronze"
  }

  // Fallback methods for external users
  getFallbackTasks(type = null) {
    try {
      // Load tasks from localStorage for external users
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      
      if (type) {
        return tasks.filter(task => task.type === type)
      }
      
      return tasks
    } catch (error) {
      console.error('Error loading fallback tasks:', error)
      return []
    }
  }

  getFallbackTournaments(status = null) {
    try {
      // Load tournaments from localStorage for external users
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
      
      if (status) {
        return tournaments.filter(tournament => tournament.status === status)
      }
      
      return tournaments
    } catch (error) {
      console.error('Error loading fallback tournaments:', error)
      return []
    }
  }

  getFallbackLeaderboard() {
    try {
      // Return mock leaderboard data for external users
      return [
        { rank: 1, username: "CryptoMaster", earnings: 1250, tasks: 45 },
        { rank: 2, username: "QuizKing", earnings: 980, tasks: 38 },
        { rank: 3, username: "BlockchainPro", earnings: 750, tasks: 32 },
        { rank: 4, username: "DeFiExpert", earnings: 650, tasks: 28 },
        { rank: 5, username: "TokenTrader", earnings: 520, tasks: 25 }
      ]
    } catch (error) {
      console.error('Error loading fallback leaderboard:', error)
      return []
    }
  }

  // Get user by ID
  async getUserById(userId) {
    if (this.isTelegramUser) {
      try {
        const users = await this.getAllUsers()
        return Array.isArray(users) ? users.find(user => user.userId === userId) : null
      } catch (error) {
        console.error('Error getting user by ID:', error)
        return null
      }
    } else {
      // For external users, return the current user data if it matches
      return this.userData && this.userData.userId === userId ? this.userData : null
    }
  }

  // Update user status
  async updateUserStatus(userId, newStatus) {
    if (this.isTelegramUser) {
      try {
        await firebaseService.updateUser(userId, { status: newStatus })
        return true
      } catch (error) {
        console.error('Error updating user status:', error)
        return false
      }
    } else {
      // For external users, update local data
      if (this.userData && this.userData.userId === userId) {
        this.userData.status = newStatus
        this.updateUserData(this.userData)
        return true
      }
      return false
    }
  }

  // Toggle user verification
  async toggleUserVerification(userId) {
    if (this.isTelegramUser) {
      try {
        const user = await this.getUserById(userId)
        if (user) {
          await firebaseService.updateUser(userId, { isVerified: !user.isVerified })
          return true
        }
        return false
      } catch (error) {
        console.error('Error toggling user verification:', error)
        return false
      }
    } else {
      // For external users, update local data
      if (this.userData && this.userData.userId === userId) {
        this.userData.isVerified = !this.userData.isVerified
        this.updateUserData(this.userData)
        return true
      }
      return false
    }
  }

  // Get transaction limits
  getTransactionLimits() {
    return {
      dailyWithdrawalUsed: 0,
      monthlyWithdrawalUsed: 0,
      dailyWithdrawalsUsed: 0
    }
  }

  // Get wallet addresses
  getWalletAddresses() {
    return {
      TRC20: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      ERC20: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      BEP20: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    }
  }

  // Get app settings
  get settings() {
    return {
      dailyWithdrawalLimit: 100,
      monthlyWithdrawalLimit: 1000,
      maxDailyWithdrawals: 3,
      minWithdrawal: 10,
      maxWithdrawal: 1000,
      withdrawalFee: 2.00,
      minDeposit: 10,
      maxDeposit: 10000,
      supportedNetworks: ['TRC20', 'ERC20', 'BEP20'],
      processingTime: {
        deposit: '5-10 minutes',
        withdrawal: '1-3 hours'
      },
      dailyBonusAmount: 1.0,
      dailyBonusEnabled: true
    }
  }

  // Get daily bonus settings
  async getDailyBonusSettings() {
    try {
      // Always use Firebase for both Telegram and external users
      const settings = await firebaseService.read('settings', 'dailyBonus')
      return settings || {
        amount: 1.0,
        enabled: true,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting daily bonus settings:', error)
      // Fallback to localStorage if Firebase fails
      const settings = JSON.parse(localStorage.getItem('dailyBonusSettings') || '{}')
      return {
        amount: settings.amount || 1.0,
        enabled: settings.enabled !== false,
        lastUpdated: settings.lastUpdated || new Date().toISOString()
      }
    }
  }

  // Update daily bonus settings
  async updateDailyBonusSettings(settings) {
    try {
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString()
      }

      // Always use Firebase for both Telegram and external users
      await firebaseService.update('settings', 'dailyBonus', updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error('Error updating daily bonus settings:', error)
      // Fallback to localStorage if Firebase fails
      localStorage.setItem('dailyBonusSettings', JSON.stringify(updatedSettings))
      throw error
    }
  }
}

// Create singleton instance
const dataService = new DataService()

export default dataService
