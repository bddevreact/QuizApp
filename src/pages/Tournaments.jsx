import React, { useState, useEffect } from 'react'
import { Trophy, Users, Clock, DollarSign, Zap, Target, Crown, Sword, TrendingUp, Award, Calendar, BarChart3, Star, Plus } from 'lucide-react'
import dataService from '../services/dataService'
import tournamentService from '../services/tournamentService'
import TournamentCreateModal from '../components/TournamentCreateModal'

const Tournaments = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [stakeAmount, setStakeAmount] = useState('')
  const [selectedStake, setSelectedStake] = useState(10)
  const [tournaments, setTournaments] = useState([])
  const [userTournaments, setUserTournaments] = useState([])
  const [userData, setUserData] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const stakeOptions = [10, 25, 50, 100, 250, 500]

  useEffect(() => {
    loadTournaments()
    loadUserData()
  }, [])

  const loadUserData = () => {
    setUserData(dataService.getUserData())
  }

  const loadTournaments = async () => {
    try {
      setIsLoading(true)
      
      // Initialize dataService if not already initialized
      if (!dataService.isInitialized) {
        await dataService.initializeData()
      }
      
      // Load active tournaments using tournament service
      const activeTournaments = await tournamentService.getActiveTournaments()
      setTournaments(activeTournaments)
      
      // Load user's tournaments
      const userId = dataService.getUserData()?.userId
      if (userId) {
        const userTours = await tournamentService.getUserTournaments(userId)
        setUserTournaments(userTours)
      }
    } catch (error) {
      console.error('Error loading tournaments:', error)
      setTournaments([])
      setUserTournaments([])
    } finally {
      setIsLoading(false)
    }
  }

  const createTournament = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) < 10) {
      alert('Minimum stake is 10 USDT')
      return
    }

    const stake = parseFloat(stakeAmount)
    const userData = dataService.getUserData()
    if (stake > userData.totalEarned) {
      alert('Insufficient balance')
      return
    }

    try {
      const tournamentData = {
        stake,
        maxPlayers: 2,
        players: [userData.userId],
        prizePool: stake * 2 * 0.95,
        status: 'waiting',
        createdAt: new Date().toISOString()
      }

      const tournament = await dataService.createTournament(tournamentData)
      if (tournament) {
        // Reload tournaments to get updated list
        await loadTournaments()
        setStakeAmount('')
        
        // Deduct stake from user balance
        await dataService.updateUserData({
          totalEarned: userData.totalEarned - stake
        })
        
        // Reload user data
        loadUserData()

        await dataService.createTransaction({
          type: "tournament_stake",
          amount: stake,
          status: "pending",
          txHash: `Tournament #${tournament.id}`
        })

        alert('Tournament created successfully!')
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
      alert('Failed to create tournament')
    }
  }

  const joinTournament = async (tournament) => {
    try {
      const result = await tournamentService.joinTournament(tournament.id)
      
      if (result.success) {
        alert('Successfully joined tournament!')
        // Reload tournaments to get updated data
        await loadTournaments()
        loadUserData()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error joining tournament:', error)
      alert('Failed to join tournament')
    }
  }

  const simulateTournamentResult = (tournament) => {
    // Simulate tournament completion
    const winner = Math.random() > 0.5 ? 'player1' : 'player2'
    const isWinner = winner === 'player1'
    
    if (isWinner) {
      const winnings = tournament.prizePool
      const userData = dataService.getUserData()
      dataService.updateUserData({
        totalEarned: userData.totalEarned + winnings,
        tournamentsWon: (userData.tournamentsWon || 0) + 1,
        totalTournaments: (userData.totalTournaments || 0) + 1
      })

      dataService.addTransaction({
        type: "tournament_win",
        amount: winnings,
        status: "completed",
        txHash: `Tournament #${tournament.id}`
      })
    } else {
      const userData = dataService.getUserData()
      dataService.updateUserData({
        totalTournaments: (userData.totalTournaments || 0) + 1
      })
    }
    
    // Reload user data after tournament completion
    loadUserData()

    // Move tournament to completed
    const updatedTournaments = tournaments.filter(t => t.id !== tournament.id)
    setTournaments(updatedTournaments)
    
    const completedTournament = {
      ...tournament,
      status: 'completed',
      winner: isWinner ? userData.username : 'Opponent',
      completedAt: new Date().toISOString()
    }
    
    setUserTournaments([completedTournament, ...userTournaments])
    // Note: Tournament completion is now handled by Firebase in the dataService

    alert(isWinner ? 'Congratulations! You won the tournament!' : 'Better luck next time!')
  }

  const getTournamentStatus = (tournament) => {
    if (tournament.status === 'waiting') return 'Waiting for players'
    if (tournament.status === 'ready') return 'Ready to start'
    if (tournament.status === 'completed') return 'Completed'
    return 'Unknown'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400'
      case 'ready': return 'text-green-400'
      case 'completed': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="px-4 py-6 space-y-8 pb-32">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Tournaments</h1>
        <p className="text-gray-300">Compete with other players and win USDT!</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-gray-400 text-xs">Won</p>
          <p className="text-white font-bold text-sm">{userData.tournamentsWon || 0}</p>
        </div>
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Sword className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-gray-400 text-xs">Total</p>
          <p className="text-white font-bold text-sm">{userData.totalTournaments || 0}</p>
        </div>
        <div className="card text-center py-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Crown className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-gray-400 text-xs">Win Rate</p>
          <p className="text-white font-bold text-sm">
            {(userData.totalTournaments || 0) > 0 
              ? Math.round(((userData.tournamentsWon || 0) / (userData.totalTournaments || 1)) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Tournament Performance */}
      <div className="card">
                  <h3 className="text-base font-bold text-white mb-4">Tournament Performance</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Total Winnings</p>
              <p className="text-white font-bold text-base">{((userData.tournamentsWon || 0) * 50).toFixed(2)} USDT</p>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Best Streak</p>
              <p className="text-white font-bold text-base">3 wins</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Highest Stake</p>
              <p className="text-white font-bold text-base">100 USDT</p>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg">
              <p className="text-gray-400 text-xs">Avg Prize Pool</p>
              <p className="text-white font-bold text-base">95 USDT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-primary-card rounded-lg p-1">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'create'
              ? 'bg-primary-accent text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => setActiveTab('lobby')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'lobby'
              ? 'bg-primary-accent text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Lobby
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-primary-accent text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          History
        </button>
      </div>

      {/* Create Tournament Tab */}
      {activeTab === 'create' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-base font-bold text-white mb-4">Create New Tournament</h3>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">Ready to Create a Tournament?</h4>
              <p className="text-gray-400 text-sm mb-6">
                Set up your tournament with custom entry fees, participant limits, and rules. 
                All users will be notified when you create a tournament!
              </p>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Tournament</span>
              </button>
            </div>
          </div>

          {/* Tournament Rules */}
          <div className="card">
            <h3 className="text-base font-bold text-white mb-4 flex items-center">
              <Award className="w-5 h-5 text-primary-accent mr-2" />
              Tournament Rules
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-primary-accent">⚔️</span>
                <p className="text-gray-300">1v1 battles with 10 crypto questions each</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary-accent">⏱️</span>
                <p className="text-gray-300">15 seconds per question, fastest wins ties</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary-accent">💰</span>
                <p className="text-gray-300">Winner takes 95% of prize pool (5% app fee)</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary-accent">🎯</span>
                <p className="text-gray-300">Questions based on both players' levels</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Lobby Tab */}
      {activeTab === 'lobby' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Active Tournaments</h3>
          
          {isLoading ? (
            <div className="card text-center py-8">
              <div className="w-8 h-8 border-4 border-primary-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading tournaments...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="card text-center py-8">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400">No active tournaments</p>
              <p className="text-gray-500 text-sm">Create a tournament to get started!</p>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <div key={tournament.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold">{tournament.name}</h4>
                    <p className="text-gray-400 text-sm">by {tournament.creatorName}</p>
                    <p className={`text-sm ${getStatusColor(tournament.status)}`}>
                      {getTournamentStatus(tournament)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${tournament.entryFee} USDT</p>
                    <p className="text-gray-400 text-xs">Entry Fee</p>
                  </div>
                </div>

                {tournament.description && (
                  <p className="text-gray-300 text-sm mb-4">{tournament.description}</p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Prize Pool</span>
                    <span className="text-green-400 font-bold">${tournament.totalPool.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Participants</span>
                    <span className="text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Created</span>
                    <span className="text-gray-400 text-sm">
                      {new Date(tournament.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {tournament.currentParticipants < tournament.maxParticipants && (
                    <button
                      onClick={() => joinTournament(tournament)}
                      className="btn-primary flex-1"
                    >
                      Join Tournament
                    </button>
                  )}
                  {tournament.status === 'ready' && (
                    <button
                      onClick={() => simulateTournamentResult(tournament)}
                      className="btn-accent flex-1"
                    >
                      Start Battle
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Tournament Tips */}
          <div className="card bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <h3 className="text-base font-bold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 text-blue-400 mr-2" />
              Tournament Tips
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-blue-400">💡</span>
                <p className="text-gray-300">Start with smaller stakes to practice</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-400">💡</span>
                <p className="text-gray-300">Speed matters - answer quickly but accurately</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-400">💡</span>
                <p className="text-gray-300">Higher stakes mean bigger rewards and risks</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-400">💡</span>
                <p className="text-gray-300">Watch your balance - don't stake more than you can afford</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tournament History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Tournament History</h3>
          
          {userTournaments.length === 0 ? (
            <div className="card text-center py-8">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400">No tournament history</p>
              <p className="text-gray-500 text-sm">Complete tournaments to see your history!</p>
            </div>
          ) : (
            userTournaments.map((tournament) => (
              <div key={tournament.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold">Tournament #{tournament.id}</h4>
                    <p className="text-gray-400 text-sm">
                      {new Date(tournament.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{tournament.stake} USDT</p>
                    <p className="text-gray-400 text-xs">Stake</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Winner</span>
                    <span className={`font-bold ${tournament.winner === userData.username ? 'text-green-400' : 'text-red-400'}`}>
                      {tournament.winner}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Prize Pool</span>
                    <span className="text-green-400 font-bold">{tournament.prizePool.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Result</span>
                    <span className={`font-bold ${tournament.winner === userData.username ? 'text-green-400' : 'text-red-400'}`}>
                      {tournament.winner === userData.username ? 'Won' : 'Lost'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Tournament Statistics */}
          <div className="card">
            <h3 className="text-base font-bold text-white mb-4">Tournament Statistics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <p className="text-gray-400 text-xs">Total Winnings</p>
                  <p className="text-white font-bold text-base">{((userData.tournamentsWon || 0) * 50).toFixed(2)} USDT</p>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                  <p className="text-gray-400 text-xs">Total Losses</p>
                  <p className="text-white font-bold text-base">{(((userData.totalTournaments || 0) - (userData.tournamentsWon || 0)) * 25).toFixed(2)} USDT</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-gray-400 text-xs">Net Profit</p>
                  <p className="text-white font-bold text-base">{((userData.tournamentsWon || 0) * 50 - ((userData.totalTournaments || 0) - (userData.tournamentsWon || 0)) * 25).toFixed(2)} USDT</p>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-gray-400 text-xs">Avg Prize Pool</p>
                  <p className="text-white font-bold text-base">95 USDT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Create Modal */}
      <TournamentCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(tournament) => {
          console.log('Tournament created:', tournament)
          loadTournaments() // Reload tournaments
        }}
      />
    </div>
  )
}

export default Tournaments
