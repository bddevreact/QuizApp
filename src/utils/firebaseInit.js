// Firebase Database Initialization
import firebaseService from '../services/firebaseService'

class FirebaseInitializer {
  constructor() {
    this.isInitialized = false
  }

  // Initialize Firebase database with default data
  async initializeDatabase() {
    try {
      if (this.isInitialized) return

      console.log('Initializing Firebase database...')

      // Initialize default questions
      await this.initializeDefaultQuestions()

      // Initialize default tasks
      await this.initializeDefaultTasks()

      // Initialize default achievements
      await this.initializeDefaultAchievements()

      // Initialize admin user
      await this.initializeAdminUser()

      this.isInitialized = true
      console.log('Firebase database initialized successfully!')
    } catch (error) {
      console.error('Error initializing Firebase database:', error)
      throw error
    }
  }

  // Initialize default questions
  async initializeDefaultQuestions() {
    try {
      const existingQuestions = await firebaseService.getQuestions()
      if (existingQuestions.length > 0) {
        console.log('Questions already exist, skipping initialization')
        return
      }

      const defaultQuestions = [
        // Easy Questions
        {
          question: "What is Bitcoin?",
          options: ["A digital currency", "A physical coin", "A bank account", "A credit card"],
          correct: 0,
          category: "Basics",
          explanation: "Bitcoin is a decentralized digital currency that operates on blockchain technology.",
          difficulty: "easy",
          source: "manual",
          status: "active"
        },
        {
          question: "What does 'HODL' mean in crypto?",
          options: ["Hold On for Dear Life", "High Order Digital Logic", "Hold", "High Output Digital Ledger"],
          correct: 2,
          category: "Slang",
          explanation: "HODL is a misspelling of 'hold' that became popular in the crypto community.",
          difficulty: "easy",
          source: "manual",
          status: "active"
        },
        {
          question: "What is a blockchain?",
          options: ["A type of cryptocurrency", "A digital ledger", "A bank", "A trading platform"],
          correct: 1,
          category: "Technology",
          explanation: "A blockchain is a distributed digital ledger that records transactions across multiple computers.",
          difficulty: "easy",
          source: "manual",
          status: "active"
        },
        {
          question: "What is the maximum supply of Bitcoin?",
          options: ["21 million", "100 million", "1 billion", "Unlimited"],
          correct: 0,
          category: "Economics",
          explanation: "Bitcoin has a maximum supply of 21 million coins, making it deflationary.",
          difficulty: "easy",
          source: "manual",
          status: "active"
        },
        {
          question: "What is a private key?",
          options: ["A password", "A secret number to access crypto", "A public address", "A wallet name"],
          correct: 1,
          category: "Security",
          explanation: "A private key is a secret number that allows you to access and control your cryptocurrency.",
          difficulty: "easy",
          source: "manual",
          status: "active"
        },

        // Medium Questions
        {
          question: "What is a smart contract?",
          options: ["A legal document", "Self-executing code on blockchain", "A type of cryptocurrency", "A trading agreement"],
          correct: 1,
          category: "Technology",
          explanation: "Smart contracts are self-executing contracts with terms written in code on the blockchain.",
          difficulty: "medium",
          source: "manual",
          status: "active"
        },
        {
          question: "What is DeFi?",
          options: ["Decentralized Finance", "Digital Finance", "Direct Finance", "Distributed Finance"],
          correct: 0,
          category: "Finance",
          explanation: "DeFi stands for Decentralized Finance, which provides financial services without intermediaries.",
          difficulty: "medium",
          source: "manual",
          status: "active"
        },
        {
          question: "What is a 'whale' in crypto?",
          options: ["A large investor", "A type of cryptocurrency", "A trading strategy", "A blockchain"],
          correct: 0,
          category: "Trading",
          explanation: "A whale is someone who holds a large amount of cryptocurrency and can influence market prices.",
          difficulty: "medium",
          source: "manual",
          status: "active"
        },
        {
          question: "What is staking?",
          options: ["Trading crypto", "Lending crypto to earn rewards", "Mining crypto", "Buying crypto"],
          correct: 1,
          category: "Earning",
          explanation: "Staking involves lending your cryptocurrency to a network to earn rewards and help secure the network.",
          difficulty: "medium",
          source: "manual",
          status: "active"
        },
        {
          question: "What is a 'fork' in blockchain?",
          options: ["A split in the blockchain", "A type of cryptocurrency", "A trading tool", "A wallet feature"],
          correct: 0,
          category: "Technology",
          explanation: "A fork occurs when a blockchain splits into two separate chains, often due to protocol changes.",
          difficulty: "medium",
          source: "manual",
          status: "active"
        },

        // Hard Questions
        {
          question: "What is the Byzantine Generals Problem?",
          options: ["A military strategy", "A consensus problem in distributed systems", "A trading algorithm", "A security protocol"],
          correct: 1,
          category: "Advanced",
          explanation: "The Byzantine Generals Problem is a fundamental problem in distributed systems about reaching consensus.",
          difficulty: "hard",
          source: "manual",
          status: "active"
        },
        {
          question: "What is a Merkle Tree?",
          options: ["A type of cryptocurrency", "A data structure for efficient verification", "A trading strategy", "A wallet type"],
          correct: 1,
          category: "Advanced",
          explanation: "A Merkle Tree is a data structure that allows efficient verification of large data sets in blockchain.",
          difficulty: "hard",
          source: "manual",
          status: "active"
        },
        {
          question: "What is the difference between PoW and PoS?",
          options: ["Proof of Work vs Proof of Stake", "Price of Work vs Price of Stake", "Power of Work vs Power of Stake", "Proof of Wealth vs Proof of Stake"],
          correct: 0,
          category: "Advanced",
          explanation: "PoW requires computational work while PoS requires staking cryptocurrency to validate transactions.",
          difficulty: "hard",
          source: "manual",
          status: "active"
        },
        {
          question: "What is a '51% attack'?",
          options: ["A trading strategy", "When one entity controls 51% of network hash rate", "A type of cryptocurrency", "A security feature"],
          correct: 1,
          category: "Security",
          explanation: "A 51% attack occurs when one entity controls more than half of the network's mining power.",
          difficulty: "hard",
          source: "manual",
          status: "active"
        },
        {
          question: "What is a 'halving' in Bitcoin?",
          options: ["Price reduction", "Block reward reduction", "Transaction fee reduction", "Network speed reduction"],
          correct: 1,
          category: "Economics",
          explanation: "Bitcoin halving reduces the block reward by 50% every 210,000 blocks.",
          difficulty: "hard",
          source: "manual",
          status: "active"
        }
      ]

      // Add questions to Firebase
      for (const question of defaultQuestions) {
        await firebaseService.createQuestion(question)
      }

      console.log(`Initialized ${defaultQuestions.length} default questions`)
    } catch (error) {
      console.error('Error initializing default questions:', error)
    }
  }

