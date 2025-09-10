import React, { useState, useEffect } from 'react'
import { Trophy, Users, Clock, DollarSign, Play, Plus, Target, Crown, Zap, AlertTriangle, Wallet } from 'lucide-react'
import tournamentService from '../services/tournamentService'
import balanceService from '../services/balanceService'
import dataService from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner'

const Tournament = () => {
  const [activeTournaments, setActiveTournaments] = useState([])
  const [userTournaments, setUserTournaments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [userBalance, setUserBalance] = useState(0)
  const [createForm, setCreateForm] = useState({
    entryFee: 1.0,
    difficulty: 'medium'
  })
  const [joinForm, setJoinForm] = useState({
    tournamentId: ''
  })

  useEffect(() => {
    loadData()
    loadUserBalance()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const userData = dataService.getUserData()
      
      // Load active tournaments
      const activeResult = await tournamentService.getActiveTournaments()
      if (activeResult.success) {
        setActiveTournaments(activeResult.tournaments)
      }

      // Load user's tournaments
      const userResult = await tournamentService.getUserTournaments(userData.userId)
      if (userResult.success) {
        setUserTournaments(userResult.tournaments)
      }
    } catch (error) {
      console.error('Error loading tournament data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserBalance = async () => {
    try {
      const userData = dataService.getUserData()
      const balanceResult = await balanceService.checkMinimumBalance(userData.userId)
      setUserBalance(balanceResult.currentBalance)
    } catch (error) {
      console.error('Error loading user balance:', error)
    }
  }

  const handleCreateTournament = async () => {
    try {
      const userData = dataService.getUserData()
      const result = await tournamentService.createTournament(
        userData.userId,
        createForm.entryFee,
        createForm.difficulty
      )

      if (result.success) {
        alert('Tournament created successfully!')
        setShowCreateModal(false)
        setCreateForm({ entryFee: 1.0, difficulty: 'medium' })
        loadData()
        loadUserBalance()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
      alert('Failed to create tournament. Please try again.')
    }
  }

  const handleJoinTournament = async (tournamentId) => {
    try {
      const userData = dataService.getUserData()
      const result = await tournamentService.joinTournament(tournamentId, userData.userId)

      if (result.success) {
        alert('Successfully joined tournament!')
        loadData()
        loadUserBalance()
        
        // If tournament is full, redirect to tournament page
        if (result.tournament.status === 'active') {
          window.location.href = `/tournament/${tournamentId}`
        }
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error joining tournament:', error)
      alert('Failed to join tournament. Please try again.')
    }
  }

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400'
      case 'active': return 'text-green-400'
      case 'completed': return 'text-blue-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen overflow-y-auto pb-24">
        <div className="px-4 py-6 text-center">
          <LoadingSpinner size="large" text="Loading tournaments..." color="primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">1v1 Challenges</h1>
          <p className="text-gray-300">Challenge other players and win USDT!</p>
        </div>

        {/* Balance Display */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Your Balance</span>
            </div>
            <span className="text-white font-bold">${userBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Challenge</span>
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Join Challenge</span>
          </button>
        </div>

        {/* Active Challenges */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Active Challenges</h3>
          
          {activeTournaments.length === 0 ? (
            <div className="card text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No active challenges</p>
              <p className="text-gray-500 text-sm">Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTournaments.map((tournament) => (
                <div key={tournament.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">
                        ${tournament.entryFee} Entry
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">
                        {tournament.players.length}/2 Players
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className={`text-sm font-medium ${getDifficultyColor(tournament.difficulty)}`}>
                        {tournament.difficulty.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-bold">
                        Prize: ${tournament.prize}
                      </span>
                    </div>
                    
                    {tournament.status === 'waiting' && tournament.players.length < 2 && (
                      <button
                        onClick={() => handleJoinTournament(tournament.id)}
                        className="btn-primary btn-sm"
                      >
                        Join
                      </button>
                    )}
                    
                    {tournament.status === 'active' && tournament.players.some(p => p.userId === dataService.getUserData().userId) && (
                      <button
                        onClick={() => window.location.href = `/tournament/${tournament.id}`}
                        className="btn-primary btn-sm"
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Challenges */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">My Challenges</h3>
          
          {userTournaments.length === 0 ? (
            <div className="card text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No challenges yet</p>
              <p className="text-gray-500 text-sm">Join or create a challenge to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userTournaments.slice(0, 5).map((tournament) => (
                <div key={tournament.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      ${tournament.entryFee} Entry
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${getDifficultyColor(tournament.difficulty)}`}>
                      {tournament.difficulty.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(tournament.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {tournament.status === 'completed' && tournament.finalScores && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Your Score:</span>
                        <span className="text-white font-bold">
                          {tournament.finalScores.find(s => s.userId === dataService.getUserData().userId)?.score || 0}
                        </span>
                      </div>
                      {tournament.winner === dataService.getUserData().userId && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">You Won!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Create Challenge</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Entry Fee (USDT)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={createForm.entryFee}
                  onChange={(e) => setCreateForm({...createForm, entryFee: parseFloat(e.target.value)})}
                  className="input-field w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={createForm.difficulty}
                  onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div className="bg-blue-500/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Prize Pool:</span>
                  <span className="text-green-400 font-bold">
                    ${(createForm.entryFee * 2).toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Winner takes all (2 players × ${createForm.entryFee})
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTournament}
                disabled={userBalance < createForm.entryFee}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Tournament Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Join Challenge</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Challenge ID
                </label>
                <input
                  type="text"
                  value={joinForm.tournamentId}
                  onChange={(e) => setJoinForm({...joinForm, tournamentId: e.target.value})}
                  className="input-field w-full"
                  placeholder="Enter challenge ID"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleJoinTournament(joinForm.tournamentId)}
                className="btn-primary flex-1"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tournament
