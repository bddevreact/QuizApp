/**
 * Database Console Utilities
 * 
 * Quick console commands for database management
 * Usage: Import and use in browser console or add to window object
 */

import { 
  clearAllData, 
  clearUserDataOnly, 
  clearContentDataOnly, 
  clearLocalStorage, 
  getDatabaseStats, 
  resetDatabase 
} from './clearDatabase.js'

// Console-friendly database management
const DatabaseConsole = {
  // Quick stats
  async stats() {
    console.log('📊 Getting database statistics...')
    const stats = await getDatabaseStats()
    if (stats) {
      console.table(stats.collections)
      console.log(`Total documents: ${stats.totalDocuments}`)
    }
    return stats
  },

  // Quick clear all
  async clearAll() {
    console.log('🚨 Clearing all database data...')
    return await clearAllData()
  },

  // Quick clear users only
  async clearUsers() {
    console.log('🧹 Clearing user data only...')
    return await clearUserDataOnly()
  },

  // Quick clear content only
  async clearContent() {
    console.log('🧹 Clearing content data only...')
    return await clearContentDataOnly()
  },

  // Quick clear localStorage
  clearLocal() {
    console.log('🧹 Clearing localStorage...')
    const count = clearLocalStorage()
    console.log(`✅ Removed ${count} items from localStorage`)
    return count
  },

  // Quick reset
  async reset() {
    console.log('🔄 Resetting database...')
    return await resetDatabase()
  },

  // Help
  help() {
    console.log(`
🗄️ Database Console Commands:

📊 stats()           - Show database statistics
🚨 clearAll()        - Clear all database data
🧹 clearUsers()      - Clear user data only
🧹 clearContent()    - Clear content data only
🧹 clearLocal()      - Clear localStorage
🔄 reset()           - Reset database with fresh data
❓ help()            - Show this help

Examples:
  await db.stats()        // Get current stats
  await db.clearAll()     // Clear everything
  await db.reset()        // Reset to fresh state
    `)
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.db = DatabaseConsole
  console.log('🗄️ Database console available! Type "db.help()" for commands.')
}

export default DatabaseConsole
