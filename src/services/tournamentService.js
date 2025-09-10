// Tournament Service for managing tournaments, entry fees, and payouts
import firebaseService from './firebaseService'
import dataService from './dataService'
import balanceService from './balanceService'

class TournamentService {
  constructor() {
    this.cache = {
      tournaments: null,
      lastFetch: null,
      cacheDuration: 30 * 1000 // 30 seconds
    }
  }

  // Create a new tournament
  async createTournament(tournamentData) {
    try {
      const userId = dataService.getUserData()?.userId
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Check if user has sufficient balance
      const userBalance = await balanceService.checkMinimumBalance(userId)
      if (userBalance.playableBalance < tournamentData.entryFee) {
        throw new Error(`Insufficient balance. Required: $${tournamentData.entryFee}, Available: $${userBalance.playableBalance}`)
      }

      // Deduct entry fee from creator
      const deductResult = await balanceService.deductBalance(
        userId,
        tournamentData.entryFee,
        'tournament_creation',
        `Tournament: ${tournamentData.name}`
      )

      if (!deductResult.success) {
        throw new Error(deductResult.message)
      }

      // Create tournament
      const tournament = {
        id: `tournament_${Date.now()}`,
        name: tournamentData.name,
        description: tournamentData.description || '',
        entryFee: tournamentData.entryFee,
        maxParticipants: tournamentData.maxParticipants || 100,
        currentParticipants: 1,
        totalPool: tournamentData.entryFee, // Creator's entry fee
        status: 'active', // active, completed, cancelled
        creatorId: userId,
        creatorName: dataService.getUserData()?.telegramFullName || 'Unknown',
        participants: [{
          userId: userId,
          userName: dataService.getUserData()?.telegramFullName || 'Unknown',
          joinedAt: new Date().toISOString(),
          isCreator: true
        }],
        quizQuestions: tournamentData.quizQuestions || [],
        timeLimit: tournamentData.timeLimit || 300, // 5 minutes default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startsAt: tournamentData.startsAt || new Date().toISOString(),
        endsAt: null
      }

      // Save tournament
      await firebaseService.create('tournaments', tournament)

      // Send notification to all users
      await this.notifyAllUsers('tournament_created', {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        entryFee: tournament.entryFee,
        creatorName: tournament.creatorName
      })

      // Clear cache
      this.clearCache()

      return {
        success: true,
        tournament: tournament,
        message: 'Tournament created successfully!'
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  // Join a tournament
  async joinTournament(tournamentId) {
    try {
      const userId = dataService.getUserData()?.userId
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Get tournament
      const tournament = await firebaseService.read('tournaments', tournamentId)
      if (!tournament) {
        throw new Error('Tournament not found')
      }

      if (tournament.status !== 'active') {
        throw new Error('Tournament is not active')
      }

      if (tournament.currentParticipants >= tournament.maxParticipants) {
        throw new Error('Tournament is full')
      }

      // Check if user already joined
      const alreadyJoined = tournament.participants.some(p => p.userId === userId)
      if (alreadyJoined) {
        throw new Error('You have already joined this tournament')
      }

      // Check if user has sufficient balance
      const userBalance = await balanceService.checkMinimumBalance(userId)
      if (userBalance.playableBalance < tournament.entryFee) {
        throw new Error(`Insufficient balance. Required: $${tournament.entryFee}, Available: $${userBalance.playableBalance}`)
      }

      // Deduct entry fee from joiner
      const deductResult = await balanceService.deductBalance(
        userId,
        tournament.entryFee,
        'tournament_join',
        `Tournament: ${tournament.name}`
      )

      if (!deductResult.success) {
        throw new Error(deductResult.message)
      }

      // Add participant to tournament
      const newParticipant = {
        userId: userId,
        userName: dataService.getUserData()?.telegramFullName || 'Unknown',
        joinedAt: new Date().toISOString(),
        isCreator: false
      }

      const updatedTournament = {
        ...tournament,
        participants: [...tournament.participants, newParticipant],
        currentParticipants: tournament.currentParticipants + 1,
        totalPool: tournament.totalPool + tournament.entryFee,
        updatedAt: new Date().toISOString()
      }

      // Update tournament
      await firebaseService.update('tournaments', tournamentId, updatedTournament)

      // Clear cache
      this.clearCache()

      return {
        success: true,
        tournament: updatedTournament,
        message: 'Successfully joined tournament!'
      }
    } catch (error) {
      console.error('Error joining tournament:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  // Get all active tournaments
  async getActiveTournaments() {
    try {
      // Check cache first
      if (this.cache.tournaments && this.cache.lastFetch && 
          (Date.now() - this.cache.lastFetch) < this.cache.cacheDuration) {
        return this.cache.tournaments
      }

      const tournaments = await firebaseService.queryCollection('tournaments', [
        { field: 'status', operator: '==', value: 'active' }
      ])

      // Sort by creation date (newest first)
      const sortedTournaments = tournaments.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )

      // Update cache
      this.cache.tournaments = sortedTournaments
      this.cache.lastFetch = Date.now()

      return sortedTournaments
    } catch (error) {
      console.error('Error fetching active tournaments:', error)
      return []
    }
  }

  // Get tournament by ID
  async getTournament(tournamentId) {
    try {
      return await firebaseService.read('tournaments', tournamentId)
    } catch (error) {
      console.error('Error fetching tournament:', error)
      return null
    }
  }

  // Complete tournament and distribute prizes
  async completeTournament(tournamentId, winnerId, winnerScore) {
    try {
      const tournament = await this.getTournament(tournamentId)
      if (!tournament) {
        throw new Error('Tournament not found')
      }

      if (tournament.status !== 'active') {
        throw new Error('Tournament is not active')
      }

      // Calculate app fee (2% per $10, so 20% total)
      const appFeeRate = 0.20 // 20% fee
      const appFee = tournament.totalPool * appFeeRate
      const winnerAmount = tournament.totalPool - appFee

      // Update tournament status
      const updatedTournament = {
        ...tournament,
        status: 'completed',
        winnerId: winnerId,
        winnerScore: winnerScore,
        winnerAmount: winnerAmount,
        appFee: appFee,
        endsAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await firebaseService.update('tournaments', tournamentId, updatedTournament)

      // Add winnings to winner's account
      const winnerResult = await balanceService.addBalance(
        winnerId,
        winnerAmount,
        'tournament_win',
        `Tournament: ${tournament.name}`
      )

      if (!winnerResult.success) {
        console.error('Error adding winnings to winner:', winnerResult.message)
      }

      // Add app fee to system account
      await this.addAppFee(appFee, tournamentId)

      // Clear cache
      this.clearCache()

      return {
        success: true,
        tournament: updatedTournament,
        winnerAmount: winnerAmount,
        appFee: appFee,
        message: 'Tournament completed successfully!'
      }
    } catch (error) {
      console.error('Error completing tournament:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  // Add app fee to system account
  async addAppFee(amount, tournamentId) {
    try {
      // Get or create system account
      let systemAccount = await firebaseService.read('system_accounts', 'tournament_fees')
      
      if (!systemAccount) {
        systemAccount = {
          id: 'tournament_fees',
          totalFees: 0,
          transactions: [],
          createdAt: new Date().toISOString()
        }
      }

      // Add fee
      systemAccount.totalFees += amount
      systemAccount.transactions.push({
        tournamentId: tournamentId,
        amount: amount,
        timestamp: new Date().toISOString()
      })
      systemAccount.updatedAt = new Date().toISOString()

      await firebaseService.update('system_accounts', 'tournament_fees', systemAccount)
    } catch (error) {
      console.error('Error adding app fee:', error)
    }
  }

  // Send notification to all users
  async notifyAllUsers(type, data) {
    try {
      // Get all users
      const users = await firebaseService.queryCollection('users')
      
      // Create notification for each user
      const notifications = users.map(user => ({
        userId: user.userId,
        type: type,
        data: data,
        read: false,
        createdAt: new Date().toISOString()
      }))

      // Save notifications
      for (const notification of notifications) {
        await firebaseService.create('notifications', notification)
      }

      console.log(`Sent ${notifications.length} notifications`)
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  // Get user's tournaments
  async getUserTournaments(userId) {
    try {
      const tournaments = await firebaseService.queryCollection('tournaments', [
        { field: 'participants', operator: 'array-contains', value: { userId: userId } }
      ])

      return tournaments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (error) {
      console.error('Error fetching user tournaments:', error)
      return []
    }
  }

  // Get tournament statistics
  async getTournamentStats() {
    try {
      const tournaments = await firebaseService.read('tournaments')
      const activeTournaments = tournaments.filter(t => t.status === 'active')
      const completedTournaments = tournaments.filter(t => t.status === 'completed')
      
      const totalParticipants = tournaments.reduce((sum, t) => sum + t.currentParticipants, 0)
      const totalPool = tournaments.reduce((sum, t) => sum + t.totalPool, 0)
      const totalFees = tournaments.reduce((sum, t) => sum + (t.appFee || 0), 0)

      return {
        totalTournaments: tournaments.length,
        activeTournaments: activeTournaments.length,
        completedTournaments: completedTournaments.length,
        totalParticipants: totalParticipants,
        totalPool: totalPool,
        totalFees: totalFees
      }
    } catch (error) {
      console.error('Error fetching tournament stats:', error)
      return {
        totalTournaments: 0,
        activeTournaments: 0,
        completedTournaments: 0,
        totalParticipants: 0,
        totalPool: 0,
        totalFees: 0
      }
    }
  }

  // Clear cache
  clearCache() {
    this.cache.tournaments = null
    this.cache.lastFetch = null
  }
}

// Create singleton instance
const tournamentService = new TournamentService()

export default tournamentService