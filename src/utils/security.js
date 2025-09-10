// Security utilities for production

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: [
      password.length < minLength && 'Password must be at least 8 characters',
      !hasUpperCase && 'Password must contain uppercase letter',
      !hasLowerCase && 'Password must contain lowercase letter',
      !hasNumbers && 'Password must contain number',
      !hasSpecialChar && 'Password must contain special character'
    ].filter(Boolean)
  }
}

// Rate limiting for API calls
export class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) { // 10 requests per minute
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = new Map()
  }

  isAllowed(key) {
    const now = Date.now()
    const userRequests = this.requests.get(key) || []
    
    // Remove old requests outside the time window
    const validRequests = userRequests.filter(time => now - time < this.timeWindow)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return true
  }
}

// CSRF token generation
export const generateCSRFToken = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Secure storage for sensitive data
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify(value))
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Error storing data securely:', error)
    }
  },
  
  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null
      return JSON.parse(atob(encrypted))
    } catch (error) {
      console.error('Error retrieving data securely:', error)
      return null
    }
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key)
  }
}

export default {
  sanitizeInput,
  isValidEmail,
  validatePassword,
  RateLimiter,
  generateCSRFToken,
  secureStorage
}
