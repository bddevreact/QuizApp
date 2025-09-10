import React, { useState } from 'react'
import { X, Upload, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import taskVerificationService from '../services/taskVerificationService'

const TaskVerificationModal = ({ isOpen, onClose, task, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    screenshot: null,
    taskUrl: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          screenshot: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.screenshot || !formData.taskUrl) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const userData = JSON.parse(localStorage.getItem('quizApp_userData') || '{}')
      const result = await taskVerificationService.submitTaskProof(
        task.id,
        userData.userId,
        formData
      )

      if (result.success) {
        setSubmitStatus('success')
        setTimeout(() => {
          onSuccess && onSuccess()
          onClose()
        }, 2000)
      } else {
        setSubmitStatus('error')
        alert(result.message)
      }
    } catch (error) {
      setSubmitStatus('error')
      alert('Failed to submit proof. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      username: '',
      screenshot: null,
      taskUrl: '',
      description: ''
    })
    setSubmitStatus(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Submit Task Proof</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Task Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">
                Reward: ${task.reward} USDT
              </span>
              <a
                href={task.taskUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open Task
              </a>
            </div>
          </div>

          {/* Submit Status */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-800 font-medium">
                  Proof submitted successfully! Waiting for admin review.
                </span>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-800 font-medium">
                  Failed to submit proof. Please try again.
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username/ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username or ID from the task"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="taskUrl"
                value={formData.taskUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/task"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screenshot <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot-upload"
                  required
                />
                <label
                  htmlFor="screenshot-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {formData.screenshot ? 'Screenshot uploaded' : 'Click to upload screenshot'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </label>
              </div>
              {formData.screenshot && (
                <div className="mt-2">
                  <img
                    src={formData.screenshot}
                    alt="Screenshot preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Any additional information about your completion..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Your proof will be reviewed by admin within 24 hours</span>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.username || !formData.screenshot || !formData.taskUrl}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Proof'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TaskVerificationModal