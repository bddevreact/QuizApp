// Environment configuration for production
const config = {
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  
  // Firebase Configuration
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  
  // OpenAI Configuration
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  
  // App Configuration
  APP_NAME: 'Crypto Quiz App',
  APP_VERSION: '1.0.0',
  
  // Security
  ADMIN_CREDENTIALS: {
    username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
  },
  
  // Feature Flags
  FEATURES: {
    AI_QUESTIONS: import.meta.env.VITE_ENABLE_AI_QUESTIONS === 'true',
    TELEGRAM_INTEGRATION: import.meta.env.VITE_ENABLE_TELEGRAM === 'true',
    ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  },
  
  // Performance
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    API_TIMEOUT: 10000,
    CACHE_DURATION: 300000 // 5 minutes
  },
  
  // Error Handling
  ERROR_HANDLING: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    LOG_ERRORS: import.meta.env.NODE_ENV === 'production'
  }
}

// Validation
const validateConfig = () => {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID'
  ]
  
  const missing = required.filter(key => !config[key])
  
  if (missing.length > 0 && config.NODE_ENV === 'production') {
    console.warn('Missing required environment variables:', missing)
  }
  
  return missing.length === 0
}

// Validate configuration
validateConfig()

export default config
