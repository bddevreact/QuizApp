import React, { useState, useEffect } from 'react'
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download, 
  CheckCircle,
  XCircle,
  BookOpen,
  BarChart3,
  Bot,
  Database
} from 'lucide-react'
import dataService from '../../services/dataService'
import QuestionGenerator from '../../components/admin/QuestionGenerator'
import QuestionManager from '../../components/admin/QuestionManager'

const AdminQuiz = () => {
  const [activeTab, setActiveTab] = useState('predefined')
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: 'crypto_basics',
    difficulty: 'easy',
    points: 10
  })

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [questions, searchTerm, categoryFilter])

  const loadQuestions = async () => {
    try {
      // Get questions from all difficulties
      const easyQuestions = await dataService.getQuizQuestions('easy', 1000)
      const mediumQuestions = await dataService.getQuizQuestions('medium', 1000)
      const hardQuestions = await dataService.getQuizQuestions('hard', 1000)
      
      // Combine all questions
      const allQuestions = [
        ...(Array.isArray(easyQuestions) ? easyQuestions : []),
        ...(Array.isArray(mediumQuestions) ? mediumQuestions : []),
        ...(Array.isArray(hardQuestions) ? hardQuestions : [])
      ]
      
      setQuestions(allQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
      setQuestions([])
    }
  }

  const filterQuestions = () => {
    let filtered = questions

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(q => q.category === categoryFilter)
    }

    setFilteredQuestions(filtered)
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question || newQuestion.options.some(opt => !opt) || !newQuestion.explanation) {
      alert('Please fill in all required fields')
      return
    }

    const questionToAdd = {
      id: Date.now(),
      ...newQuestion,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    setQuestions(prev => [...prev, questionToAdd])
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: 'crypto_basics',
      difficulty: 'easy',
      points: 10
    })
    setShowAddModal(false)
  }

  const handleDeleteQuestion = (questionId) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== questionId))
    }
  }

  const toggleQuestionStatus = (questionId) => {
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, isActive: !q.isActive } : q)
    )
  }

  const exportQuestions = () => {
    const csvContent = [
      ['ID', 'Question', 'Category', 'Difficulty', 'Points', 'Status'],
      ...filteredQuestions.map(q => [
        q.id,
        q.question,
        q.category,
        q.difficulty,
        q.points,
        q.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quiz_questions_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDifficultyBadge = (difficulty) => {
    const config = {
      easy: { color: 'bg-green-100 text-green-800', text: 'Easy' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Medium' },
      hard: { color: 'bg-red-100 text-red-800', text: 'Hard' }
    }
    
    const diff = config[difficulty] || config.medium
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${diff.color}`}>
        {diff.text}
      </span>
    )
  }

  const getCategoryBadge = (category) => {
    const config = {
      crypto_basics: { color: 'bg-blue-100 text-blue-800', text: 'Crypto Basics' },
      blockchain: { color: 'bg-purple-100 text-purple-800', text: 'Blockchain' },
      trading: { color: 'bg-green-100 text-green-800', text: 'Trading' },
      defi: { color: 'bg-orange-100 text-orange-800', text: 'DeFi' },
      nft: { color: 'bg-pink-100 text-pink-800', text: 'NFT' }
    }
    
    const cat = config[category] || config.crypto_basics
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${cat.color}`}>
        {cat.text}
      </span>
    )
  }

  const getStatusBadge = (isActive) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
              <p className="text-gray-600">Manage quiz questions, categories, and difficulty levels</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportQuestions}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('predefined')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'predefined'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Predefined Questions</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ai-generator')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ai-generator'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>AI Question Generator</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ai-manager')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ai-manager'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>AI Questions Manager</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'ai-generator' && <QuestionGenerator />}
        {activeTab === 'ai-manager' && <QuestionManager />}
        
        {activeTab === 'predefined' && (
          <>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {questions.filter(q => q.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(questions.map(q => q.category)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {questions.length > 0 ? Math.round(questions.reduce((sum, q) => sum + (q.points || 0), 0) / questions.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="crypto_basics">Crypto Basics</option>
                <option value="blockchain">Blockchain</option>
                <option value="trading">Trading</option>
                <option value="defi">DeFi</option>
                <option value="nft">NFT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {question.question}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {question.options[question.correctAnswer]} ✓
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(question.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDifficultyBadge(question.difficulty)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {question.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(question.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleQuestionStatus(question.id)}
                          className={`p-1 ${question.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={question.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {question.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Question</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your question here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === index}
                        onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options]
                          newOptions[index] = e.target.value
                          setNewQuestion({...newQuestion, options: newOptions})
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Explanation *</label>
                  <textarea
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why this is the correct answer..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="crypto_basics">Crypto Basics</option>
                      <option value="blockchain">Blockchain</option>
                      <option value="trading">Trading</option>
                      <option value="defi">DeFi</option>
                      <option value="nft">NFT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                    <input
                      type="number"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminQuiz
