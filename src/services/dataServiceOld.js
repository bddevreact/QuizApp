// Data Service for managing dynamic app data with real game mechanics

class DataService {
  constructor() {
    this.initializeData()
  }

  // User data with enhanced financial tracking
  userData = {
    telegramFullName: "Crypto Master",
    telegramUsername: "cryptomaster",
    totalEarned: 1250.00,
    totalDeposited: 500.00,
    totalWithdrawn: 200.00,
    availableBalance: 1050.00,
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
    joinDate: "2024-01-15",
    lastActivity: new Date().toISOString(),
    isVerified: true,
    withdrawalEnabled: true,
    depositHistory: [],
    withdrawalHistory: [],
    referralCode: "CRYPTO123", // Added for referral system
    invitedFriends: 0, // Added for referral system
    maxInvites: 10, // Added for referral system
    referralRewards: [ // Added for referral system
      { tier: "Bronze", friends: 5, reward: 10, unlocked: false },
      { tier: "Silver", friends: 10, reward: 25, unlocked: false },
      { tier: "Gold", friends: 20, reward: 50, unlocked: false }
    ]
  }

  // Multiple users for admin panel
  users = [
    {
      id: 1,
      telegramFullName: "Crypto Master",
      telegramUsername: "cryptomaster",
      totalEarned: 1250.00,
      totalDeposited: 500.00,
      totalWithdrawn: 200.00,
      availableBalance: 1050.00,
      level: 4,
      xp: 350,
      rank: "Gold",
      streak: 7,
      questionsAnswered: 156,
      correctAnswers: 120,
      averageScore: 78,
      joinDate: "2024-01-15",
      lastActivity: new Date().toISOString(),
      isVerified: true,
      withdrawalEnabled: true,
      status: "active"
    },
    {
      id: 2,
      telegramFullName: "Bitcoin Trader",
      telegramUsername: "btctrader",
      totalEarned: 890.50,
      totalDeposited: 300.00,
      totalWithdrawn: 150.00,
      availableBalance: 440.50,
      level: 3,
      xp: 280,
      rank: "Silver",
      streak: 5,
      questionsAnswered: 98,
      correctAnswers: 75,
      averageScore: 76,
      joinDate: "2024-01-20",
      lastActivity: new Date(Date.now() - 3600000).toISOString(),
      isVerified: true,
      withdrawalEnabled: true,
      status: "active"
    },
    {
      id: 3,
      telegramFullName: "Ethereum Fan",
      telegramUsername: "ethfan",
      totalEarned: 650.25,
      totalDeposited: 200.00,
      totalWithdrawn: 100.00,
      availableBalance: 350.25,
      level: 2,
      xp: 180,
      rank: "Bronze",
      streak: 3,
      questionsAnswered: 67,
      correctAnswers: 52,
      averageScore: 77,
      joinDate: "2024-01-25",
      lastActivity: new Date(Date.now() - 7200000).toISOString(),
      isVerified: false,
      withdrawalEnabled: false,
      status: "active"
    },
    {
      id: 4,
      telegramFullName: "Crypto Newbie",
      telegramUsername: "cryptonewbie",
      totalEarned: 125.75,
      totalDeposited: 50.00,
      totalWithdrawn: 0.00,
      availableBalance: 175.75,
      level: 1,
      xp: 75,
      rank: "Bronze",
      streak: 1,
      questionsAnswered: 23,
      correctAnswers: 18,
      averageScore: 78,
      joinDate: "2024-01-30",
      lastActivity: new Date(Date.now() - 86400000).toISOString(),
      isVerified: false,
      withdrawalEnabled: false,
      status: "inactive"
    }
  ]

  // Enhanced transaction system
  transactions = [
    {
      id: 1,
      type: "deposit",
      amount: 100.00,
      status: "completed",
      txHash: "0x1234567890abcdef",
      timestamp: "2024-01-15T10:30:00Z",
      network: "TRC20",
      fee: 1.00
    },
    {
      id: 2,
      type: "withdrawal",
      amount: 50.00,
      status: "completed",
      txHash: "0xabcdef1234567890",
      timestamp: "2024-01-20T14:45:00Z",
      network: "TRC20",
      fee: 1.00
    },
    {
      id: 3,
      type: "quiz_reward",
      amount: 25.00,
      status: "completed",
      txHash: "Quiz_001",
      timestamp: "2024-01-22T09:15:00Z"
    },
    {
      id: 4,
      type: "tournament_win",
      amount: 95.00,
      status: "completed",
      txHash: "Tournament_001",
      timestamp: "2024-01-23T16:20:00Z"
    },
    {
      id: 5,
      type: "referral_bonus",
      amount: 15.00,
      status: "completed",
      txHash: "Referral_001",
      timestamp: "2024-01-24T11:30:00Z"
    },
    {
      id: 6,
      type: "withdrawal",
      amount: 75.00,
      status: "pending",
      txHash: "0x9876543210fedcba",
      timestamp: "2024-01-25T08:20:00Z",
      network: "TRC20",
      fee: 1.00,
      userId: 2
    },
    {
      id: 7,
      type: "deposit",
      amount: 200.00,
      status: "pending",
      txHash: "0xabcdef9876543210",
      timestamp: "2024-01-25T12:15:00Z",
      network: "ERC20",
      fee: 0.00,
      userId: 3
    }
  ]

  // Production settings
  settings = {
    minDeposit: 10.00,
    maxDeposit: 10000.00,
    minWithdrawal: 20.00,
    maxWithdrawal: 5000.00,
    dailyWithdrawalLimit: 1000.00,
    monthlyWithdrawalLimit: 5000.00,
    withdrawalFee: 1.00,
    depositFee: 0.00,
    processingTime: {
      deposit: "Instant",
      withdrawal: "2-24 hours"
    },
    supportedNetworks: ["TRC20", "ERC20", "BEP20"],
    kycRequired: false,
    maxDailyDeposits: 5,
    maxDailyWithdrawals: 3
  }

