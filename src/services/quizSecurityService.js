// Quiz Security Service - Admin Loss Prevention
import firebaseService from './firebaseService'
import dataService from './dataService'

class QuizSecurityService {
  constructor() {
    this.securityRules = {
      maxDailyQuizzes: 10,
      maxHourlyQuizzes: 3,
      minTimeBetweenQuizzes: 30000, // 30 seconds
      maxConsecutiveCorrect: 5,
      suspiciousScoreThreshold: 95,
      maxAttemptsPerQuestion: 2
    }
    
    this.fraudDetection = {
      rapidAnswers: [],
      suspiciousPatterns: [],
      blockedUsers: new Set()
    }
  }

  // Main security check before quiz starts
  async validateQuizStart(userId, difficulty) {
    try {
      console.log(`🔒 Security check for user: ${userId}`)
      
      // 1. Check if user is blocked
      if (this.fraudDetection.blockedUsers.has(userId)) {
        return {
          allowed: false,
          reason: 'User is blocked due to suspicious activity',
          code: 'USER_BLOCKED'
        }
      }

      // 2. Check daily quiz limit
      const dailyCheck = await this.checkDailyLimit(userId)
      if (!dailyCheck.allowed) {
        return dailyCheck
      }

      // 3. Check hourly quiz limit
      const hourlyCheck = await this.checkHourlyLimit(userId)
      if (!hourlyCheck.allowed) {
        return hourlyCheck
      }

      // 4. Check time between quizzes
      const timeCheck = await this.checkTimeBetweenQuizzes(userId)
      if (!timeCheck.allowed) {
        return timeCheck
      }

      // 5. Check user behavior patterns
      const behaviorCheck = await this.checkUserBehavior(userId)
      if (!behaviorCheck.allowed) {
        return behaviorCheck
      }

      // 6. Check difficulty progression
      const difficultyCheck = await this.checkDifficultyProgression(userId, difficulty)
      if (!difficultyCheck.allowed) {
        return difficultyCheck
      }

      return {
        allowed: true,
        message: 'Quiz start approved',
        securityLevel: this.calculateSecurityLevel(userId)
      }

    } catch (error) {
      console.error('Error validating quiz start:', error)
      return {
        allowed: false,
        reason: 'Security validation failed',
        code: 'VALIDATION_ERROR'
      }
    }
  }

  // Check daily quiz limit
  async checkDailyLimit(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const userData = await firebaseService.getUser(userId)
      
      if (!userData) {
        return {
          allowed: false,
          reason: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      }

      const dailyQuizzes = userData.dailyQuizzesCompleted || 0
      const maxDaily = userData.maxDailyQuizzes || this.securityRules.maxDailyQuizzes

      if (dailyQuizzes >= maxDaily) {
        return {
          allowed: false,
          reason: `Daily quiz limit reached (${dailyQuizzes}/${maxDaily})`,
          code: 'DAILY_LIMIT_REACHED'
        }
      }

      return { allowed: true }
    } catch (error) {
      return {
        allowed: false,
        reason: 'Error checking daily limit',
        code: 'DAILY_LIMIT_ERROR'
      }
    }
  }

  // Check hourly quiz limit
  async checkHourlyLimit(userId) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      const recentQuizzes = await firebaseService.queryCollection('quiz_sessions', [
        { field: 'userId', operator: '==', value: userId },
        { field: 'startedAt', operator: '>=', value: oneHourAgo.toISOString() }
      ])

      if (recentQuizzes.length >= this.securityRules.maxHourlyQuizzes) {
        return {
          allowed: false,
          reason: `Hourly quiz limit reached (${recentQuizzes.length}/${this.securityRules.maxHourlyQuizzes})`,
          code: 'HOURLY_LIMIT_REACHED'
        }
      }