  // Initialize default tasks
  async initializeDefaultTasks() {
    try {
      const existingTasks = await firebaseService.getTasks()
      if (existingTasks.length > 0) {
        console.log('Tasks already exist, skipping initialization')
        return
      }

      const defaultTasks = [
        // Daily Tasks
        {
          title: "Daily Bonus Question",
          description: "Answer today's special question for 3x rewards",
          reward: 15,
          difficulty: "medium",
          timeLeft: "23:45",
          status: "available",
          type: "daily",
          completedToday: false
        },
        {
          title: "Complete 5 Quizzes",
          description: "Finish 5 quiz sessions today",
          reward: 5,
          progress: 0,
          target: 5,
          status: "in_progress",
          type: "daily"
        },
        {
          title: "Maintain 7-Day Streak",
          description: "Keep your daily quiz streak for 7 days",
          reward: 10,
          progress: 0,
          target: 7,
          status: "in_progress",
          type: "daily"
        },
        {
          title: "Win 3 Tournaments",
          description: "Win 3 tournament battles today",
          reward: 25,
          progress: 0,
          target: 3,
          status: "in_progress",
          type: "daily"
        },
        {
          title: "Answer 50 Questions",
          description: "Answer 50 questions correctly today",
          reward: 8,
          progress: 0,
          target: 50,
          status: "in_progress",
          type: "daily"
        },

        // Marketing Tasks
        {
          title: "Share Telegram Story",
          description: "Share our app on your Telegram story",
          reward: 2,
          difficulty: "easy",
          status: "available",
          type: "marketing",
          action: "share"
        },
        {
          title: "Invite a Friend",
          description: "Invite a friend to join the app",
          reward: 5,
          difficulty: "medium",
          status: "available",
          type: "marketing",
          action: "invite"
        },
        {
          title: "Like & Share Tweet",
          description: "Like and retweet our latest crypto quiz tweet",
          reward: 1,
          difficulty: "easy",
          status: "available",
          type: "marketing",
          action: "social"
        },
        {
          title: "Subscribe to Channel",
          description: "Subscribe to our official Telegram channel",
          reward: 3,
          difficulty: "easy",
          status: "available",
          type: "marketing",
          action: "subscribe"
        },
        {
          title: "Post Crypto Meme",
          description: "Share a crypto meme on your social media",
          reward: 2,
          difficulty: "medium",
          status: "available",
          type: "marketing",
          action: "meme"
        },

        // Partner Tasks
        {
          title: "Watch Partner Video",
          description: "Watch a 30-second partner video",
          reward: 1,
          difficulty: "easy",
          status: "available",
          type: "partner",
          action: "video"
        },
        {
          title: "Download Partner App",
          description: "Download and try our partner's app",
          reward: 5,
          difficulty: "hard",
          status: "available",
          type: "partner",
          action: "download"
        },
        {
          title: "Complete Survey",
          description: "Complete a quick survey about crypto",
          reward: 3,
          difficulty: "medium",
          status: "available",
          type: "partner",
          action: "survey"
        }
      ]

      // Add tasks to Firebase
      for (const task of defaultTasks) {
        await firebaseService.createTask(task)
      }

      console.log(`Initialized ${defaultTasks.length} default tasks`)
    } catch (error) {
      console.error('Error initializing default tasks:', error)
    }
  }

