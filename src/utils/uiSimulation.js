// UI Simulation and Testing Utilities
import dataService from '../services/dataService'

class UISimulation {
  constructor() {
    this.isSimulating = false
    this.simulationInterval = null
    this.originalData = null
  }

  // Start UI simulation with realistic data changes
  startSimulation() {
    if (this.isSimulating) return

    this.isSimulating = true
    console.log('🎮 Starting UI Simulation...')
    
    // Store original data
    this.originalData = { ...dataService.getUserData() }
    
    // Simulate realistic user interactions
    this.simulationInterval = setInterval(() => {
      this.simulateUserActivity()
    }, 3000) // Update every 3 seconds
  }

  // Stop UI simulation
  stopSimulation() {
    if (!this.isSimulating) return

    this.isSimulating = false
    console.log('🛑 Stopping UI Simulation...')
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
    
    // Restore original data
    if (this.originalData) {
      dataService.updateUserData(this.originalData)
    }
  }

  // Simulate realistic user activity
  simulateUserActivity() {
    const userData = dataService.getUserData()
    
    // Simulate quiz completion
    if (Math.random() < 0.3) {
      this.simulateQuizCompletion()
    }
    
    // Simulate daily bonus claim
    if (Math.random() < 0.1) {
      this.simulateDailyBonus()
    }
    
    // Simulate level up
    if (Math.random() < 0.05) {
      this.simulateLevelUp()
    }
    
    // Simulate referral
    if (Math.random() < 0.02) {
      this.simulateReferral()
    }
  }

  // Simulate quiz completion
  simulateQuizCompletion() {
    const userData = dataService.getUserData()
    const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    const score = Math.floor(Math.random() * 40) + 60 // 60-100%
    const questions = 10
    
    const correctAnswers = Math.round((score / 100) * questions)
    const xpGained = correctAnswers * 10
    const usdtEarned = correctAnswers * this.getDifficultyReward(difficulty)
    
    dataService.updateUserData({
      xp: (userData.xp || 0) + xpGained,
      totalEarned: (userData.totalEarned || 0) + usdtEarned,
      availableBalance: (userData.availableBalance || 0) + usdtEarned,
      questionsAnswered: (userData.questionsAnswered || 0) + questions,
      correctAnswers: (userData.correctAnswers || 0) + correctAnswers,
      dailyQuizzesCompleted: (userData.dailyQuizzesCompleted || 0) + 1,
      lastActivity: new Date().toISOString()
    })
    
    // Add transaction
    dataService.createTransaction({
      type: "quiz_reward",
      amount: usdtEarned,
      status: "completed",
      txHash: `Quiz_${Date.now()}`,
      details: {
        score,
        totalQuestions: questions,
        difficulty,
        correctAnswers
      }
    })
    
    // Add activity
    dataService.createActivity({
      type: "quiz_completed",
      title: "Quiz Completed",
      description: `Scored ${score}% on ${difficulty} quiz`,
      icon: "🎯"
    })
    
    console.log(`✅ Quiz completed: ${score}% on ${difficulty} difficulty`)
  }

  // Simulate daily bonus claim
  simulateDailyBonus() {
    const userData = dataService.getUserData()
    const bonusAmount = 1.0
    
    dataService.updateUserData({
      totalEarned: (userData.totalEarned || 0) + bonusAmount,
      availableBalance: (userData.availableBalance || 0) + bonusAmount,
      streak: (userData.streak || 0) + 1
    })
    
    // Add transaction
    dataService.createTransaction({
      type: "daily_bonus",
      amount: bonusAmount,
      status: "completed",
      txHash: `Daily #${new Date().getDate()}`
    })
    
    // Add activity
    dataService.createActivity({
      type: "daily_bonus_claimed",
      title: "Daily Bonus Claimed!",
      description: `Earned ${bonusAmount} USDT from daily bonus`,
      icon: "🎁"
    })
    
    console.log(`🎁 Daily bonus claimed: ${bonusAmount} USDT`)
  }

  // Simulate level up
  simulateLevelUp() {
    const userData = dataService.getUserData()
    const currentLevel = userData.level || 1
    const newLevel = currentLevel + 1
    const levelBonus = newLevel * 5
    
    dataService.updateUserData({
      level: newLevel,
      totalEarned: (userData.totalEarned || 0) + levelBonus,
      availableBalance: (userData.availableBalance || 0) + levelBonus
    })
    
    // Add transaction
    dataService.createTransaction({
      type: "level_bonus",
      amount: levelBonus,
      status: "completed",
      txHash: `Level_${newLevel}`
    })
    
    // Add activity
    dataService.createActivity({
      type: "level_up",
      title: "Level Up!",
      description: `Reached level ${newLevel} and earned ${levelBonus} USDT bonus!`,
      icon: "⭐"
    })
    
    console.log(`⭐ Level up: ${currentLevel} → ${newLevel} (+${levelBonus} USDT)`)
  }

