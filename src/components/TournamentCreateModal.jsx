import React, { useState } from 'react'
import { X, Trophy, Users, DollarSign, Clock, AlertCircle } from 'lucide-react'
import tournamentService from '../services/tournamentService'

const TournamentCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entryFee: 1,
    maxParticipants: 100,
    timeLimit: 300 // 5 minutes
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsCreating(true)

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Tournament name is required')
      }
      if (formData.entryFee < 1) {
        throw new Error('Entry fee must be at least $1')
      }
      if (formData.maxParticipants < 2) {
        throw new Error('Maximum participants must be at least 2')
      }

      // Create tournament
      const result = await tournamentService.createTournament(formData)
      
      if (result.success) {
        alert('Tournament created successfully! All users have been notified.')
        onSuccess(result.tournament)
        onClose()
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          entryFee: 1,
          maxParticipants: 100,
          timeLimit: 300
        })
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[85vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900 flex items-center">
              <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
              Create Tournament
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span className="text-red-700 text-xs">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tournament Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter tournament name"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description (optional)"
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Entry Fee ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  min="1"
                  step="0.1"
                  className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Min $1</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Players <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="2"
                  max="1000"
                  className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">2-1000</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Time Limit (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit / 60}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  timeLimit: (parseFloat(e.target.value) || 0) * 60
                }))}
                min="1"
                max="60"
                step="1"
                className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">1-60 minutes</p>
          </div>

          {/* Tournament Rules */}
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <h4 className="text-xs font-medium text-blue-900 mb-1">Tournament Rules</h4>
            <ul className="text-xs text-blue-800 space-y-0.5">
              <li>• Entry fee deducted from balance</li>
              <li>• Winner gets 80%, App gets 20%</li>
              <li>• All users notified</li>
            </ul>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center space-x-1"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-3 h-3" />
                  <span>Create</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TournamentCreateModal
