// Test script to set up sample wallet addresses in Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample wallet addresses
const sampleWallets = [
  {
    network: 'TRC20',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    name: 'Main TRC20 Wallet',
    isActive: true,
    minDeposit: 1,
    maxDeposit: 10000,
    processingTime: '5-10 minutes'
  },
  {
    network: 'BEP20',
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    name: 'Main BEP20 Wallet',
    isActive: true,
    minDeposit: 1,
    maxDeposit: 10000,
    processingTime: '3-5 minutes'
  },
  {
    network: 'ERC20',
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    name: 'Main ERC20 Wallet',
    isActive: true,
    minDeposit: 5,
    maxDeposit: 10000,
    processingTime: '10-15 minutes'
  }
]

async function setupSampleWallets() {
  try {
    console.log('Setting up sample wallet addresses...')
    
    for (const wallet of sampleWallets) {
      await addDoc(collection(db, 'wallet_addresses'), {
        ...wallet,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      console.log(`Added ${wallet.network} wallet: ${wallet.address}`)
    }
    
    console.log('Sample wallet addresses setup complete!')
  } catch (error) {
    console.error('Error setting up wallet addresses:', error)
  }
}

// Run the setup
setupSampleWallets()