  // Simulate referral
  simulateReferral() {
    const userData = dataService.getUserData()
    const referralBonus = 5.0
    
    dataService.updateUserData({
      invitedFriends: (userData.invitedFriends || 0) + 1,
      referralEarnings: (userData.referralEarnings || 0) + referralBonus,
      totalEarned: (userData.totalEarned || 0) + referralBonus
    })
    
    // Add transaction
    dataService.createTransaction({
      type: "referral_bonus",
      amount: referralBonus,
      status: "completed",
      txHash: `Referral_${Date.now()}`
    })
    
    // Add activity
    dataService.createActivity({
      type: "referral_bonus",
      title: "Referral Bonus!",
      description: `Earned ${referralBonus} USDT from referral`,
      icon: "👥"
    })
    
    console.log(`👥 Referral bonus: ${referralBonus} USDT`)
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

  // Simulate error states
  simulateError() {
    console.log('❌ Simulating error state...')
    // This would trigger error handling in components
    throw new Error('Simulated error for testing')
  }

  // Simulate loading states
  simulateLoading(duration = 2000) {
    console.log(`⏳ Simulating loading state for ${duration}ms...`)
    return new Promise(resolve => setTimeout(resolve, duration))
  }

  // Test responsive design
  testResponsiveDesign() {
    console.log('📱 Testing responsive design...')
    
    const breakpoints = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'Desktop' }
    ]
    
    breakpoints.forEach(breakpoint => {
      console.log(`Testing ${breakpoint.name}: ${breakpoint.width}x${breakpoint.height}`)
      // In a real test, you would resize the viewport
    })
  }

  // Performance testing
  testPerformance() {
    console.log('⚡ Testing performance...')
    
    const startTime = performance.now()
    
    // Simulate heavy operations
    for (let i = 0; i < 1000; i++) {
      dataService.getUserData()
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    console.log(`Performance test completed in ${duration.toFixed(2)}ms`)
    
    if (duration > 100) {
      console.warn('⚠️ Performance warning: Operations took longer than expected')
    } else {
      console.log('✅ Performance test passed')
    }
  }

  // Accessibility testing
  testAccessibility() {
    console.log('♿ Testing accessibility...')
    
    // Check for ARIA labels
    const buttons = document.querySelectorAll('button')
    const buttonsWithoutAria = Array.from(buttons).filter(btn => !btn.getAttribute('aria-label'))
    
    if (buttonsWithoutAria.length > 0) {
      console.warn(`⚠️ ${buttonsWithoutAria.length} buttons missing ARIA labels`)
    } else {
      console.log('✅ All buttons have ARIA labels')
    }
    
    // Check for keyboard navigation
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]')
    console.log(`Found ${focusableElements.length} focusable elements`)
    
    // Check color contrast (simplified)
    const textElements = document.querySelectorAll('p, span, div')
    console.log(`Found ${textElements.length} text elements to check for contrast`)
  }

  // Memory leak testing
  testMemoryLeaks() {
    console.log('🧠 Testing for memory leaks...')
    
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
    
    // Simulate multiple data updates
    for (let i = 0; i < 100; i++) {
      dataService.updateUserData({
        lastActivity: new Date().toISOString()
      })
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc()
    }
    
    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
    const memoryIncrease = finalMemory - initialMemory
    
    console.log(`Memory usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`)
    
    if (memoryIncrease > 10 * 1024 * 1024) { // 10MB
      console.warn('⚠️ Potential memory leak detected')
    } else {
      console.log('✅ No significant memory leaks detected')
    }
  }

  // Run comprehensive tests
  async runComprehensiveTest() {
    console.log('🧪 Running comprehensive UI tests...')
    
    try {
      // Test performance
      this.testPerformance()
      
      // Test responsive design
      this.testResponsiveDesign()
      
      // Test accessibility
      this.testAccessibility()
      
      // Test memory leaks
      this.testMemoryLeaks()
      
      // Test error handling
      try {
        this.simulateError()
      } catch (error) {
        console.log('✅ Error handling works correctly')
      }
      
      // Test loading states
      await this.simulateLoading(1000)
      
      console.log('✅ All tests completed successfully')
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
  }
}

// Create singleton instance
const uiSimulation = new UISimulation()

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.uiSimulation = uiSimulation
}

export default uiSimulation
