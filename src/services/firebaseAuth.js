// Firebase Authentication Service
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider
} from 'firebase/auth'
import { auth } from '../config/firebase'
import firebaseService from './firebaseService'

class FirebaseAuthService {
  constructor() {
    this.currentUser = null
    this.authStateListeners = []
    
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user
      this.authStateListeners.forEach(listener => listener(user))
    })
  }

  // Authentication state listener
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback)
    return () => {
      this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback)
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  // Create account with email and password
  async createAccountWithEmail(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Update user profile
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName })
      }
      
      // Create user document in Firestore
      await firebaseService.createUser({
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || user.displayName,
        photoURL: userData.photoURL || user.photoURL,
        ...userData
      })
      
      return user
    } catch (error) {
      console.error('Error creating account:', error)
      throw error
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Check if user exists in Firestore, if not create
      const existingUser = await firebaseService.getUser(user.uid)
      if (!existingUser) {
        await firebaseService.createUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google'
        })
      }
      
      return user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  // Sign in with Facebook
  async signInWithFacebook() {
    try {
      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Check if user exists in Firestore, if not create
      const existingUser = await firebaseService.getUser(user.uid)
      if (!existingUser) {
        await firebaseService.createUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'facebook'
        })
      }
      
      return user
    } catch (error) {
      console.error('Error signing in with Facebook:', error)
      throw error
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth)
      this.currentUser = null
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in')
      }
      
      await updateProfile(this.currentUser, updates)
      
      // Update user document in Firestore
      await firebaseService.updateUser(this.currentUser.uid, updates)
      
      return this.currentUser
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Telegram Mini App authentication
  async authenticateWithTelegram(telegramData) {
    try {
      // For Telegram Mini Apps, we'll use the telegram data to create/update user
      const { id, first_name, last_name, username, photo_url } = telegramData
      
      // Check if user exists by telegram ID
      let user = await firebaseService.getUserByTelegramId(id.toString())
      
      if (user) {
        // Update existing user
        await firebaseService.updateUser(user.id, {
          telegramId: id.toString(),
          telegramUsername: username,
          telegramFullName: `${first_name} ${last_name || ''}`.trim(),
          telegramPhotoUrl: photo_url,
          lastLogin: new Date().toISOString()
        })
      } else {
        // Create new user
        user = await firebaseService.createUser({
          telegramId: id.toString(),
          telegramUsername: username,
          telegramFullName: `${first_name} ${last_name || ''}`.trim(),
          telegramPhotoUrl: photo_url,
          totalEarned: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          availableBalance: 0,
          level: 1,
          xp: 0,
          rank: 'Bronze',
          streak: 0,
          dailyQuizzesCompleted: 0,
          maxDailyQuizzes: 10,
          questionsAnswered: 0,
          correctAnswers: 0,
          averageScore: 0,
          joinDate: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          isVerified: false,
          withdrawalEnabled: false,
          referralCode: this.generateReferralCode(),
          invitedFriends: 0,
          maxInvites: 10
        })
      }
      
      return user
    } catch (error) {
      console.error('Error authenticating with Telegram:', error)
      throw error
    }
  }

  // Generate referral code
  generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Admin authentication
  async authenticateAdmin(email, password) {
    try {
      const user = await this.signInWithEmail(email, password)
      
      // Check if user has admin privileges
      const userData = await firebaseService.getUser(user.uid)
      if (!userData || !userData.isAdmin) {
        await this.signOut()
        throw new Error('Access denied. Admin privileges required.')
      }
      
      return user
    } catch (error) {
      console.error('Error authenticating admin:', error)
      throw error
    }
  }

  // Check if current user is admin
  async isCurrentUserAdmin() {
    try {
      if (!this.currentUser) return false
      
      const userData = await firebaseService.getUser(this.currentUser.uid)
      return userData && userData.isAdmin
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }
}

// Create singleton instance
const firebaseAuthService = new FirebaseAuthService()

export default firebaseAuthService