      return { allowed: true }
    } catch (error) {
      return {
        allowed: false,
        reason: 'Error checking hourly limit',
        code: 'HOURLY_LIMIT_ERROR'
      }
    }
  }

  // Check time between quizzes
  async checkTimeBetweenQuizzes(userId) {
    try {
      const lastQuiz = await firebaseService.queryCollection('quiz_sessions', [
        { field: 'userId', operator: '==', value: userId }
      ], 'startedAt', 'desc', 1)

      if (lastQuiz.length > 0) {
        const lastQuizTime = new Date(lastQuiz[0].startedAt)
        const timeDiff = Date.now() - lastQuizTime.getTime()
        
        if (timeDiff < this.securityRules.minTimeBetweenQuizzes) {
          const remainingTime = Math.ceil((this.securityRules.minTimeBetweenQuizzes - timeDiff) / 1000)
          return {
            allowed: false,
            reason: `Please wait ${remainingTime} seconds before starting next quiz`,
            code: 'TIME_BETWEEN_QUIZZES'
          }
        }
      }

      return { allowed: true }
    } catch (error) {
      return {
        allowed: false,
        reason: 'Error checking time between quizzes',
        code: 'TIME_CHECK_ERROR'
      }
    }
  }

  // Check user behavior patterns
  async checkUserBehavior(userId) {
    try {
      const userData = await firebaseService.getUser(userId)
      
      if (!userData) {
        return {
          allowed: false,
          reason: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      }

      // Check for suspicious patterns
      const suspiciousPatterns = await this.detectSuspiciousPatterns(userId)
      if (suspiciousPatterns.length > 0) {
        return {
          allowed: false,
          reason: 'Suspicious activity detected',
          code: 'SUSPICIOUS_ACTIVITY',
          details: suspiciousPatterns
        }
      }

      // Check win rate
      const winRate = userData.winRate || 0
      if (winRate > 95 && userData.questionsAnswered > 50) {
        return {
          allowed: false,
          reason: 'Unusually high win rate detected',
          code: 'HIGH_WIN_RATE'
        }
      }

      return { allowed: true }
    } catch (error) {
      return {
        allowed: false,
        reason: 'Error checking user behavior',
        code: 'BEHAVIOR_CHECK_ERROR'
      }
    }
  }

  // Check difficulty progression
  async checkDifficultyProgression(userId, difficulty) {
    try {
      const userData = await firebaseService.getUser(userId)
      
      if (!userData) {
        return {
          allowed: false,
          reason: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      }

      const questionsAnswered = userData.questionsAnswered || 0
      const level = userData.level || 1

      // New users should start with easy
      if (questionsAnswered < 10 && difficulty !== 'easy') {
        return {
          allowed: false,
          reason: 'New users must start with easy difficulty',
          code: 'DIFFICULTY_RESTRICTION'
        }
      }

      // Level-based difficulty restrictions
      if (difficulty === 'hard' && level < 5) {
        return {
          allowed: false,
          reason: 'Hard difficulty requires level 5 or higher',
          code: 'LEVEL_RESTRICTION'
        }
      }

      return { allowed: true }
    } catch (error) {
      return {
        allowed: false,
        reason: 'Error checking difficulty progression',
        code: 'DIFFICULTY_CHECK_ERROR'
      }
    }
  }

  // Detect suspicious patterns
  async detectSuspiciousPatterns(userId) {
    try {
      const patterns = []

      // Get recent quiz sessions
      const recentSessions = await firebaseService.queryCollection('quiz_sessions', [
        { field: 'userId', operator: '==', value: userId }
      ], 'startedAt', 'desc', 10)

      if (recentSessions.length >= 5) {
        // Check for rapid completion
        const rapidCompletions = recentSessions.filter(session => {
          const startTime = new Date(session.startedAt)
          const endTime = new Date(session.completedAt || session.startedAt)
          const duration = endTime.getTime() - startTime.getTime()
          return duration < 30000 // Less than 30 seconds
        })

        if (rapidCompletions.length >= 3) {
          patterns.push('Rapid quiz completion detected')
        }

        // Check for perfect scores
        const perfectScores = recentSessions.filter(session => session.score === 100)
        if (perfectScores.length >= 3) {
          patterns.push('Multiple perfect scores detected')
        }

        // Check for consistent high scores
        const highScores = recentSessions.filter(session => session.score >= 95)
        if (highScores.length >= 5) {
          patterns.push('Consistently high scores detected')
        }
      }

      return patterns
    } catch (error) {
      console.error('Error detecting suspicious patterns:', error)
      return []
    }
  }

  // Calculate security level
  calculateSecurityLevel(userId) {
    // This would be based on user history, behavior, etc.
    return 'normal' // normal, high, critical
  }

  // Monitor quiz session in real-time
  async monitorQuizSession(sessionId, userId, questionId, answer, timeSpent) {
    try {
      // Check answer time
      if (timeSpent < 2000) { // Less than 2 seconds
        this.fraudDetection.rapidAnswers.push({
          userId,
          questionId,
          timeSpent,
          timestamp: Date.now()
        })
      }

      // Check for rapid answers pattern
      const recentRapidAnswers = this.fraudDetection.rapidAnswers.filter(
        answer => answer.userId === userId && 
        (Date.now() - answer.timestamp) < 60000 // Last minute
      )

      if (recentRapidAnswers.length >= 3) {
        await this.flagSuspiciousActivity(userId, 'Rapid answers detected')
        return {
          allowed: false,
          reason: 'Answering too quickly - please take your time',
          code: 'RAPID_ANSWERS'
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('Error monitoring quiz session:', error)
      return { allowed: true }
    }
  }

  // Flag suspicious activity
  async flagSuspiciousActivity(userId, reason) {
    try {
      const flag = {
        userId,
        reason,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      }

      await firebaseService.create('security_flags', flag)
      
      // Add to blocked users if severe
      if (reason.includes('Rapid answers') || reason.includes('Perfect scores')) {
        this.fraudDetection.blockedUsers.add(userId)
      }

      console.log(`🚨 Security flag: ${reason} for user ${userId}`)
    } catch (error) {
      console.error('Error flagging suspicious activity:', error)
    }
  }

  // Calculate quiz rewards with security checks
  async calculateQuizRewards(userId, score, difficulty, questionsAnswered, timeSpent) {
    try {
      const baseReward = this.getBaseReward(difficulty)
      const scoreMultiplier = score / 100
      const timeBonus = this.calculateTimeBonus(timeSpent, questionsAnswered)
      
      // Security adjustments
      const securityMultiplier = await this.getSecurityMultiplier(userId)
      
      // Calculate final reward
      let finalReward = baseReward * scoreMultiplier * timeBonus * securityMultiplier
      
      // Apply maximum reward limits
      const maxReward = this.getMaxReward(difficulty, questionsAnswered)
      finalReward = Math.min(finalReward, maxReward)
      
      // Apply minimum reward
      finalReward = Math.max(finalReward, 0.1)
      
      return {
        baseReward,
        scoreMultiplier,
        timeBonus,
        securityMultiplier,
        finalReward: Math.round(finalReward * 100) / 100
      }
    } catch (error) {
      console.error('Error calculating quiz rewards:', error)
      return {
        baseReward: 0,
        scoreMultiplier: 0,
        timeBonus: 0,
        securityMultiplier: 0,
        finalReward: 0
      }
    }
  }

  // Get base reward for difficulty
  getBaseReward(difficulty) {
    switch (difficulty) {
      case 'easy': return 0.5
      case 'medium': return 1.0
      case 'hard': return 2.0
      default: return 0.5
    }
  }

  // Calculate time bonus
  calculateTimeBonus(timeSpent, questionsAnswered) {
    const averageTimePerQuestion = timeSpent / questionsAnswered
    const idealTimePerQuestion = 15000 // 15 seconds
    
    if (averageTimePerQuestion < 5000) { // Too fast
      return 0.5 // Reduce reward
    } else if (averageTimePerQuestion > 30000) { // Too slow
      return 0.8 // Slight reduction
    } else {
      return 1.0 // Normal reward
    }
  }

  // Get security multiplier
  async getSecurityMultiplier(userId) {
    try {
      const userData = await firebaseService.getUser(userId)
      const winRate = userData.winRate || 0
      const questionsAnswered = userData.questionsAnswered || 0
      
      // Reduce multiplier for suspicious users
      if (winRate > 95 && questionsAnswered > 50) {
        return 0.5
      } else if (winRate > 90 && questionsAnswered > 20) {
        return 0.8
      } else {
        return 1.0
      }
    } catch (error) {
      return 1.0
    }
  }

  // Get maximum reward
  getMaxReward(difficulty, questionsAnswered) {
    const baseMax = this.getBaseReward(difficulty) * questionsAnswered
    return baseMax * 1.5 // 50% bonus maximum
  }

  // Block user
  async blockUser(userId, reason, duration = 24) {
    try {
      const block = {
        userId,
        reason,
        blockedAt: new Date().toISOString(),
        duration: duration * 60 * 60 * 1000, // Convert to milliseconds
        status: 'active'
      }

      await firebaseService.create('user_blocks', block)
      this.fraudDetection.blockedUsers.add(userId)
      
      console.log(`🚫 User blocked: ${userId} for ${duration} hours`)
    } catch (error) {
      console.error('Error blocking user:', error)
    }
  }

  // Unblock user
  async unblockUser(userId) {
    try {
      this.fraudDetection.blockedUsers.delete(userId)
      
      // Update block status in database
      const blocks = await firebaseService.queryCollection('user_blocks', [
        { field: 'userId', operator: '==', value: userId },
        { field: 'status', operator: '==', value: 'active' }
      ])

      for (const block of blocks) {
        await firebaseService.update('user_blocks', block.id, {
          status: 'inactive',
          unblockedAt: new Date().toISOString()
        })
      }

      console.log(`✅ User unblocked: ${userId}`)
    } catch (error) {
      console.error('Error unblocking user:', error)
    }
  }

  // Get security statistics
  async getSecurityStats() {
    try {
      const [
        totalUsers,
        blockedUsers,
        securityFlags,
        recentSessions
      ] = await Promise.all([
        firebaseService.read('users'),
        firebaseService.queryCollection('user_blocks', [
          { field: 'status', operator: '==', value: 'active' }
        ]),
        firebaseService.read('security_flags'),
        firebaseService.queryCollection('quiz_sessions', [], 'startedAt', 'desc', 100)
      ])

      const stats = {
        totalUsers: totalUsers.length,
        blockedUsers: blockedUsers.length,
        securityFlags: securityFlags.length,
        recentSessions: recentSessions.length,
        averageScore: recentSessions.reduce((sum, session) => sum + (session.score || 0), 0) / recentSessions.length,
        suspiciousSessions: recentSessions.filter(session => session.score >= 95).length
      }

      return stats
    } catch (error) {
      console.error('Error getting security stats:', error)
      return {
        totalUsers: 0,
        blockedUsers: 0,
        securityFlags: 0,
        recentSessions: 0,
        averageScore: 0,
        suspiciousSessions: 0
      }
    }
  }
}

// Create singleton instance
const quizSecurityService = new QuizSecurityService()

export default quizSecurityService
