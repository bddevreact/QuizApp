import React, { useState, useEffect } from 'react'
import { Clock, Trophy, Star, Target, Zap, Bot, Shield, AlertTriangle, DollarSign, Wallet } from 'lucide-react'
import dataService from '../services/dataService'
import quizSecurityService from '../services/quizSecurityService'
import balanceService from '../services/balanceService'
import firebaseService from '../services/firebaseService'
import LoadingSpinner from '../components/LoadingSpinner'

const Quiz = () => {
  const [difficulty, setDifficulty] = useState('easy')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [questions, setQuestions] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [securityCheck, setSecurityCheck] = useState(null)
  const [isSecurityLoading, setIsSecurityLoading] = useState(false)
  const [securityWarning, setSecurityWarning] = useState(null)
  const [quizSessionId, setQuizSessionId] = useState(null)
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [userBalance, setUserBalance] = useState(0)
  const [playableBalance, setPlayableBalance] = useState(0)
  const [bonusBalance, setBonusBalance] = useState(0)
  const [challengeAmount, setChallengeAmount] = useState(0.5)
  const [isProcessingChallenge, setIsProcessingChallenge] = useState(false)
  const [challengeResult, setChallengeResult] = useState(null)
  const [balanceCheck, setBalanceCheck] = useState(null)
  const [isBettingMode, setIsBettingMode] = useState(true) // Always challenge mode

  // Load questions when difficulty changes
  useEffect(() => {
    const loadQuestions = async () => {
      if (difficulty) {
        try {
          // Initialize dataService if not already initialized
          if (!dataService.isInitialized) {
            await dataService.initializeData()
          }
          
          const quizQuestions = await dataService.getQuizQuestions(difficulty, 10)
          setQuestions(Array.isArray(quizQuestions) ? quizQuestions : [])
          
          // AI question usage analytics (production ready)
          const aiQuestions = Array.isArray(quizQuestions) ? quizQuestions.filter(q => q.source === 'ai') : []
          if (aiQuestions.length > 0) {
            // Analytics can be sent to external service in production
          }
        } catch (error) {
          console.error('Error loading quiz questions:', error)
          setQuestions([])
        }
      }
    }

    loadQuestions()
  }, [difficulty])

  // Load user balance
  useEffect(() => {
    loadUserBalance()
  }, [])

  const loadUserBalance = async () => {
    try {
      const userData = dataService.getUserData()
      const balanceResult = await balanceService.checkMinimumBalance(userData.userId)
      setUserBalance(balanceResult.currentBalance)
      setPlayableBalance(balanceResult.playableBalance)
      setBonusBalance(balanceResult.bonusBalance)
      setBalanceCheck(balanceResult)
    } catch (error) {
      console.error('Error loading user balance:', error)
    }
  }

  // Timer countdown
  useEffect(() => {
    let timer
    if (isQuizActive && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isQuizActive) {
      handleTimeUp()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, isQuizActive, showResult])

  const startQuiz = async () => {
    try {
      setIsSecurityLoading(true)
      setSecurityWarning(null)
      
      // Check if user wants challenge mode
      if (isBettingMode) {
        // Check minimum balance for challenges
        const userData = dataService.getUserData()
        const balanceResult = await balanceService.checkMinimumBalance(userData.userId)
        
        if (!balanceResult.hasMinimumBalance) {
          setSecurityWarning({
            type: 'error',
            message: `Minimum $${balanceResult.requiredBalance} required to play challenge quiz. Please deposit money first.`,
            code: 'INSUFFICIENT_BALANCE'
          })
          setIsSecurityLoading(false)
          return
        }
      }
      
      // Security check before starting quiz
      const userData = dataService.getUserData()
      const securityResult = await quizSecurityService.validateQuizStart(userData.userId, difficulty)
      
      if (!securityResult.allowed) {
        setSecurityWarning({
          type: 'error',
          message: securityResult.reason,
          code: securityResult.code
        })
        setIsSecurityLoading(false)
        return
      }
      
      // Create quiz session
      const sessionId = `quiz_${Date.now()}_${userData.userId}`
      setQuizSessionId(sessionId)
      
      // Record quiz session
      await firebaseService.create('quiz_sessions', {
        id: sessionId,
        userId: userData.userId,
        difficulty,
        startedAt: new Date().toISOString(),
        status: 'active',
        isChallengeMode: isBettingMode
      })
      
      setIsQuizActive(true)
      setCurrentQuestion(0)
      setScore(0)
      setTimeLeft(30)
      setStreak(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setQuizCompleted(false)
      setQuestionStartTime(Date.now())
      setChallengeResult(null)
      
      setIsSecurityLoading(false)
      
    } catch (error) {
      console.error('Error starting quiz:', error)
      setSecurityWarning({
        type: 'error',
        message: 'Failed to start quiz. Please try again.',
        code: 'START_ERROR'
      })
      setIsSecurityLoading(false)
    }
  }

  const handleAnswerSelect = async (answerIndex) => {
    if (selectedAnswer !== null || showResult) return
    
    const timeSpent = Date.now() - questionStartTime
    const currentQ = questions[currentQuestion]
    
    // Security check for answer
    const securityResult = await quizSecurityService.monitorQuizSession(
      quizSessionId,
      dataService.getUserData().userId,
      currentQ.id,
      answerIndex,
      timeSpent
    )
    
    if (!securityResult.allowed) {
      setSecurityWarning({
        type: 'warning',
        message: securityResult.reason,
        code: securityResult.code
      })
      return
    }
    
    // Handle challenge if in challenge mode
    if (isBettingMode) {
      setIsProcessingChallenge(true)
      
      try {
        // Place challenge for this question
        const userData = dataService.getUserData()
        const challengeResult = await balanceService.placeBet(userData.userId, currentQ.id, challengeAmount)
        
        if (!challengeResult.success) {
          alert(challengeResult.message)
          setIsProcessingChallenge(false)
          return
        }

        // Process challenge result with house edge
        const finalResult = await balanceService.forceBetResult(challengeResult.betId, currentQ.id)
        
        setChallengeResult({
          challengeAmount,
          result: finalResult.result,
          winAmount: finalResult.winAmount || 0,
          lossAmount: finalResult.lossAmount || 0,
          message: finalResult.message
        })

        // Update user balance
        await loadUserBalance()
        
      } catch (error) {
        console.error('Error processing challenge:', error)
        alert('Error processing challenge. Please try again.')
      } finally {
        setIsProcessingChallenge(false)
      }
    }
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const isCorrect = answerIndex === currentQ.correct

    if (isCorrect) {
      setScore(score + 10)
      setStreak(streak + 1)
    } else {
      setStreak(0)
    }

    // Show result for 3 seconds then move to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        nextQuestion()
      } else {
        finishQuiz()
      }
    }, 3000)
  }

  const handleTimeUp = () => {
    setSelectedAnswer(-1) // -1 indicates time up
    setShowResult(true)
    setStreak(0)

    // Still process bet even if time up
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        nextQuestion()
      } else {
        finishQuiz()
      }
    }, 3000)
  }

  const nextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1)
    setTimeLeft(30)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuestionStartTime(Date.now())
    setChallengeResult(null)
  }

  const finishQuiz = async () => {
    try {
      setIsQuizActive(false)
      setQuizCompleted(true)
      
      // Calculate final score
      const finalScore = Math.round((score / (questions.length * 10)) * 100)
      const totalTimeSpent = Date.now() - questionStartTime
      
      // Calculate secure rewards
      const rewardCalculation = await quizSecurityService.calculateQuizRewards(
        dataService.getUserData().userId,
        finalScore,
        difficulty,
        questions.length,
        totalTimeSpent
      )
      
      // Update quiz session
      if (quizSessionId) {
        await firebaseService.update('quiz_sessions', quizSessionId, {
          completedAt: new Date().toISOString(),
          score: finalScore,
          totalTime: totalTimeSpent,
          status: 'completed',
          reward: rewardCalculation.finalReward
        })
      }
      
      // Update user data with secure rewards
      const result = dataService.completeQuiz(finalScore, questions.length, difficulty)
      
      // Apply secure reward
      if (rewardCalculation.finalReward > 0) {
        dataService.updateUserData({
          totalEarned: (dataService.getUserData().totalEarned || 0) + rewardCalculation.finalReward
        })
        dataService.addTransaction({
          type: "quiz_reward",
          amount: rewardCalculation.finalReward,
          status: "completed",
          txHash: `Quiz_${Date.now()}`,
          details: {
            score: finalScore,
            difficulty,
            securityMultiplier: rewardCalculation.securityMultiplier
          }
        })
      }
      
      // Add bonus for streak (with security check)
      if (streak >= 5 && rewardCalculation.securityMultiplier > 0.5) {
        const streakBonus = Math.floor(streak / 5) * 2 // Reduced bonus
        const userData = dataService.getUserData()
        dataService.updateUserData({
          totalEarned: (userData.totalEarned || 0) + streakBonus,
          playableBalance: (userData.playableBalance || 0) + streakBonus,
          availableBalance: (userData.playableBalance || 0) + streakBonus + (userData.bonusBalance || 0)
        })
        dataService.addTransaction({
          type: "streak_bonus",
          amount: streakBonus,
          status: "completed",
          txHash: `Streak #${streak}`
        })
      }
      
    } catch (error) {
      console.error('Error finishing quiz:', error)
      setSecurityWarning({
        type: 'error',
        message: 'Error processing quiz results. Please contact support.',
        code: 'FINISH_ERROR'
      })
    }
  }

  const restartQuiz = () => {
    setDifficulty('easy')
    setCurrentQuestion(0)
    setScore(0)
    setTimeLeft(30)
    setIsQuizActive(false)
    setSelectedAnswer(null)
    setShowResult(false)
    setStreak(0)
    setQuizCompleted(false)
    setChallengeResult(null)
    loadUserBalance() // Reload balance on restart
  }

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getDifficultyReward = (diff) => {
    switch (diff) {
      case 'easy': return 0.5
      case 'medium': return 1.0
      case 'hard': return 2.0
      default: return 0.5
    }
  }

  if (quizCompleted) {
    const finalScore = Math.round((score / (questions.length * 10)) * 100)
    const correctAnswers = Math.round((finalScore / 100) * questions.length)

    return (
      <div className="min-h-screen overflow-y-auto pb-24">
        <div className="px-4 py-6 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Quiz Completed!</h1>
            <p className="text-gray-300">Here's your result</p>
          </div>

          <div className="card text-center">
            <div className="text-4xl font-bold text-white mb-4">{finalScore}%</div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Correct</p>
                <p className="text-white font-bold">{correctAnswers}/{questions.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Streak</p>
                <p className="text-white font-bold">{streak}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Difficulty</p>
                <p className={`font-bold capitalize ${getDifficultyColor(difficulty)}`}>{difficulty}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                <span className="text-gray-300">Playable Balance</span>
                <span className="text-blue-400 font-bold">${playableBalance.toFixed(2)}</span>
              </div>
              {bonusBalance > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                  <span className="text-gray-300">Bonus Balance</span>
                  <span className="text-green-400 font-bold">${bonusBalance.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={restartQuiz} className="btn-primary flex-1">
              Play Again
            </button>
            <button onClick={() => window.history.back()} className="btn-secondary flex-1">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isQuizActive) {
    return (
      <div className="min-h-screen overflow-y-auto pb-24">
        <div className="px-4 py-6 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-accent to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Crypto Challenge</h1>
            <p className="text-gray-300">Test your crypto knowledge and win USDT!</p>
          </div>

          {/* Security Warning */}
          {securityWarning && (
            <div className={`card border-l-4 ${
              securityWarning.type === 'error' 
                ? 'border-red-500 bg-red-500/10' 
                : 'border-yellow-500 bg-yellow-500/10'
            }`}>
              <div className="flex items-center space-x-3">
                {securityWarning.type === 'error' ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <Shield className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <h3 className={`font-medium ${
                    securityWarning.type === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {securityWarning.type === 'error' ? 'Access Denied' : 'Security Warning'}
                  </h3>
                  <p className="text-gray-300 text-sm">{securityWarning.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Daily Quiz Limit */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300">Daily Quizzes</span>
              <span className="text-white font-bold">
                {(dataService.getUserData().dailyQuizzesCompleted || 0)} / {(dataService.getUserData().maxDailyQuizzes || 10)}
              </span>
            </div>
            <div className="w-full bg-primary-dark rounded-full h-2">
              <div 
                className="bg-primary-accent h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((dataService.getUserData().dailyQuizzesCompleted || 0) / (dataService.getUserData().maxDailyQuizzes || 10)) * 100}%` 
                }}
              ></div>
            </div>
            <p className="text-gray-400 text-xs mt-2">{(dataService.getUserData().monthlyEarnings || 0)} / 1000 USDT</p>
          </div>

          {/* Difficulty Selection */}
          <div className="card">
            <h3 className="text-base font-bold text-white mb-4">Select Difficulty</h3>
            <div className="space-y-3">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    difficulty === diff
                      ? 'border-primary-accent bg-primary-accent/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h4 className={`font-bold capitalize ${getDifficultyColor(diff)}`}>
                        {diff}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {diff === 'easy' && 'Perfect for beginners'}
                        {diff === 'medium' && 'For crypto enthusiasts'}
                        {diff === 'hard' && 'Expert level challenges'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {getDifficultyReward(diff)} USDT per correct
                      </p>
                      <p className="text-gray-400 text-sm">10 questions</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Challenge Configuration */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Challenge Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Challenge Amount per Question (USDT)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={challengeAmount}
                  onChange={(e) => setChallengeAmount(parseFloat(e.target.value))}
                  className="input-field w-full"
                  placeholder="Enter challenge amount"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.1, 0.5, 1.0, 2.0].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setChallengeAmount(amount)}
                    className={`btn-sm ${
                      challengeAmount === amount
                        ? 'bg-primary-accent text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              
              {/* Balance Check */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">Playable Balance</span>
                  </div>
                  <span className="text-white font-bold">${playableBalance.toFixed(2)}</span>
                </div>
                {bonusBalance > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">Bonus Balance</span>
                    </div>
                    <span className="text-green-400 font-bold">${bonusBalance.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              {!balanceCheck?.hasMinimumBalance && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">Insufficient Balance</p>
                      <p className="text-gray-300 text-sm">{balanceCheck?.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = '/deposit'}
                    className="btn-primary w-full mt-3"
                  >
                    Deposit Money
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Start Quiz Button */}
          <button
            onClick={startQuiz}
            disabled={
              (dataService.getUserData().dailyQuizzesCompleted || 0) >= (dataService.getUserData().maxDailyQuizzes || 10) ||
              isSecurityLoading ||
              (isBettingMode && !balanceCheck?.hasMinimumBalance)
            }
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSecurityLoading ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span>Security Check...</span>
              </>
            ) : (dataService.getUserData().dailyQuizzesCompleted || 0) >= (dataService.getUserData().maxDailyQuizzes || 10) ? (
              'Daily Limit Reached'
            ) : isBettingMode && !balanceCheck?.hasMinimumBalance ? (
              'Insufficient Balance'
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                <span>Start Challenge Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen overflow-y-auto pb-24">
        <div className="px-4 py-6 text-center">
          <LoadingSpinner size="large" text="Loading questions..." color="primary" />
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen overflow-y-auto pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* Quiz Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary-accent" />
            <span className="text-white font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{timeLeft}s</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-primary-dark rounded-full h-2">
          <div 
            className="bg-primary-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Balance and Challenge Info */}
        {isBettingMode && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              <span className="text-white font-bold">${playableBalance.toFixed(2)}</span>
              {bonusBalance > 0 && (
                <span className="text-green-400 text-sm">+${bonusBalance.toFixed(2)} bonus</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold">Challenge: ${challengeAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Score and Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{score}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-bold">{streak}</span>
          </div>
        </div>

        {/* Question */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">{currentQ.question}</h2>
          </div>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null || showResult || isProcessingChallenge}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAnswer === index
                    ? index === currentQ.correct
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                    : showResult && index === currentQ.correct
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                } ${selectedAnswer !== null || showResult || isProcessingChallenge ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="text-white font-medium">{option}</span>
                {showResult && index === currentQ.correct && (
                  <span className="text-green-400 ml-2">✓ Correct</span>
                )}
                {showResult && selectedAnswer === index && index !== currentQ.correct && (
                  <span className="text-red-400 ml-2">✗ Wrong</span>
                )}
              </button>
            ))}
          </div>

          {/* Challenge Result */}
          {challengeResult && (
            <div className={`mt-4 p-4 rounded-lg border ${
              challengeResult.result === 'won'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${
                    challengeResult.result === 'won' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {challengeResult.message}
                  </p>
                  <p className="text-gray-300 text-sm">
                    Challenge: ${challengeResult.challengeAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  {challengeResult.result === 'won' && (
                    <p className="text-green-400 font-bold">
                      +${challengeResult.winAmount.toFixed(2)}
                    </p>
                  )}
                  {challengeResult.result === 'lost' && (
                    <p className="text-red-400 font-bold">
                      -${challengeResult.lossAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isProcessingChallenge && (
            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-center space-x-3">
                <LoadingSpinner size="small" color="blue" />
                <span className="text-blue-400">Processing challenge...</span>
              </div>
            </div>
          )}

          {/* Explanation */}
          {showResult && (
            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-blue-300 text-sm">
                <strong>Explanation:</strong> {currentQ.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Quiz