  // Initialize default achievements
  async initializeDefaultAchievements() {
    try {
      const existingAchievements = await firebaseService.getAchievements()
      if (existingAchievements.length > 0) {
        console.log('Achievements already exist, skipping initialization')
        return
      }

      const defaultAchievements = [
        {
          title: "First Quiz",
          description: "Complete your first quiz",
          icon: "🎯",
          unlocked: false,
          date: null,
          rarity: "common",
          requirement: { type: "quizzes_completed", value: 1 }
        },
        {
          title: "Streak Master",
          description: "Maintain a 7-day streak",
          icon: "🔥",
          unlocked: false,
          date: null,
          rarity: "rare",
          requirement: { type: "streak", value: 7 }
        },
        {
          title: "Tournament Champion",
          description: "Win your first tournament",
          icon: "🏆",
          unlocked: false,
          date: null,
          rarity: "epic",
          requirement: { type: "tournaments_won", value: 1 }
        },
        {
          title: "Level 10",
          description: "Reach level 10",
          icon: "⭐",
          unlocked: false,
          date: null,
          rarity: "legendary",
          requirement: { type: "level", value: 10 }
        },
        {
          title: "Quiz Master",
          description: "Answer 100 questions correctly",
          icon: "🧠",
          unlocked: false,
          date: null,
          rarity: "rare",
          requirement: { type: "correct_answers", value: 100 }
        },
        {
          title: "Perfect Score",
          description: "Get 100% on a quiz",
          icon: "💯",
          unlocked: false,
          date: null,
          rarity: "epic",
          requirement: { type: "perfect_score", value: 1 }
        },
        {
          title: "Referral King",
          description: "Invite 10 friends",
          icon: "👑",
          unlocked: false,
          date: null,
          rarity: "legendary",
          requirement: { type: "referrals", value: 10 }
        }
      ]

      // Add achievements to Firebase
      for (const achievement of defaultAchievements) {
        await firebaseService.createAchievement(achievement)
      }

      console.log(`Initialized ${defaultAchievements.length} default achievements`)
    } catch (error) {
      console.error('Error initializing default achievements:', error)
    }
  }

  // Initialize admin user
  async initializeAdminUser() {
    try {
      const adminEmail = "admin@quizapp.com"
      const existingUsers = await firebaseService.queryCollection('users', [
        { field: 'email', operator: '==', value: adminEmail }
      ])

      if (existingUsers.length > 0) {
        console.log('Admin user already exists, skipping initialization')
        return
      }

      const adminUser = {
        email: adminEmail,
        displayName: "Admin User",
        isAdmin: true,
        isVerified: true,
        totalEarned: 0,
        level: 1,
        xp: 0,
        rank: "Admin",
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }

      await firebaseService.createUser(adminUser)
      console.log('Admin user initialized')
    } catch (error) {
      console.error('Error initializing admin user:', error)
    }
  }

  // Check if database is initialized
  async isDatabaseInitialized() {
    try {
      // Check if collections exist and have data
      const questions = await firebaseService.getQuestions().catch(() => [])
      const tasks = await firebaseService.getTasks().catch(() => [])
      const achievements = await firebaseService.getAchievements().catch(() => [])
      
      return questions.length > 0 && tasks.length > 0 && achievements.length > 0
    } catch (error) {
      console.warn('Database not initialized yet:', error.message)
      return false
    }
  }
}

// Create singleton instance
const firebaseInitializer = new FirebaseInitializer()

export default firebaseInitializer
