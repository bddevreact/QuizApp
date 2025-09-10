// Telegram Mini App Detection and User Management Service
class TelegramService {
  constructor() {
    this.isTelegramUser = false
    this.telegramData = null
    this.userId = null
    this.referralCode = null
  }

  // Detect if user is from Telegram Mini App
  detectTelegramUser() {
    try {
      // Check if we're in Telegram WebApp environment
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp
        
        // Initialize Telegram WebApp
        tg.ready()
        tg.expand()
        
        // Get user data from Telegram
        const user = tg.initDataUnsafe?.user
        if (user) {
          this.isTelegramUser = true
          this.telegramData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            language_code: user.language_code,
            is_premium: user.is_premium,
            photo_url: user.photo_url
          }
          
          // Generate unique user ID
          this.userId = `tg_${user.id}`
          
          // Generate referral code
          this.referralCode = this.generateReferralCode(user.id)
          
          console.log('Telegram user detected:', this.telegramData)
          return true
        }
      }
      
      // Check URL parameters for referral links
      const urlParams = new URLSearchParams(window.location.search)
      const refCode = urlParams.get('ref')
      if (refCode) {
        this.referralCode = refCode
        console.log('Referral code detected:', refCode)
      }
      
      return false
    } catch (error) {
      console.error('Error detecting Telegram user:', error)
      return false
    }
  }

  // Generate referral code based on user ID
  generateReferralCode(userId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'TG'
    
    // Add user ID hash
    const hash = this.simpleHash(userId.toString())
    for (let i = 0; i < 6; i++) {
      result += chars[hash % chars.length]
      hash = Math.floor(hash / chars.length)
    }
    
    return result
  }

  // Simple hash function
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Generate referral URL
  generateReferralURL() {
    if (!this.referralCode) return null
    
    const baseURL = window.location.origin
    return `${baseURL}?ref=${this.referralCode}`
  }

  // Get user type
  getUserType() {
    return this.isTelegramUser ? 'telegram' : 'external'
  }

  // Get user data
  getUserData() {
    if (this.isTelegramUser) {
      return {
        userId: this.userId,
        telegramId: this.telegramData.id,
        username: this.telegramData.username || `${this.telegramData.first_name}_${this.telegramData.last_name || ''}`.trim(),
        fullName: `${this.telegramData.first_name} ${this.telegramData.last_name || ''}`.trim(),
        photoUrl: this.telegramData.photo_url,
        languageCode: this.telegramData.language_code,
        isPremium: this.telegramData.is_premium,
        userType: 'telegram',
        referralCode: this.referralCode,
        referralURL: this.generateReferralURL(),
        joinDate: new Date().toISOString()
      }
    } else {
      // External user (development)
      return {
        userId: `ext_${Date.now()}`,
        username: 'External User',
        fullName: 'External User',
        userType: 'external',
        referralCode: this.referralCode,
        joinDate: new Date().toISOString()
      }
    }
  }

  // Check if user clicked referral link
  getReferralSource() {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('ref')
  }

  // Initialize user session
  async initializeUser() {
    const isTelegram = this.detectTelegramUser()
    const userData = this.getUserData()
    const referralSource = this.getReferralSource()
    
    return {
      isTelegramUser: isTelegram,
      userData,
      referralSource,
      shouldStoreInFirebase: isTelegram
    }
  }

  // Get Telegram WebApp instance
  getTelegramWebApp() {
    return window.Telegram?.WebApp || null
  }

  // Show Telegram alert
  showAlert(message) {
    const tg = this.getTelegramWebApp()
    if (tg) {
      tg.showAlert(message)
    } else {
      alert(message)
    }
  }

  // Show Telegram confirm
  showConfirm(message, callback) {
    const tg = this.getTelegramWebApp()
    if (tg) {
      tg.showConfirm(message, callback)
    } else {
      const result = confirm(message)
      if (callback) callback(result)
    }
  }

  // Close Telegram WebApp
  close() {
    const tg = this.getTelegramWebApp()
    if (tg) {
      tg.close()
    }
  }
}

// Create singleton instance
const telegramService = new TelegramService()

export default telegramService
