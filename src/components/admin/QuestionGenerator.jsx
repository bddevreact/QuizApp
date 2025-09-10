import React, { useState, useEffect } from 'react'
import { Bot, Settings, Download, Upload, Trash2, Edit, Check, X, Loader, AlertCircle } from 'lucide-react'
import aiQuestionService from '../../services/aiQuestionService'
import dataService from '../../services/dataService'

const QuestionGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy')
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [availableTopics, setAvailableTopics] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Load API key if available
    const storedApiKey = localStorage.getItem('openai_api_key')
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }
    
    // Load available topics
    setAvailableTopics(aiQuestionService.getAvailableTopics())
  }, [])

  const handleGenerateQuestions = async () => {
    if (!aiQuestionService.isConfigured() && !apiKey) {
      setShowApiKeyModal(true)
      return
    }

    setIsGenerating(true)
    setError('')
    setSuccess('')

    try {
      let questions = []
      
      if (selectedTopic) {
        questions = await aiQuestionService.generateQuestionsByCategory(
          selectedTopic, 
          selectedDifficulty, 
          questionCount
        )
      } else {
        questions = await aiQuestionService.generateQuestions(
          selectedDifficulty, 
          questionCount
        )
      }

      setGeneratedQuestions(questions)
      setSuccess(`Successfully generated ${questions.length} questions!`)
    } catch (error) {
      setError(`Failed to generate questions: ${error.message}`)
      console.error('Question generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      aiQuestionService.setApiKey(apiKey.trim())
      setShowApiKeyModal(false)
      setSuccess('API key saved successfully!')
    }
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion({ ...question })
  }

  const handleSaveEdit = () => {
    if (editingQuestion) {
      const validation = aiQuestionService.validateQuestion(editingQuestion)
      if (validation.isValid) {
        setGeneratedQuestions(prev => 
          prev.map(q => q.id === editingQuestion.id ? editingQuestion : q)
        )
        setEditingQuestion(null)
        setSuccess('Question updated successfully!')
      } else {
        setError(`Invalid question: ${validation.errors.join(', ')}`)
      }
    }
  }

  const handleDeleteQuestion = (questionId) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId))
    setSuccess('Question deleted!')
  }

  const handleSaveToDatabase = async () => {
    try {
      // Add generated questions to Firebase
      for (const question of generatedQuestions) {
        await dataService.addQuestion(question)
      }
      
      setSuccess(`Saved ${generatedQuestions.length} questions to database!`)
      setGeneratedQuestions([])
    } catch (error) {
      setError(`Failed to save questions: ${error.message}`)
    }
  }

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(generatedQuestions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `questions_${selectedDifficulty}_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    setSuccess('Questions exported successfully!')
  }

  const handleImportQuestions = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          if (Array.isArray(imported)) {
            setGeneratedQuestions(imported)
            setSuccess(`Imported ${imported.length} questions!`)
          } else {
            setError('Invalid file format')
          }
        } catch (error) {
          setError('Failed to parse imported file')
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Question Generator</h1>
            <p className="text-gray-400 text-sm">Generate crypto quiz questions using AI</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>API Settings</span>
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-green-400">{success}</span>
        </div>
      )}

      {/* Generation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Question Count</label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Topic (Optional)</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Random Topic</option>
            {availableTopics[selectedDifficulty]?.map((topic, index) => (
              <option key={index} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
          >
            {isGenerating ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Questions'}</span>
          </button>
        </div>
      </div>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Generated Questions ({generatedQuestions.length})
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleExportQuestions}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleSaveToDatabase}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Save to DB</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <div key={question.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{question.category}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-white font-medium mb-3">{question.question}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 rounded text-sm ${
                        optionIndex === question.correct
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                  <p className="text-blue-300 text-sm">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import Questions */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-medium mb-3">Import Questions</h3>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".json"
            onChange={handleImportQuestions}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </label>
          <span className="text-gray-400 text-sm">
            Import previously exported question files
          </span>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">OpenAI API Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Your API key is stored locally and used to generate questions via OpenAI's API.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Edit Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Question</label>
                <textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
                {editingQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <span className="text-white font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options]
                        newOptions[index] = e.target.value
                        setEditingQuestion({...editingQuestion, options: newOptions})
                      }}
                      className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setEditingQuestion({...editingQuestion, correct: index})}
                      className={`px-3 py-1 rounded text-sm ${
                        editingQuestion.correct === index
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      Correct
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Explanation</label>
                <textarea
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionGenerator
