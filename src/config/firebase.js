// Firebase Configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBV2-mYjI6z1kR1r5ip5_SIeJywmK6Rly4",
  authDomain: "quiz-app-81036.firebaseapp.com",
  projectId: "quiz-app-81036",
  storageBucket: "quiz-app-81036.firebasestorage.app",
  messagingSenderId: "508287482023",
  appId: "1:508287482023:web:241e8797f62f3668520382",
  measurementId: "G-HJRN3KCCPT"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

export default app
