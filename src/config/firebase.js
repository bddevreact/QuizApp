// Firebase Configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBV2-mYjI6z1kR1r5ip5_SIeJywmK6Rly4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quiz-app-81036.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quiz-app-81036",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quiz-app-81036.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "508287482023",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:508287482023:web:241e8797f62f3668520382",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HJRN3KCCPT"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

export default app
