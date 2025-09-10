// Firebase Service for database operations
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../config/firebase'

class FirebaseService {
  constructor() {
    this.collections = {
      users: 'users',
      questions: 'questions',
      tournaments: 'tournaments',
      transactions: 'transactions',
      tasks: 'tasks',
      achievements: 'achievements',
      leaderboard: 'leaderboard',
      activities: 'activities'
    }
  }

  // Generic CRUD operations
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { id: docRef.id, ...data }
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error)
      throw error
    }
  }

  async read(collectionName, docId = null) {
    try {
      if (docId) {
        const docRef = doc(db, collectionName, docId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() }
        }
        return null
      } else {
        const querySnapshot = await getDocs(collection(db, collectionName))
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
    } catch (error) {
      console.error(`Error reading from ${collectionName}:`, error)
      throw error
    }
  }

  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
      return { id: docId, ...data }
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error)
      throw error
    }
  }

  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
      return true
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error)
      throw error
    }
  }

  // Query operations
  async queryCollection(collectionName, conditions = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
    try {
      let q = collection(db, collectionName)
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value))
      })
      
      // Add ordering (only if no where conditions to avoid index requirements)
      if (orderByField && conditions.length === 0) {
        q = query(q, orderBy(orderByField, orderDirection))
      }
      
      // Add limit
      if (limitCount) {
        q = query(q, limit(limitCount))
      }
      
      const querySnapshot = await getDocs(q)
      let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Sort in memory if we have where conditions and ordering
      if (orderByField && conditions.length > 0) {
        results = results.sort((a, b) => {
          const aVal = a[orderByField] || ''
          const bVal = b[orderByField] || ''
          
          if (orderDirection === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
          } else {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
          }
        })
      }
      
      return results
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error)
      // Return empty array instead of throwing to prevent app crashes
      return []
    }
  }

  // Real-time listeners
  subscribeToCollection(collectionName, callback, conditions = []) {
    try {
      let q = collection(db, collectionName)
      
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value))
      })
      
      return onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        callback(data)
      })
    } catch (error) {
      console.error(`Error setting up listener for ${collectionName}:`, error)
      throw error
    }
  }

  // User-specific operations
  async getUser(userId) {
    return await this.read(this.collections.users, userId)
  }

  async createUser(userData) {
    return await this.create(this.collections.users, userData)
  }

  async updateUser(userId, userData) {
    return await this.update(this.collections.users, userId, userData)
  }

  async getUserByTelegramId(telegramId) {
    const users = await this.queryCollection(this.collections.users, [
      { field: 'telegramId', operator: '==', value: telegramId }
    ])
    return users[0] || null
  }

  // Question operations
  async getQuestions(filters = {}) {
    const conditions = []
    
    if (filters.difficulty) {
      conditions.push({ field: 'difficulty', operator: '==', value: filters.difficulty })
    }
    
    if (filters.category) {
      conditions.push({ field: 'category', operator: '==', value: filters.category })
    }
    
    if (filters.status) {
      conditions.push({ field: 'status', operator: '==', value: filters.status })
    }
    
    if (filters.source) {
      conditions.push({ field: 'source', operator: '==', value: filters.source })
    }
    
    return await this.queryCollection(this.collections.questions, conditions, 'createdAt', 'desc')
  }

  async createQuestion(questionData) {
    return await this.create(this.collections.questions, questionData)
  }

  async updateQuestion(questionId, questionData) {
    return await this.update(this.collections.questions, questionId, questionData)
  }

  async deleteQuestion(questionId) {
    return await this.delete(this.collections.questions, questionId)
  }

  // Tournament operations
  async getTournaments(status = null) {
    const conditions = status ? [{ field: 'status', operator: '==', value: status }] : []
    return await this.queryCollection(this.collections.tournaments, conditions, 'createdAt', 'desc')
  }

  async createTournament(tournamentData) {
    return await this.create(this.collections.tournaments, tournamentData)
  }

  async updateTournament(tournamentId, tournamentData) {
    return await this.update(this.collections.tournaments, tournamentId, tournamentData)
  }

  // Transaction operations
  async getTransactions(userId = null) {
    try {
      if (userId) {
        // Simple query with just userId filter (no ordering to avoid index requirement)
        const q = query(
          collection(db, this.collections.transactions),
          where('userId', '==', userId)
        )
        const querySnapshot = await getDocs(q)
        const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // Sort in memory to avoid index requirement
        return transactions.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      } else {
        // Get all transactions and sort in memory
        const q = query(collection(db, this.collections.transactions))
        const querySnapshot = await getDocs(q)
        const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // Sort in memory to avoid index requirement
        return transactions.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      }
    } catch (error) {
      console.error('Error getting transactions:', error)
      return []
    }
  }

  async createTransaction(transactionData) {
    return await this.create(this.collections.transactions, transactionData)
  }

  async updateTransaction(transactionId, transactionData) {
    return await this.update(this.collections.transactions, transactionId, transactionData)
  }

  // Task operations
  async getTasks(type = null) {
    const conditions = type ? [{ field: 'type', operator: '==', value: type }] : []
    return await this.queryCollection(this.collections.tasks, conditions)
  }

  async createTask(taskData) {
    return await this.create(this.collections.tasks, taskData)
  }

  async updateTask(taskId, taskData) {
    return await this.update(this.collections.tasks, taskId, taskData)
  }

  // Achievement operations
  async getAchievements() {
    return await this.read(this.collections.achievements)
  }

  async createAchievement(achievementData) {
    return await this.create(this.collections.achievements, achievementData)
  }

  async updateAchievement(achievementId, achievementData) {
    return await this.update(this.collections.achievements, achievementId, achievementData)
  }

  // Leaderboard operations
  async getLeaderboard(limitCount = 10) {
    return await this.queryCollection(this.collections.leaderboard, [], 'totalEarned', 'desc', limitCount)
  }

  async updateLeaderboard(userId, userData) {
    const existingEntry = await this.queryCollection(this.collections.leaderboard, [
      { field: 'userId', operator: '==', value: userId }
    ])
    
    if (existingEntry.length > 0) {
      return await this.update(this.collections.leaderboard, existingEntry[0].id, userData)
    } else {
      return await this.create(this.collections.leaderboard, { userId, ...userData })
    }
  }

  // Activity operations
  async getActivities(userId = null, limitCount = 50) {
    try {
      if (userId) {
        // Simple query with just userId filter (no ordering to avoid index requirement)
        const q = query(
          collection(db, this.collections.activities),
          where('userId', '==', userId),
          limit(limitCount)
        )
        const querySnapshot = await getDocs(q)
        const activities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // Sort in memory to avoid index requirement
        return activities.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      } else {
        // Get all activities and sort in memory
        const q = query(collection(db, this.collections.activities), limit(limitCount))
        const querySnapshot = await getDocs(q)
        const activities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // Sort in memory to avoid index requirement
        return activities.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      }
    } catch (error) {
      console.error('Error getting activities:', error)
      return []
    }
  }

  async createActivity(activityData) {
    return await this.create(this.collections.activities, activityData)
  }

  // Analytics and statistics
  async getQuestionStats() {
    const questions = await this.getQuestions()
    const stats = {
      total: questions.length,
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
      byCategory: {},
      bySource: { ai: 0, fallback: 0, manual: 0 },
      active: 0,
      inactive: 0
    }
    
    questions.forEach(q => {
      if (stats.byDifficulty[q.difficulty] !== undefined) {
        stats.byDifficulty[q.difficulty]++
      }
      stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1
      stats.bySource[q.source] = (stats.bySource[q.source] || 0) + 1
      if (q.status === 'active') stats.active++
      else stats.inactive++
    })
    
    return stats
  }

  async getUserStats(userId) {
    const user = await this.getUser(userId)
    const transactions = await this.getTransactions(userId)
    const activities = await this.getActivities(userId, 100)
    
    return {
      user,
      totalTransactions: transactions.length,
      totalActivities: activities.length,
      recentActivity: activities.slice(0, 10)
    }
  }
}

// Create singleton instance
const firebaseService = new FirebaseService()

export default firebaseService
export { firebaseService }