  // Enhanced validation methods
  validateDeposit(amount, network) {
    const errors = []
    
    // Amount validation
    if (!amount || isNaN(amount) || amount <= 0) {
      errors.push("Invalid deposit amount")
    }
    
    if (amount < this.settings.minDeposit) {
      errors.push(`Minimum deposit is ${this.settings.minDeposit} USDT`)
    }
    
    if (amount > this.settings.maxDeposit) {
      errors.push(`Maximum deposit is ${this.settings.maxDeposit} USDT`)
    }
    
    // Network validation
    if (!this.settings.supportedNetworks.includes(network)) {
      errors.push("Unsupported network")
    }
    
    // Daily limit check
    const todayDeposits = this.getTodayDeposits()
    if (todayDeposits.length >= this.settings.maxDailyDeposits) {
      errors.push("Daily deposit limit reached")
    }
    
    // KYC check if required
    if (this.settings.kycRequired && !this.userData.isVerified) {
      errors.push("KYC verification required for deposits")
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  validateWithdrawal(amount, network) {
    const errors = []
    
    // Amount validation
    if (!amount || isNaN(amount) || amount <= 0) {
      errors.push("Invalid withdrawal amount")
    }
    
    if (amount < this.settings.minWithdrawal) {
      errors.push(`Minimum withdrawal is ${this.settings.minWithdrawal} USDT`)
    }
    
    if (amount > this.settings.maxWithdrawal) {
      errors.push(`Maximum withdrawal is ${this.settings.maxWithdrawal} USDT`)
    }
    
    // Balance validation
    if (amount > this.userData.availableBalance) {
      errors.push("Insufficient available balance")
    }
    
    // Deposit requirement check
    if (amount > this.userData.totalDeposited) {
      errors.push("Withdrawal amount cannot exceed total deposits")
    }
    
    // Network validation
    if (!this.settings.supportedNetworks.includes(network)) {
      errors.push("Unsupported network")
    }
    
    // Daily limit check
    const todayWithdrawals = this.getTodayWithdrawals()
    const todayTotal = todayWithdrawals.reduce((sum, w) => sum + w.amount, 0)
    if (todayTotal + amount > this.settings.dailyWithdrawalLimit) {
      errors.push("Daily withdrawal limit exceeded")
    }
    
    if (todayWithdrawals.length >= this.settings.maxDailyWithdrawals) {
      errors.push("Daily withdrawal count limit reached")
    }
    
    // Monthly limit check
    const thisMonthWithdrawals = this.getThisMonthWithdrawals()
    const monthTotal = thisMonthWithdrawals.reduce((sum, w) => sum + w.amount, 0)
    if (monthTotal + amount > this.settings.monthlyWithdrawalLimit) {
      errors.push("Monthly withdrawal limit exceeded")
    }
    
    // Withdrawal enabled check
    if (!this.userData.withdrawalEnabled) {
      errors.push("Withdrawals are temporarily disabled")
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Transaction processing methods
  async processDeposit(amount, network, walletAddress) {
    const validation = this.validateDeposit(amount, network)
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "))
    }
    
    // Generate transaction hash
    const txHash = this.generateTransactionHash("deposit")
    
    // Create pending transaction
    const transaction = {
      id: this.transactions.length + 1,
      type: "deposit",
      amount: parseFloat(amount),
      status: "pending",
      txHash,
      timestamp: new Date().toISOString(),
      network,
      walletAddress,
      fee: this.settings.depositFee
    }
    
    // Add to transactions
    this.transactions.unshift(transaction)
    
    // Simulate processing delay
    await this.simulateProcessingDelay(2000)
    
    // Update transaction status
    transaction.status = "completed"
    
    // Update user balance
    this.userData.totalDeposited += parseFloat(amount)
    this.userData.availableBalance += parseFloat(amount)
    this.userData.totalEarned += parseFloat(amount)
    
    // Add to deposit history
    this.userData.depositHistory.push({
      id: transaction.id,
      amount: parseFloat(amount),
      network,
      txHash,
      timestamp: transaction.timestamp,
      status: "completed"
    })
    
    // Save to storage
    this.saveToStorage('userData', this.userData)
    this.saveToStorage('transactions', this.transactions)
    
    // Add activity
    this.addActivity({
      type: "deposit_completed",
      title: "Deposit Successful",
      description: `${amount} USDT deposited via ${network}`,
      time: "Just now",
      icon: "💰"
    })
    
    return transaction
  }

  async processWithdrawal(amount, network, walletAddress) {
    const validation = this.validateWithdrawal(amount, network)
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "))
    }
    
    // Generate transaction hash
    const txHash = this.generateTransactionHash("withdrawal")
    
    // Calculate fee
    const fee = this.settings.withdrawalFee
    const netAmount = parseFloat(amount) - fee
    
    // Create pending transaction
    const transaction = {
      id: this.transactions.length + 1,
      type: "withdrawal",
      amount: parseFloat(amount),
      netAmount,
      status: "pending",
      txHash,
      timestamp: new Date().toISOString(),
      network,
      walletAddress,
      fee
    }
    
    // Add to transactions
    this.transactions.unshift(transaction)
    
    // Deduct from balance immediately
    this.userData.availableBalance -= parseFloat(amount)
    this.userData.totalWithdrawn += parseFloat(amount)
    
    // Add to withdrawal history
    this.userData.withdrawalHistory.push({
      id: transaction.id,
      amount: parseFloat(amount),
      network,
      txHash,
      timestamp: transaction.timestamp,
      status: "pending"
    })
    
    // Save to storage
    this.saveToStorage('userData', this.userData)
    this.saveToStorage('transactions', this.transactions)
    
    // Add activity
    this.addActivity({
      type: "withdrawal_requested",
      title: "Withdrawal Requested",
      description: `${amount} USDT withdrawal via ${network}`,
      time: "Just now",
      icon: "💸"
    })
    
    return transaction
  }

  // Helper methods for validation
  getTodayDeposits() {
    const today = new Date().toDateString()
    return this.transactions.filter(t => 
      t.type === "deposit" && 
      new Date(t.timestamp).toDateString() === today
    )
  }

  getTodayWithdrawals() {
    const today = new Date().toDateString()
    return this.transactions.filter(t => 
      t.type === "withdrawal" && 
      new Date(t.timestamp).toDateString() === today
    )
  }

  getThisMonthWithdrawals() {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    return this.transactions.filter(t => 
      t.type === "withdrawal" && 
      new Date(t.timestamp).getMonth() === thisMonth &&
      new Date(t.timestamp).getFullYear() === thisYear
    )
  }

  generateTransactionHash(type) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `0x${type}_${timestamp}_${random}`
  }

  async simulateProcessingDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Quiz Questions Data
  questions = {
    easy: [
      {
        question: "What is Bitcoin?",
        options: ["A digital currency", "A physical coin", "A bank account", "A credit card"],
        correct: 0,
        category: "Basics",
        explanation: "Bitcoin is a decentralized digital currency that operates on blockchain technology."
      },
      {
        question: "What does 'HODL' mean in crypto?",
        options: ["Hold On for Dear Life", "High Order Digital Logic", "Hold", "High Output Digital Ledger"],
        correct: 2,
        category: "Slang",
        explanation: "HODL is a misspelling of 'hold' that became popular in the crypto community."
      },
      {
        question: "What is a blockchain?",
        options: ["A type of cryptocurrency", "A digital ledger", "A bank", "A trading platform"],
        correct: 1,
        category: "Technology",
        explanation: "A blockchain is a distributed digital ledger that records transactions across multiple computers."
      },
      {
        question: "What is the maximum supply of Bitcoin?",
        options: ["21 million", "100 million", "1 billion", "Unlimited"],
        correct: 0,
        category: "Economics",
        explanation: "Bitcoin has a maximum supply of 21 million coins, making it deflationary."
      },
      {
        question: "What is a private key?",
        options: ["A password", "A secret number to access crypto", "A public address", "A wallet name"],
        correct: 1,
        category: "Security",
        explanation: "A private key is a secret number that allows you to access and control your cryptocurrency."
      }
    ],
    medium: [
      {
        question: "What is a smart contract?",
        options: ["A legal document", "Self-executing code on blockchain", "A type of cryptocurrency", "A trading agreement"],
        correct: 1,
        category: "Technology",
        explanation: "Smart contracts are self-executing contracts with terms written in code on the blockchain."
      },
      {
        question: "What is DeFi?",
        options: ["Decentralized Finance", "Digital Finance", "Direct Finance", "Distributed Finance"],
        correct: 0,
        category: "Finance",
        explanation: "DeFi stands for Decentralized Finance, which provides financial services without intermediaries."
      },
      {
        question: "What is a 'whale' in crypto?",
        options: ["A large investor", "A type of cryptocurrency", "A trading strategy", "A blockchain"],
        correct: 0,
        category: "Trading",
        explanation: "A whale is someone who holds a large amount of cryptocurrency and can influence market prices."
      },
      {
        question: "What is staking?",
        options: ["Trading crypto", "Lending crypto to earn rewards", "Mining crypto", "Buying crypto"],
        correct: 1,
        category: "Earning",
        explanation: "Staking involves lending your cryptocurrency to a network to earn rewards and help secure the network."
      },
      {
        question: "What is a 'fork' in blockchain?",
        options: ["A split in the blockchain", "A type of cryptocurrency", "A trading tool", "A wallet feature"],
        correct: 0,
        category: "Technology",
        explanation: "A fork occurs when a blockchain splits into two separate chains, often due to protocol changes."
      }
    ],
    hard: [
      {
        question: "What is the Byzantine Generals Problem?",
        options: ["A military strategy", "A consensus problem in distributed systems", "A trading algorithm", "A security protocol"],
        correct: 1,
        category: "Advanced",
        explanation: "The Byzantine Generals Problem is a fundamental problem in distributed systems about reaching consensus."
      },
      {
        question: "What is a Merkle Tree?",
        options: ["A type of cryptocurrency", "A data structure for efficient verification", "A trading strategy", "A wallet type"],
        correct: 1,
        category: "Advanced",
        explanation: "A Merkle Tree is a data structure that allows efficient verification of large data sets in blockchain."
      },
      {
        question: "What is the difference between PoW and PoS?",
        options: ["Proof of Work vs Proof of Stake", "Price of Work vs Price of Stake", "Power of Work vs Power of Stake", "Proof of Wealth vs Proof of Stake"],
        correct: 0,
        category: "Advanced",
        explanation: "PoW requires computational work while PoS requires staking cryptocurrency to validate transactions."
      },
      {
        question: "What is a '51% attack'?",
        options: ["A trading strategy", "When one entity controls 51% of network hash rate", "A type of cryptocurrency", "A security feature"],
        correct: 1,
        category: "Security",
        explanation: "A 51% attack occurs when one entity controls more than half of the network's mining power."
      },
      {
        question: "What is a 'halving' in Bitcoin?",
        options: ["Price reduction", "Block reward reduction", "Transaction fee reduction", "Network speed reduction"],
        correct: 1,
        category: "Economics",
        explanation: "Bitcoin halving reduces the block reward by 50% every 210,000 blocks."
      }
    ]
  }

  getQuestions() {
    return this.questions
  }

  // Tournaments Data
  tournaments = {
    active: [
      {
        id: 1,
        name: "Crypto Masters Championship",
        description: "Weekly championship for top players",
        entryFee: 10,
        prizePool: 500,
        participants: 25,
        maxParticipants: 50,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 172800000).toISOString(),
        status: "active",
        category: "weekly",
        difficulty: "hard"
      },
      {
        id: 2,
        name: "Beginner's Luck",
        description: "New player friendly tournament",
        entryFee: 5,
        prizePool: 200,
        participants: 15,
        maxParticipants: 30,
        startTime: new Date(Date.now() + 43200000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        status: "active",
        category: "daily",
        difficulty: "easy"
      }
    ],
    completed: [
      {
        id: 3,
        name: "Weekend Warriors",
        description: "Weekend special tournament",
        entryFee: 15,
        prizePool: 750,
        participants: 40,
        maxParticipants: 40,
        startTime: new Date(Date.now() - 172800000).toISOString(),
        endTime: new Date(Date.now() - 86400000).toISOString(),
        status: "completed",
        category: "weekly",
        difficulty: "medium",
        winner: "cryptomaster",
        totalPrize: 750
      }
    ],
    upcoming: [
      {
        id: 4,
        name: "Mega Crypto Challenge",
        description: "Monthly mega tournament",
        entryFee: 25,
        prizePool: 2000,
        participants: 0,
        maxParticipants: 100,
        startTime: new Date(Date.now() + 604800000).toISOString(),
        endTime: new Date(Date.now() + 691200000).toISOString(),
        status: "upcoming",
        category: "monthly",
        difficulty: "expert"
      }
    ]
  }

  getTournaments() {
    return this.tournaments
  }

  // Get all users for admin panel
  getAllUsers() {
    return this.users
  }

  // Get pending transactions for admin approval
  getPendingTransactions() {
    return this.transactions.filter(tx => tx.status === 'pending')
  }

  // Get transactions by user ID
  getTransactionsByUser(userId) {
    return this.transactions.filter(tx => tx.userId === userId)
  }

  // Approve transaction
  approveTransaction(txId) {
    const transaction = this.transactions.find(tx => tx.id === txId)
    if (transaction) {
      transaction.status = 'completed'
      this.saveToStorage('transactions', this.transactions)
      return true
    }
    return false
  }

  // Reject transaction
  rejectTransaction(txId, reason) {
    const transaction = this.transactions.find(tx => tx.id === txId)
    if (transaction) {
      transaction.status = 'failed'
      transaction.rejectionReason = reason
      this.saveToStorage('transactions', this.transactions)
      return true
    }
    return false
  }

  // Get user by ID
  getUserById(id) {
    return this.users.find(user => user.id === id)
  }

  // Update user status
  updateUserStatus(userId, status) {
    const user = this.users.find(u => u.id === userId)
    if (user) {
      user.status = status
      this.saveToStorage('users', this.users)
    }
  }

  // Toggle user verification
  toggleUserVerification(userId) {
    const user = this.users.find(u => u.id === userId)
    if (user) {
      user.isVerified = !user.isVerified
      this.saveToStorage('users', this.users)
    }
  }

  // Tasks Data with real rewards
  tasks = {
    daily: [
      {
        id: 1,
        title: "Daily Bonus Question",
        description: "Answer today's special question for 3x rewards",
        reward: 15,
        difficulty: "medium",
        timeLeft: "23:45",
        status: "available",
        type: "bonus",
        completedToday: false
      },
      {
        id: 2,
        title: "Complete 5 Quizzes",
        description: "Finish 5 quiz sessions today",
        reward: 5,
        progress: 0,
        target: 5,
        status: "in_progress",
        type: "daily"
      },
      {
        id: 3,
        title: "Maintain 7-Day Streak",
        description: "Keep your daily quiz streak for 7 days",
        reward: 10,
        progress: 0,
        target: 7,
        status: "in_progress",
        type: "daily"
      },
      {
        id: 4,
        title: "Win 3 Tournaments",
        description: "Win 3 tournament battles today",
        reward: 25,
        progress: 0,
        target: 3,
        status: "in_progress",
        type: "daily"
      },
      {
        id: 5,
        title: "Answer 50 Questions",
        description: "Answer 50 questions correctly today",
        reward: 8,
        progress: 0,
        target: 50,
        status: "in_progress",
        type: "daily"
      }
    ],
    marketing: [
      {
        id: 6,
        title: "Share Telegram Story",
        description: "Share our app on your Telegram story",
        reward: 2,
        difficulty: "easy",
        status: "available",
        type: "social",
        action: "share"
      },
      {
        id: 7,
        title: "Invite a Friend",
        description: "Invite a friend to join the app",
        reward: 5,
        difficulty: "medium",
        status: "available",
        type: "referral",
        action: "invite"
      },
      {
        id: 8,
        title: "Like & Share Tweet",
        description: "Like and retweet our latest crypto quiz tweet",
        reward: 1,
        difficulty: "easy",
        status: "available",
        type: "social",
        action: "social"
      },
      {
        id: 9,
        title: "Subscribe to Channel",
        description: "Subscribe to our official Telegram channel",
        reward: 3,
        difficulty: "easy",
        status: "available",
        type: "social",
        action: "subscribe"
      },
      {
        id: 10,
        title: "Post Crypto Meme",
        description: "Share a crypto meme on your social media",
        reward: 2,
        difficulty: "medium",
        status: "available",
        type: "social",
        action: "meme"
      },
      {
        id: 11,
        title: "Join Discord Server",
        description: "Join our Discord community",
        reward: 4,
        difficulty: "medium",
        status: "available",
        type: "social",
        action: "discord"
      }
    ],
    partner: [
      {
        id: 12,
        title: "Watch Partner Video",
        description: "Watch a 30-second partner video",
        reward: 1,
        difficulty: "easy",
        status: "available",
        type: "partner",
        action: "video"
      },
      {
        id: 13,
        title: "Download Partner App",
        description: "Download and try our partner's app",
        reward: 5,
        difficulty: "hard",
        status: "available",
        type: "partner",
        action: "download"
      },
      {
        id: 14,
        title: "Complete Survey",
        description: "Complete a quick survey about crypto",
        reward: 3,
        difficulty: "medium",
        status: "available",
        type: "partner",
        action: "survey"
      }
    ]
  }

  getTasks() {
    return this.tasks
  }

  // Transaction History
  getTransactions() {
    return this.transactions
  }

  // Achievements Data
  achievements = [
    {
      id: 1,
      title: "First Quiz",
      description: "Complete your first quiz",
      icon: "🎯",
      unlocked: false,
      date: null,
      rarity: "common",
      requirement: { type: "quizzes_completed", value: 1 }
    },
    {
      id: 2,
      title: "Streak Master",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      unlocked: false,
      date: null,
      rarity: "rare",
      requirement: { type: "streak", value: 7 }
    },
    {
      id: 3,
      title: "Tournament Champion",
      description: "Win your first tournament",
      icon: "🏆",
      unlocked: false,
      date: null,
      rarity: "epic",
      requirement: { type: "tournaments_won", value: 1 }
    },
    {
      id: 4,
        title: "Level 10",
        description: "Reach level 10",
        icon: "⭐",
        unlocked: false,
        date: null,
        rarity: "legendary",
        requirement: { type: "level", value: 10 }
      },
      {
        id: 5,
        title: "Quiz Master",
        description: "Answer 100 questions correctly",
        icon: "🧠",
        unlocked: false,
        date: null,
        rarity: "rare",
        requirement: { type: "correct_answers", value: 100 }
      },
      {
        id: 6,
        title: "Perfect Score",
        description: "Get 100% on a quiz",
        icon: "💯",
        unlocked: false,
        date: null,
        rarity: "epic",
        requirement: { type: "perfect_score", value: 1 }
      },
      {
        id: 7,
        title: "Referral King",
        description: "Invite 10 friends",
        icon: "👑",
        unlocked: false,
        date: null,
        rarity: "legendary",
        requirement: { type: "referrals", value: 10 }
      }
    ]

  getAchievements() {
    return this.achievements
  }

  // Leaderboard Data
  leaderboard = [
    { rank: 1, username: "CryptoKing", earnings: 1250.50, tasks: 89 },
    { rank: 2, username: "QuizMaster", earnings: 987.30, tasks: 76 },
    { rank: 3, username: "BitcoinBoss", earnings: 756.80, tasks: 65 },
    { rank: 4, username: "EthereumElite", earnings: 654.20, tasks: 58 },
    { rank: 5, username: "AltcoinAce", earnings: 543.90, tasks: 52 }
  ]

  getLeaderboard() {
    return this.leaderboard
  }

  // Recent Activity Data
  recentActivity = []

  getRecentActivity() {
    return this.recentActivity
  }

  // Goals Data
  goals = [
    {
      id: 1,
      title: "Weekly Quiz Goal",
      target: 100,
      current: 0,
      unit: "questions",
      icon: "Target",
      color: "blue"
    },
    {
      id: 2,
      title: "Monthly Earnings",
      target: 350,
      current: 0,
      unit: "USDT",
      icon: "DollarSign",
      color: "green"
    },
    {
      id: 3,
      title: "Tournament Wins",
      target: 25,
      current: 0,
      unit: "wins",
      icon: "Trophy",
      color: "yellow"
    }
  ]

  getGoals() {
    return this.goals
  }

  // Game Mechanics Methods

  // Complete a quiz and update stats
  completeQuiz(score, totalQuestions, category) {
    const correctAnswers = Math.round((score / 100) * totalQuestions)
    const xpGained = correctAnswers * 10
    const usdtEarned = correctAnswers * 0.5

    // Update user stats
    this.updateUserData({
      xp: this.userData.xp + xpGained,
      totalEarned: this.userData.totalEarned + usdtEarned,
      questionsAnswered: this.userData.questionsAnswered + totalQuestions,
      correctAnswers: this.userData.correctAnswers + correctAnswers,
      dailyQuizzesCompleted: this.userData.dailyQuizzesCompleted + 1,
      lastActivity: new Date().toISOString()
    })

    // Check for level up
    this.checkLevelUp()

    // Update daily tasks
    this.updateDailyTasks(correctAnswers, totalQuestions)

    // Check achievements
    this.checkAchievements()

    // Add transaction
    this.addTransaction({
      type: "quiz_reward",
      amount: usdtEarned,
      status: "completed",
      txHash: `Quiz_${Date.now()}`,
      timestamp: new Date().toISOString()
    })

    // Add activity
    this.addActivity({
      type: "quiz_completed",
      title: "Quiz Completed",
      description: `Scored ${score}% on ${category} quiz`,
      time: "Just now",
      icon: "🎯"
    })

    return {
      xpGained,
      usdtEarned,
      correctAnswers,
      newLevel: this.userData.level
    }
  }

  // Update daily tasks based on quiz completion
  updateDailyTasks(correctAnswers, totalQuestions) {
    // Update quiz completion task
    const quizTask = this.tasks.daily.find(t => t.id === 2)
    if (quizTask) {
      quizTask.progress = Math.min(quizTask.progress + 1, quizTask.target)
      if (quizTask.progress >= quizTask.target) {
        this.completeTaskReward(quizTask.id, quizTask.reward)
      }
    }

    // Update question answering task
    const questionTask = this.tasks.daily.find(t => t.id === 5)
    if (questionTask) {
      questionTask.progress = Math.min(questionTask.progress + correctAnswers, questionTask.target)
      if (questionTask.progress >= questionTask.target) {
        this.completeTaskReward(questionTask.id, questionTask.reward)
      }
    }

    this.saveToStorage('tasks', this.tasks)
  }

  // Complete task and give reward
  completeTaskReward(taskId, reward) {
    this.updateUserData({
      totalEarned: this.userData.totalEarned + reward
    })

    this.addTransaction({
      type: "task_reward",
      amount: reward,
      status: "completed",
      txHash: `Task_${taskId}`,
      timestamp: new Date().toISOString()
    })

    this.addActivity({
      type: "task_completed",
      title: "Task Completed",
      description: `Earned ${reward} USDT for completing task`,
      time: "Just now",
      icon: "✅"
    })
  }

  // Check and update user level
  checkLevelUp() {
    const currentLevel = this.userData.level
    const newLevel = Math.floor(this.userData.xp / 100) + 1

    if (newLevel > currentLevel) {
      this.updateUserData({ level: newLevel })
      
      // Add level up bonus
      const levelBonus = newLevel * 5
      this.updateUserData({
        totalEarned: this.userData.totalEarned + levelBonus
      })

      this.addTransaction({
        type: "level_bonus",
        amount: levelBonus,
        status: "completed",
        txHash: `Level_${newLevel}`,
        timestamp: new Date().toISOString()
      })

      this.addActivity({
        type: "level_up",
        title: "Level Up!",
        description: `Reached level ${newLevel} and earned ${levelBonus} USDT bonus!`,
        time: "Just now",
        icon: "⭐"
      })
    }
  }

  // Check and unlock achievements
  checkAchievements() {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let shouldUnlock = false

        switch (achievement.requirement.type) {
          case "quizzes_completed":
            shouldUnlock = this.userData.dailyQuizzesCompleted >= achievement.requirement.value
            break
          case "streak":
            shouldUnlock = this.userData.streak >= achievement.requirement.value
            break
          case "tournaments_won":
            shouldUnlock = this.userData.tournamentsWon >= achievement.requirement.value
            break
          case "level":
            shouldUnlock = this.userData.level >= achievement.requirement.value
            break
          case "correct_answers":
            shouldUnlock = this.userData.correctAnswers >= achievement.requirement.value
            break
          case "perfect_score":
            // This would need to be tracked separately
            break
          case "referrals":
            // This would need to be tracked separately
            break
        }

        if (shouldUnlock) {
          this.unlockAchievement(achievement.id)
        }
      }
    })
  }

  // Unlock achievement
  unlockAchievement(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.date = new Date().toISOString()

      // Give achievement reward
      const reward = this.getAchievementReward(achievement.rarity)
      this.updateUserData({
        totalEarned: this.userData.totalEarned + reward
      })

      this.addTransaction({
        type: "achievement_reward",
        amount: reward,
        status: "completed",
        txHash: `Achievement_${achievementId}`,
        timestamp: new Date().toISOString()
      })

      this.addActivity({
        type: "achievement_unlocked",
        title: "Achievement Unlocked!",
        description: `Unlocked "${achievement.title}" and earned ${reward} USDT!`,
        time: "Just now",
        icon: achievement.icon
      })

      this.saveToStorage('achievements', this.achievements)
    }
  }

  // Get achievement reward based on rarity
  getAchievementReward(rarity) {
    switch (rarity) {
      case "common": return 5
      case "rare": return 15
      case "epic": return 50
      case "legendary": return 100
      default: return 5
    }
  }

  // Update user data
  updateUserData(newData) {
    this.userData = { ...this.userData, ...newData }
    this.saveToStorage('userData', this.userData)
  }

  // Complete task
  completeTask(taskId) {
    const task = this.tasks.daily.find(t => t.id === taskId) ||
                 this.tasks.marketing.find(t => t.id === taskId) ||
                 this.tasks.partner.find(t => t.id === taskId)

    if (task && task.status !== 'completed') {
      task.status = 'completed'
      this.completeTaskReward(taskId, task.reward)
      this.saveToStorage('tasks', this.tasks)
    }
  }

  // Add transaction
  addTransaction(transaction) {
    transaction.id = this.transactions.length + 1
    this.transactions.unshift(transaction)
    this.saveToStorage('transactions', this.transactions)
  }

  // Add activity
  addActivity(activity) {
    activity.id = this.recentActivity.length + 1
    this.recentActivity.unshift(activity)
    
    // Keep only last 50 activities
    if (this.recentActivity.length > 50) {
      this.recentActivity = this.recentActivity.slice(0, 50)
    }
    
    this.saveToStorage('recentActivity', this.recentActivity)
  }

  // Update achievement
  updateAchievement(achievementId, updates) {
    const achievement = this.achievements.find(a => a.id === achievementId)
    if (achievement) {
      Object.assign(achievement, updates)
      this.saveToStorage('achievements', this.achievements)
    }
  }

  // Get wallet addresses for different networks
  getWalletAddresses() {
    return {
      TRC20: "TQn9Y2khDD95J42FQtQTdwVVRqjqH3HKoj",
      ERC20: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      BEP20: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    }
  }

  // Get transaction limits
  getTransactionLimits() {
    return this.settings
  }

  // Simple deposit method for testing
  simpleDeposit(amount) {
    if (amount < 10) {
      throw new Error('Minimum deposit is 10 USDT')
    }

    this.updateUserData({
      totalDeposited: this.userData.totalDeposited + amount,
      totalEarned: this.userData.totalEarned + amount
    })

    this.addTransaction({
      type: "deposit",
      amount: amount,
      status: "completed",
      txHash: `0x${Math.random().toString(36).substr(2, 8)}`
    })

    return true
  }

  // Withdrawal validation and processing
  processWithdrawal(amount) {
    if (amount > this.userData.totalEarned) {
      throw new Error('Insufficient balance')
    }

    if (amount > this.userData.totalDeposited) {
      throw new Error('You must deposit at least the withdrawal amount first')
    }

    this.updateUserData({
      totalWithdrawn: this.userData.totalWithdrawn + amount,
      totalEarned: this.userData.totalEarned - amount
    })

    this.addTransaction({
      type: "withdrawal",
      amount: amount,
      status: "pending",
      txHash: `0x${Math.random().toString(36).substr(2, 8)}`
    })

    return true
  }

  // Create tournament
  createTournament(stake, maxPlayers = 2) {
    const tournament = {
      id: Date.now(),
      stake: stake,
      maxPlayers: maxPlayers,
      players: [],
      status: 'waiting',
      createdAt: new Date().toISOString(),
      prizePool: stake * maxPlayers * 0.95 // 5% fee
    }

    this.tournaments.active.push(tournament)
    this.saveToStorage('tournaments', this.tournaments)
    
    return tournament
  }

  // Join tournament
  joinTournament(tournamentId) {
    const tournament = this.tournaments.active.find(t => t.id === tournamentId)
    if (tournament && tournament.players.length < tournament.maxPlayers) {
      tournament.players.push({
        userId: this.userData.telegramUsername,
        joinedAt: new Date().toISOString()
      })

      if (tournament.players.length === tournament.maxPlayers) {
        tournament.status = 'ready'
      }

      this.saveToStorage('tournaments', this.tournaments)
      return tournament
    }
    return null
  }

  // Storage methods (for persistence)
  saveToStorage(key, data) {
    try {
      localStorage.setItem(`quizApp_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to storage:', error)
    }
  }

  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(`quizApp_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load from storage:', error)
      return null
    }
  }

  // Initialize data from storage or use defaults
  initializeData() {
    const storedUserData = this.loadFromStorage('userData')
    const storedTasks = this.loadFromStorage('tasks')
    const storedTransactions = this.loadFromStorage('transactions')
    const storedAchievements = this.loadFromStorage('achievements')
    const storedTournaments = this.loadFromStorage('tournaments')

    if (storedUserData) this.userData = storedUserData
    if (storedTasks) this.tasks = storedTasks
    if (storedTransactions) this.transactions = storedTransactions
    if (storedAchievements) this.achievements = storedAchievements
    if (storedTournaments) this.tournaments = storedTournaments

    // Initialize tournaments if not exists
    if (!this.tournaments) {
      this.tournaments = {
        active: [],
        completed: [],
        upcoming: []
      }
    } else {
      // Ensure existing tournaments have proper structure
      if (this.tournaments.active) {
        this.tournaments.active = this.tournaments.active.map(tournament => ({
          ...tournament,
          players: tournament.players || [],
          maxPlayers: tournament.maxPlayers || 2,
          prizePool: tournament.prizePool || (tournament.stake * 2 * 0.95),
          createdAt: tournament.createdAt || new Date().toISOString(),
          status: tournament.status || 'waiting'
        }))
      }
      
      if (this.tournaments.completed) {
        this.tournaments.completed = this.tournaments.completed.map(tournament => ({
          ...tournament,
          players: tournament.players || [],
          maxPlayers: tournament.maxPlayers || 2,
          completedAt: tournament.completedAt || new Date().toISOString(),
          winner: tournament.winner || 'Unknown',
          stake: tournament.stake || 0
        }))
      }
      
      if (this.tournaments.upcoming) {
        this.tournaments.upcoming = this.tournaments.upcoming.map(tournament => ({
          ...tournament,
          players: tournament.players || [],
          maxPlayers: tournament.maxPlayers || 2,
          startTime: tournament.startTime || new Date().toISOString(),
          endTime: tournament.endTime || new Date().toISOString(),
          status: tournament.status || 'upcoming'
        }))
      }
    }

    // Initialize tasks if not exists
    if (!this.tasks) {
      this.tasks = this.getTasks()
    }

    // Initialize achievements if not exists
    if (!this.achievements) {
      this.achievements = this.getAchievements()
    }

    // Initialize questions if not exists
    if (!this.questions) {
      this.questions = this.getQuestions()
    }

    // Initialize recentActivity if not exists
    if (!this.recentActivity) {
      this.recentActivity = this.getRecentActivity()
    }

    // Initialize goals if not exists
    if (!this.goals) {
      this.goals = this.getGoals()
    }

    // Initialize leaderboard if not exists
    if (!this.leaderboard) {
      this.leaderboard = this.getLeaderboard()
    }

    // Reset daily tasks if it's a new day
    this.resetDailyTasks()
  }

  // Reset daily tasks at midnight
  resetDailyTasks() {
    const today = new Date().toDateString()
    const lastReset = this.loadFromStorage('lastDailyReset')
    
    if (lastReset !== today) {
      this.tasks.daily.forEach(task => {
        if (task.id !== 1) { // Keep bonus question as is
          task.status = 'in_progress'
          task.progress = 0
        }
      })
      
      this.updateUserData({ dailyQuizzesCompleted: 0 })
      this.saveToStorage('tasks', this.tasks)
      this.saveToStorage('lastDailyReset', today)
    }
  }

  // Get random questions for quiz (includes AI-generated questions)
  getQuizQuestions(difficulty = 'easy', count = 10) {
    // Get both predefined and AI-generated questions
    const predefinedQuestions = this.questions[difficulty] || this.questions.easy
    const aiQuestions = this.getAIQuestions(difficulty)
    
    // Combine and shuffle all questions
    const allQuestions = [...predefinedQuestions, ...aiQuestions]
    const shuffled = allQuestions.sort(() => 0.5 - Math.random())
    
    return shuffled.slice(0, count)
  }

  // Get AI-generated questions for a specific difficulty
  getAIQuestions(difficulty = 'easy') {
    const stored = this.loadFromStorage('aiQuestions')
    if (!stored) return []
    
    return stored.filter(q => q.difficulty === difficulty && q.status === 'active')
  }

  // Add AI-generated question to database
  addQuestion(question) {
    const aiQuestions = this.loadFromStorage('aiQuestions') || []
    
    // Ensure question has required fields
    const newQuestion = {
      ...question,
      id: question.id || `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      createdAt: question.createdAt || new Date().toISOString(),
      source: question.source || 'ai'
    }
    
    aiQuestions.push(newQuestion)
    this.saveToStorage('aiQuestions', aiQuestions)
    
    return newQuestion
  }

  // Update AI-generated question
  updateQuestion(questionId, updates) {
    const aiQuestions = this.loadFromStorage('aiQuestions') || []
    const index = aiQuestions.findIndex(q => q.id === questionId)
    
    if (index !== -1) {
      aiQuestions[index] = { ...aiQuestions[index], ...updates }
      this.saveToStorage('aiQuestions', aiQuestions)
      return aiQuestions[index]
    }
    
    return null
  }

  // Delete AI-generated question
  deleteQuestion(questionId) {
    const aiQuestions = this.loadFromStorage('aiQuestions') || []
    const filtered = aiQuestions.filter(q => q.id !== questionId)
    this.saveToStorage('aiQuestions', filtered)
    
    return filtered.length < aiQuestions.length
  }

  // Get all AI questions with filtering
  getAllAIQuestions(filters = {}) {
    let aiQuestions = this.loadFromStorage('aiQuestions') || []
    
    // Apply filters
    if (filters.difficulty) {
      aiQuestions = aiQuestions.filter(q => q.difficulty === filters.difficulty)
    }
    
    if (filters.category) {
      aiQuestions = aiQuestions.filter(q => q.category === filters.category)
    }
    
    if (filters.status) {
      aiQuestions = aiQuestions.filter(q => q.status === filters.status)
    }
    
    if (filters.source) {
      aiQuestions = aiQuestions.filter(q => q.source === filters.source)
    }
    
    return aiQuestions
  }

  // Get question statistics
  getQuestionStats() {
    const aiQuestions = this.loadFromStorage('aiQuestions') || []
    const stats = {
      total: aiQuestions.length,
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
      byCategory: {},
      bySource: { ai: 0, fallback: 0, manual: 0 },
      active: 0,
      inactive: 0
    }
    
    aiQuestions.forEach(q => {
      // Count by difficulty
      if (stats.byDifficulty[q.difficulty] !== undefined) {
        stats.byDifficulty[q.difficulty]++
      }
      
      // Count by category
      stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1
      
      // Count by source
      stats.bySource[q.source] = (stats.bySource[q.source] || 0) + 1
      
      // Count by status
      if (q.status === 'active') stats.active++
      else stats.inactive++
    })
    
    return stats
  }

  // Calculate user rank based on level and earnings
  calculateRank() {
    const { level, totalEarned } = this.userData
    
    if (level >= 20 && totalEarned >= 1000) return "Diamond"
    if (level >= 15 && totalEarned >= 500) return "Platinum"
    if (level >= 10 && totalEarned >= 200) return "Gold"
    if (level >= 5 && totalEarned >= 50) return "Silver"
    return "Bronze"
  }

  // Update user rank
  updateRank() {
    const newRank = this.calculateRank()
    if (newRank !== this.userData.rank) {
      this.updateUserData({ rank: newRank })
    }
  }

  // Get transaction limits with usage tracking
  getTransactionLimits() {
    const today = new Date().toDateString()
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const todayWithdrawals = this.transactions.filter(t => 
      t.type === "withdrawal" && 
      new Date(t.timestamp).toDateString() === today
    )
    
    const thisMonthWithdrawals = this.transactions.filter(t => 
      t.type === "withdrawal" && 
      new Date(t.timestamp).getMonth() === thisMonth &&
      new Date(t.timestamp).getFullYear() === thisYear
    )
    
    const dailyWithdrawalUsed = todayWithdrawals.reduce((sum, t) => sum + t.amount, 0)
    const monthlyWithdrawalUsed = thisMonthWithdrawals.reduce((sum, t) => sum + t.amount, 0)
    
    return {
      ...this.settings,
      dailyWithdrawalUsed,
      monthlyWithdrawalUsed,
      dailyWithdrawalsUsed: todayWithdrawals.length,
      monthlyWithdrawalsUsed: thisMonthWithdrawals.length
    }
  }

  // Get wallet addresses for different networks
  getWalletAddresses() {
    return {
      TRC20: "TQn9Y2khDD95J42FQtQTdwVVRqjqH3HKoj",
      ERC20: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      BEP20: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    }
  }

  // Update daily tasks based on user actions
  updateDailyTasks(correctAnswers, totalQuestions) {
    // Update quiz completion task
    const quizTask = this.tasks.daily.find(t => t.id === 2)
    if (quizTask) {
      quizTask.progress = Math.min(quizTask.progress + 1, quizTask.target)
      if (quizTask.progress >= quizTask.target) {
        this.completeTaskReward(quizTask.id, quizTask.reward)
      }
    }

    // Update question answering task
    const questionTask = this.tasks.daily.find(t => t.id === 5)
    if (questionTask) {
      questionTask.progress = Math.min(questionTask.progress + correctAnswers, questionTask.target)
      if (questionTask.progress >= questionTask.target) {
        this.completeTaskReward(questionTask.id, questionTask.reward)
      }
    }

    // Update streak task
    const streakTask = this.tasks.daily.find(t => t.id === 3)
    if (streakTask) {
      streakTask.progress = Math.min(this.userData.streak, streakTask.target)
      if (streakTask.progress >= streakTask.target) {
        this.completeTaskReward(streakTask.id, streakTask.reward)
      }
    }

    this.saveToStorage('tasks', this.tasks)
  }

  // Complete task and give reward
  completeTaskReward(taskId, reward) {
    this.updateUserData({
      totalEarned: this.userData.totalEarned + reward
    })

    this.addTransaction({
      type: "task_reward",
      amount: reward,
      status: "completed",
      txHash: `Task_${taskId}`,
      timestamp: new Date().toISOString()
    })

    this.addActivity({
      type: "task_completed",
      title: "Task Completed",
      description: `Earned ${reward} USDT for completing task`,
      time: "Just now",
      icon: "✅"
    })
  }

  // Check and update user level
  checkLevelUp() {
    const currentLevel = this.userData.level
    const newLevel = Math.floor(this.userData.xp / 100) + 1

    if (newLevel > currentLevel) {
      this.updateUserData({ level: newLevel })
      
      // Add level up bonus
      const levelBonus = newLevel * 5
      this.updateUserData({
        totalEarned: this.userData.totalEarned + levelBonus
      })

      this.addTransaction({
        type: "level_bonus",
        amount: levelBonus,
        status: "completed",
        txHash: `Level_${newLevel}`,
        timestamp: new Date().toISOString()
      })

      this.addActivity({
        type: "level_up",
        title: "Level Up!",
        description: `Reached level ${newLevel} and earned ${levelBonus} USDT bonus!`,
        time: "Just now",
        icon: "⭐"
      })
    }
  }

  // Check and unlock achievements
  checkAchievements() {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let shouldUnlock = false

        switch (achievement.requirement.type) {
          case "quizzes_completed":
            shouldUnlock = this.userData.dailyQuizzesCompleted >= achievement.requirement.value
            break
          case "streak":
            shouldUnlock = this.userData.streak >= achievement.requirement.value
            break
          case "tournaments_won":
            shouldUnlock = this.userData.tournamentsWon >= achievement.requirement.value
            break
          case "level":
            shouldUnlock = this.userData.level >= achievement.requirement.value
            break
          case "correct_answers":
            shouldUnlock = this.userData.correctAnswers >= achievement.requirement.value
            break
          case "perfect_score":
            // This would need to be tracked separately
            break
          case "referrals":
            // This would need to be tracked separately
            break
        }

        if (shouldUnlock) {
          this.unlockAchievement(achievement.id)
        }
      }
    })
  }

  // Unlock achievement
  unlockAchievement(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.date = new Date().toISOString()

      // Give achievement reward
      const reward = this.getAchievementReward(achievement.rarity)
      this.updateUserData({
        totalEarned: this.userData.totalEarned + reward
      })

      this.addTransaction({
        type: "achievement_reward",
        amount: reward,
        status: "completed",
        txHash: `Achievement_${achievementId}`,
        timestamp: new Date().toISOString()
      })

      this.addActivity({
        type: "achievement_unlocked",
        title: "Achievement Unlocked!",
        description: `Unlocked "${achievement.title}" and earned ${reward} USDT!`,
        time: "Just now",
        icon: achievement.icon
      })

      this.saveToStorage('achievements', this.achievements)
    }
  }

  // Get achievement reward based on rarity
  getAchievementReward(rarity) {
    switch (rarity) {
      case "common": return 5
      case "rare": return 15
      case "epic": return 50
      case "legendary": return 100
      default: return 5
    }
  }

  // Update user data
  updateUserData(newData) {
    this.userData = { ...this.userData, ...newData }
    this.saveToStorage('userData', this.userData)
  }

  // Complete task
  completeTask(taskId) {
    const task = this.tasks.daily.find(t => t.id === taskId) ||
                 this.tasks.marketing.find(t => t.id === taskId) ||
                 this.tasks.partner.find(t => t.id === taskId)

    if (task && task.status !== 'completed') {
      task.status = 'completed'
      this.completeTaskReward(taskId, task.reward)
      this.saveToStorage('tasks', this.tasks)
    }
  }

  // Add transaction
  addTransaction(transaction) {
    transaction.id = this.transactions.length + 1
    this.transactions.unshift(transaction)
    this.saveToStorage('transactions', this.transactions)
  }

  // Add activity
  addActivity(activity) {
    activity.id = this.recentActivity.length + 1
    this.recentActivity.unshift(activity)
    
    // Keep only last 50 activities
    if (this.recentActivity.length > 50) {
      this.recentActivity = this.recentActivity.slice(0, 50)
    }
    
    this.saveToStorage('recentActivity', this.recentActivity)
  }

  // Update achievement
  updateAchievement(achievementId, updates) {
    const achievement = this.achievements.find(a => a.id === achievementId)
    if (achievement) {
      Object.assign(achievement, updates)
      this.saveToStorage('achievements', this.achievements)
    }
  }

  // Admin Panel ↔ User Interface Integration Methods
  addMarketingTask(task) {
    // Add to marketing tasks
    if (!this.marketingTasks) this.marketingTasks = []
    this.marketingTasks.push(task)
    
    // Update user interface tasks
    this.updateUserInterfaceTasks(task)
    
    // Log admin action
    this.logAdminAction('marketing_task_created', task.title)
    
    this.saveData()
  }

  updateMarketingTask(taskId, updates) {
    // Update marketing task
    if (this.marketingTasks) {
      const taskIndex = this.marketingTasks.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        this.marketingTasks[taskIndex] = { ...this.marketingTasks[taskIndex], ...updates }
        
        // Update user interface tasks
        this.updateUserInterfaceTasks(this.marketingTasks[taskIndex])
        
        // Log admin action
        this.logAdminAction('marketing_task_updated', this.marketingTasks[taskIndex].title)
      }
    }
    
    this.saveData()
  }

  deleteMarketingTask(taskId) {
    // Remove from marketing tasks
    if (this.marketingTasks) {
      const taskIndex = this.marketingTasks.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        const deletedTask = this.marketingTasks[taskIndex]
        this.marketingTasks.splice(taskIndex, 1)
        
        // Remove from user interface tasks
        this.removeUserInterfaceTask(taskId)
        
        // Log admin action
        this.logAdminAction('marketing_task_deleted', deletedTask.title)
      }
    }
    
    this.saveData()
  }

  updateUserInterfaceTasks(task) {
    // Get existing user tasks
    let userTasks = JSON.parse(localStorage.getItem('userTasks') || '[]')
    
    // Check if task already exists
    const existingTaskIndex = userTasks.findIndex(t => t.id === task.id)
    
    if (existingTaskIndex !== -1) {
      // Update existing task
      userTasks[existingTaskIndex] = { ...userTasks[existingTaskIndex], ...task }
    } else {
      // Add new task
      userTasks.push({
        ...task,
        userCompleted: false,
        userProgress: 0,
        userStartedAt: null
      })
    }
    
    // Save to localStorage
    localStorage.setItem('userTasks', JSON.stringify(userTasks))
    
    // Create notification for users
    this.createUserNotification('task_updated', task.title, `Task "${task.title}" has been updated`)
  }

  removeUserInterfaceTask(taskId) {
    // Remove task from user interface
    let userTasks = JSON.parse(localStorage.getItem('userTasks') || '[]')
    userTasks = userTasks.filter(t => t.id !== taskId)
    localStorage.setItem('userTasks', JSON.stringify(userTasks))
    
    // Create notification for users
    this.createUserNotification('task_removed', 'Task Removed', 'A task has been removed by admin')
  }

  createUserNotification(type, title, message) {
    // Create notification for user interface
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal'
    }
    
    // Get existing notifications
    let notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]')
    notifications.unshift(notification)
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50)
    }
    
    // Save to localStorage
    localStorage.setItem('userNotifications', JSON.stringify(notifications))
  }

  logAdminAction(action, details) {
    // Log admin actions for monitoring
    const adminLog = {
      action,
      details,
      timestamp: new Date().toISOString(),
      adminUser: localStorage.getItem('adminUsername') || 'Unknown'
    }
    
    // Get existing admin logs
    let adminLogs = JSON.parse(localStorage.getItem('adminActionLogs') || '[]')
    adminLogs.unshift(adminLog)
    
    // Keep only last 100 logs
    if (adminLogs.length > 100) {
      adminLogs = adminLogs.slice(0, 100)
    }
    
    // Save to localStorage
    localStorage.setItem('adminActionLogs', JSON.stringify(adminLogs))
    
    // Update user activity log
    this.logUserActivity('admin_action', `${action}: ${details}`, 'Admin')
  }

  logUserActivity(action, description, user) {
    // Log user interface activities
    const activity = {
      action,
      description,
      user,
      timestamp: new Date().toISOString()
    }
    
    // Get existing activities
    let activities = JSON.parse(localStorage.getItem('recentUserActivity') || '[]')
    activities.unshift(activity)
    
    // Keep only last 20 activities
    if (activities.length > 20) {
      activities = activities.slice(0, 20)
    }
    
    // Save to localStorage
    localStorage.setItem('recentUserActivity', JSON.stringify(activities))
  }

  // User Interface Status Methods
  updateUserInterfaceStatus() {
    // Update real-time user interface status
    const activeSessions = Math.floor(Math.random() * 50) + 10 // Mock data
    const onlineUsers = Math.floor(Math.random() * 100) + 20 // Mock data
    
    localStorage.setItem('activeSessions', activeSessions.toString())
    localStorage.setItem('onlineUsers', onlineUsers.toString())
  }

  // Initialize real-time monitoring
  initializeRealTimeMonitoring() {
    // Update status every 30 seconds
    setInterval(() => {
      this.updateUserInterfaceStatus()
    }, 30000)
    
    // Initial update
    this.updateUserInterfaceStatus()
  }

  // Referral System Methods
  generateReferralCode() {
    // Generate a unique referral code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  inviteFriend(friendUsername) {
    // Ensure referral data exists
    if (!this.userData.referralRewards) {
      this.userData.referralRewards = [
        { tier: "Bronze", friends: 5, reward: 10, unlocked: false },
        { tier: "Silver", friends: 10, reward: 25, unlocked: false },
        { tier: "Gold", friends: 20, reward: 50, unlocked: false }
      ]
    }
    
    if (!this.userData.invitedFriends) {
      this.userData.invitedFriends = 0
    }
    
    if (!this.userData.maxInvites) {
      this.userData.maxInvites = 10
    }

    // Process friend invitation
    if (this.userData.invitedFriends >= this.userData.maxInvites) {
      return { success: false, message: 'Maximum invites reached for this tier' }
    }

    // Check if friend already exists
    const existingFriend = this.users.find(user => 
      user.telegramUsername === friendUsername
    )
    
    if (existingFriend) {
      return { success: false, message: 'User already exists' }
    }

    // Add friend to invited list
    this.userData.invitedFriends += 1
    
    // Check for tier rewards
    this.checkReferralTierRewards()
    
    // Update storage
    this.saveToStorage('userData', this.userData)
    
    // Add activity
    this.addActivity({
      type: "friend_invited",
      title: "Friend Invited!",
      description: `Successfully invited ${friendUsername}`,
      time: "Just now",
      icon: "👥"
    })

    return { 
      success: true, 
      message: 'Friend invited successfully!',
      invitedFriends: this.userData.invitedFriends
    }
  }

  checkReferralTierRewards() {
    // Ensure referralRewards exists
    if (!this.userData.referralRewards) {
      this.userData.referralRewards = [
        { tier: "Bronze", friends: 5, reward: 10, unlocked: false },
        { tier: "Silver", friends: 10, reward: 25, unlocked: false },
        { tier: "Gold", friends: 20, reward: 50, unlocked: false }
      ]
    }

    // Check and unlock referral tier rewards
    this.userData.referralRewards.forEach(tier => {
      if (!tier.unlocked && (this.userData.invitedFriends || 0) >= tier.friends) {
        tier.unlocked = true
        
        // Give reward
        this.userData.referralEarnings = (this.userData.referralEarnings || 0) + tier.reward
        this.userData.availableBalance = (this.userData.availableBalance || 0) + tier.reward
        
        // Add transaction
        this.addTransaction({
          type: "referral_tier_reward",
          amount: tier.reward,
          status: "completed",
          txHash: `ReferralTier_${tier.tier}`,
          timestamp: new Date().toISOString()
        })

        // Add activity
        this.addActivity({
          type: "referral_reward",
          title: "Referral Tier Unlocked!",
          description: `Unlocked tier ${tier.tier} and earned ${tier.reward} USDT!`,
          time: "Just now",
          icon: "🎁"
        })
      }
    })
  }

  getReferralStats() {
    // Ensure referralRewards exists
    if (!this.userData.referralRewards) {
      this.userData.referralRewards = [
        { tier: "Bronze", friends: 5, reward: 10, unlocked: false },
        { tier: "Silver", friends: 10, reward: 25, unlocked: false },
        { tier: "Gold", friends: 20, reward: 50, unlocked: false }
      ]
    }

    return {
      referralCode: this.userData.referralCode || "CRYPTO123",
      invitedFriends: this.userData.invitedFriends || 0,
      maxInvites: this.userData.maxInvites || 10,
      referralEarnings: this.userData.referralEarnings || 0,
      referralRewards: this.userData.referralRewards,
      nextTier: this.userData.referralRewards.find(tier => !tier.unlocked) || null,
      progress: ((this.userData.invitedFriends || 0) / (this.userData.maxInvites || 10)) * 100
    }
  }

  shareReferralLink() {
    // Ensure referralCode exists
    if (!this.userData.referralCode) {
      this.userData.referralCode = "CRYPTO123"
    }

    // Generate shareable referral link
    const baseUrl = window.location.origin
    const referralLink = `${baseUrl}?ref=${this.userData.referralCode}`
    
    // Try to use native sharing if available
    if (navigator.share) {
      navigator.share({
        title: 'Join CryptoQuiz App!',
        text: `Hey! I'm using this amazing crypto quiz app and earning money. Use my referral code ${this.userData.referralCode} to get started!`,
        url: referralLink
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(referralLink).then(() => {
        // Show success message
        this.addActivity({
          type: "referral_shared",
          title: "Referral Link Copied!",
          description: "Referral link copied to clipboard",
          time: "Just now",
          icon: "📋"
        })
      })
    }
    
    return referralLink
  }
}

// Create singleton instance
const dataService = new DataService()
dataService.initializeData()

export default dataService
