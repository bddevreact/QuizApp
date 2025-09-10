import React, { useState, useEffect } from 'react'
import { Database, Search, Filter, Edit, Trash2, Eye, EyeOff, BarChart3, Download, Upload } from 'lucide-react'
import dataService from '../../services/dataService'

const QuestionManager = () => {
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    status: '',
    source: '',
    search: ''
  })
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [showStats, setShowStats] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [viewingQuestion, setViewingQuestion] = useState(null)

  useEffect(() => {
    loadQuestions()
    loadStats()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [questions, filters])

  const loadQuestions = async () => {
    try {
      const allQuestions = await dataService.getAllAIQuestions()
      setQuestions(allQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
      setQuestions([])
    }
  }

  const loadStats = async () => {
    try {
      const questionStats = await dataService.getQuestionStats()
      setStats(questionStats)
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats({})
    }
  }

  const applyFilters = () => {
    let filtered = [...questions]

    // Apply difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty)
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(q => q.category === filters.category)
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(q => q.status === filters.status)
    }

    // Apply source filter
    if (filters.source) {
      filtered = filtered.filter(q => q.source === filters.source)
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm) ||
        q.category.toLowerCase().includes(searchTerm) ||
        q.explanation.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredQuestions(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id))
    }
  }

  const handleToggleStatus = async (questionId) => {
    try {
      const question = questions.find(q => q.id === questionId)
      if (question) {
        const newStatus = question.status === 'active' ? 'inactive' : 'active'
        await dataService.updateQuestion(questionId, { status: newStatus })
        await loadQuestions()
        await loadStats()
      }
    } catch (error) {
      console.error('Error toggling question status:', error)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await dataService.deleteQuestion(questionId)
        await loadQuestions()
        await loadStats()
      } catch (error) {
        console.error('Error deleting question:', error)
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedQuestions.length} questions?`)) {
      try {
        for (const id of selectedQuestions) {
          await dataService.deleteQuestion(id)
        }
        setSelectedQuestions([])
        await loadQuestions()
        await loadStats()
      } catch (error) {
        console.error('Error bulk deleting questions:', error)
      }
    }
  }

  const handleBulkToggleStatus = async (status) => {
    if (selectedQuestions.length === 0) return
    
    try {
      for (const id of selectedQuestions) {
        await dataService.updateQuestion(id, { status })
      }
      setSelectedQuestions([])
      await loadQuestions()
      await loadStats()
    } catch (error) {
      console.error('Error bulk updating question status:', error)
    }
  }

  const handleExportQuestions = () => {
    const questionsToExport = selectedQuestions.length > 0 
      ? questions.filter(q => selectedQuestions.includes(q.id))
      : filteredQuestions

    const dataStr = JSON.stringify(questionsToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `questions_export_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportQuestions = async (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          if (Array.isArray(imported)) {
            for (const question of imported) {
              await dataService.addQuestion(question)
            }
            await loadQuestions()
            await loadStats()
            alert(`Imported ${imported.length} questions successfully!`)
          } else {
            alert('Invalid file format')
          }
        } catch (error) {
          alert('Failed to parse imported file')
        }
      }
      reader.readAsText(file)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'hard': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'inactive': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getSourceColor = (source) => {
    switch (source) {
      case 'ai': return 'text-blue-400 bg-blue-400/10'
      case 'fallback': return 'text-orange-400 bg-orange-400/10'
      case 'manual': return 'text-purple-400 bg-purple-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(questions.map(q => q.category))]
    return categories.sort()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Question Manager</h1>
            <p className="text-gray-400 text-sm">Manage AI-generated quiz questions</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </button>
          
          <input
            type="file"
            accept=".json"
            onChange={handleImportQuestions}
            className="hidden"
            id="import-questions"
          />
          <label
            htmlFor="import-questions"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </label>
          
          <button
            onClick={handleExportQuestions}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Question Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-gray-400 text-sm">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
              <div className="text-gray-400 text-sm">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.bySource?.ai || 0}</div>
              <div className="text-gray-400 text-sm">AI Generated</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">By Difficulty</h4>
              <div className="space-y-2">
                {Object.entries(stats.byDifficulty || {}).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{difficulty}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">By Source</h4>
              <div className="space-y-2">
                {Object.entries(stats.bySource || {}).map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{source}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Top Categories</h4>
              <div className="space-y-2">
                {Object.entries(stats.byCategory || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-gray-300 truncate">{category}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Sources</option>
              <option value="ai">AI Generated</option>
              <option value="fallback">Fallback</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ difficulty: '', category: '', status: '', source: '', search: '' })}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-300">
              {selectedQuestions.length} question(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkToggleStatus('active')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkToggleStatus('inactive')}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
              >
                Deactivate
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Questions ({filteredQuestions.length})
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {selectedQuestions.length === filteredQuestions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {filteredQuestions.map((question, index) => (
            <div key={question.id} className="p-4 hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(question.id)}
                  onChange={() => handleQuestionSelect(question.id)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(question.status)}`}>
                      {question.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceColor(question.source)}`}>
                      {question.source}
                    </span>
                    <span className="text-xs text-gray-500">{question.category}</span>
                  </div>
                  
                  <h4 className="text-white font-medium mb-2 line-clamp-2">
                    {question.question}
                  </h4>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Created: {new Date(question.createdAt).toLocaleDateString()}</span>
                    <span>Options: {question.options?.length || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewingQuestion(question)}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    title="View Question"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingQuestion(question)}
                    className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                    title="Edit Question"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(question.id)}
                    className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                    title={question.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {question.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="p-8 text-center">
            <Database className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No questions found</h3>
            <p className="text-gray-500">
              {questions.length === 0 
                ? "No questions have been generated yet. Use the AI Question Generator to create some!"
                : "Try adjusting your filters to see more questions."
              }
            </p>
          </div>
        )}
      </div>

      {/* View Question Modal */}
      {viewingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Question Details</h3>
              <button
                onClick={() => setViewingQuestion(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(viewingQuestion.difficulty)}`}>
                  {viewingQuestion.difficulty}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(viewingQuestion.status)}`}>
                  {viewingQuestion.status}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceColor(viewingQuestion.source)}`}>
                  {viewingQuestion.source}
                </span>
                <span className="text-xs text-gray-500">{viewingQuestion.category}</span>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Question</h4>
                <p className="text-gray-300">{viewingQuestion.question}</p>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Options</h4>
                <div className="space-y-2">
                  {viewingQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        index === viewingQuestion.correct
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Explanation</h4>
                <p className="text-gray-300">{viewingQuestion.explanation}</p>
              </div>
              
              <div className="text-sm text-gray-400">
                <p>Created: {new Date(viewingQuestion.createdAt).toLocaleString()}</p>
                <p>ID: {viewingQuestion.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionManager
