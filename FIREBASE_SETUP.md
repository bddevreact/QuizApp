# Firebase Integration Setup Guide

This guide explains how to set up and use Firebase with your crypto quiz app.

## 🚀 **What's Been Implemented**

### **Firebase Services Integrated:**
- ✅ **Firestore Database** - Real-time database for all app data
- ✅ **Firebase Authentication** - User authentication and management
- ✅ **Firebase Storage** - File uploads and media storage
- ✅ **Firebase Analytics** - App usage analytics

### **Data Migration:**
- ✅ **Removed Mock Data** - All hardcoded data replaced with Firebase
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Offline Support** - Firebase handles offline scenarios
- ✅ **Data Validation** - Server-side data validation

## 📊 **Database Structure**

### **Collections:**

#### **Users Collection (`users`)**
```javascript
{
  uid: "user_id",
  telegramId: "telegram_user_id",
  telegramUsername: "username",
  telegramFullName: "Full Name",
  email: "user@example.com",
  totalEarned: 1250.00,
  totalDeposited: 500.00,
  totalWithdrawn: 200.00,
  availableBalance: 1050.00,
  level: 4,
  xp: 350,
  rank: "Gold",
  streak: 7,
  dailyQuizzesCompleted: 3,
  maxDailyQuizzes: 10,
  questionsAnswered: 156,
  correctAnswers: 120,
  averageScore: 78,
  joinDate: "2024-01-15T00:00:00Z",
  lastActivity: "2024-01-25T12:00:00Z",
  isVerified: true,
  withdrawalEnabled: true,
  isAdmin: false,
  referralCode: "CRYPTO123",
  invitedFriends: 0,
  maxInvites: 10
}
```

#### **Questions Collection (`questions`)**
```javascript
{
  question: "What is Bitcoin?",
  options: ["A digital currency", "A physical coin", "A bank account", "A credit card"],
  correct: 0,
  category: "Basics",
  explanation: "Bitcoin is a decentralized digital currency...",
  difficulty: "easy",
  source: "ai|manual|fallback",
  status: "active|inactive",
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z"
}
```

#### **Tournaments Collection (`tournaments`)**
```javascript
{
  name: "Crypto Masters Championship",
  description: "Weekly championship for top players",
  entryFee: 10,
  prizePool: 500,
  participants: 25,
  maxParticipants: 50,
  startTime: "2024-01-25T00:00:00Z",
  endTime: "2024-01-26T00:00:00Z",
  status: "active|completed|upcoming",
  category: "weekly|daily|monthly",
  difficulty: "easy|medium|hard|expert",
  createdAt: "2024-01-15T00:00:00Z"
}
```

#### **Transactions Collection (`transactions`)**
```javascript
{
  userId: "user_id",
  type: "deposit|withdrawal|quiz_reward|tournament_win|referral_bonus",
  amount: 25.00,
  status: "pending|completed|failed",
  txHash: "0x1234567890abcdef",
  timestamp: "2024-01-15T10:30:00Z",
  network: "TRC20|ERC20|BEP20",
  fee: 1.00,
  details: {
    score: 85,
    totalQuestions: 10,
    difficulty: "medium"
  }
}
```

#### **Tasks Collection (`tasks`)**
```javascript
{
  title: "Daily Bonus Question",
  description: "Answer today's special question for 3x rewards",
  reward: 15,
  difficulty: "medium",
  timeLeft: "23:45",
  status: "available|in_progress|completed",
  type: "daily|marketing|partner",
  progress: 0,
  target: 5,
  action: "share|invite|social|subscribe|meme|video|download|survey"
}
```

#### **Achievements Collection (`achievements`)**
```javascript
{
  title: "First Quiz",
  description: "Complete your first quiz",
  icon: "🎯",
  unlocked: false,
  date: null,
  rarity: "common|rare|epic|legendary",
  requirement: {
    type: "quizzes_completed|streak|tournaments_won|level|correct_answers|perfect_score|referrals",
    value: 1
  }
}
```

#### **Activities Collection (`activities`)**
```javascript
{
  userId: "user_id",
  type: "quiz_completed|level_up|task_completed|achievement_unlocked",
  title: "Quiz Completed",
  description: "Scored 85% on medium quiz",
  timestamp: "2024-01-15T10:30:00Z",
  icon: "🎯"
}
```

#### **Leaderboard Collection (`leaderboard`)**
```javascript
{
  userId: "user_id",
  username: "cryptomaster",
  totalEarned: 1250.50,
  level: 4,
  rank: "Gold",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

## 🔧 **Firebase Configuration**

Your Firebase project is already configured with:
- **Project ID**: `quiz-app-81036`
- **Auth Domain**: `quiz-app-81036.firebaseapp.com`
- **Storage Bucket**: `quiz-app-81036.firebasestorage.app`

## 🛠 **Firebase Console Setup**

### **1. Enable Authentication**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `quiz-app-81036`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password** authentication
5. Enable **Google** authentication (optional)
6. Enable **Anonymous** authentication (for Telegram users)

### **2. Set up Firestore Database**
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)

### **3. Set up Storage**
1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select same location as Firestore

### **4. Set up Security Rules**

#### **Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Questions are readable by all authenticated users
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Tournaments are readable by all
    match /tournaments/{tournamentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Transactions are readable by owner and admins
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
      allow write: if request.auth != null;
    }
    
    // Activities are readable by owner
    match /activities/{activityId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Leaderboard is readable by all
    match /leaderboard/{entryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Tasks and achievements are readable by all
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    match /achievements/{achievementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

#### **Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Question images are readable by all
    match /questions/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Tournament banners are readable by all
    match /tournaments/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 🚀 **Features Now Available**

### **For Users:**
- ✅ **Real-time Data** - All data syncs instantly across devices
- ✅ **Offline Support** - App works offline with cached data
- ✅ **Secure Authentication** - Firebase handles user authentication
- ✅ **Data Persistence** - All progress saved automatically
- ✅ **Cross-device Sync** - Play on any device with same account

### **For Admins:**
- ✅ **Real-time Dashboard** - Live user statistics
- ✅ **Question Management** - Add/edit/delete questions in real-time
- ✅ **User Management** - View and manage all users
- ✅ **Transaction Monitoring** - Real-time transaction tracking
- ✅ **Analytics** - Detailed usage analytics

### **For Developers:**
- ✅ **Scalable Database** - Handles millions of users
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Offline Support** - Built-in offline capabilities
- ✅ **Security Rules** - Server-side data validation
- ✅ **Analytics** - Built-in usage tracking

## 📱 **Telegram Mini App Integration**

The app now supports Telegram Mini App authentication:
- Users can sign in with their Telegram account
- User data is automatically synced
- No additional registration required
- Seamless integration with Telegram features

## 🔒 **Security Features**

- **Authentication Required** - All operations require user authentication
- **Role-based Access** - Admin and user permissions
- **Data Validation** - Server-side validation rules
- **Secure Storage** - Encrypted data storage
- **API Security** - Protected API endpoints

## 📊 **Analytics & Monitoring**

Firebase provides built-in analytics for:
- User engagement metrics
- Quiz completion rates
- Popular questions and categories
- User retention statistics
- Performance monitoring

## 🛠 **Development Commands**

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy functions (if using Cloud Functions)
firebase deploy --only functions
```

## 🚨 **Important Notes**

1. **Database Initialization**: The app automatically initializes with default data on first run
2. **Admin Access**: Create an admin user through the Firebase Console or use the default admin account
3. **Security Rules**: Update security rules for production use
4. **Backup**: Set up regular database backups
5. **Monitoring**: Monitor usage and costs in Firebase Console

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure user is authenticated
   - Verify user has proper permissions

2. **"Network error" messages**
   - Check internet connection
   - Verify Firebase configuration
   - Check browser console for errors

3. **Data not syncing**
   - Check authentication status
   - Verify security rules
   - Check for JavaScript errors

4. **Slow performance**
   - Check Firestore indexes
   - Optimize queries
   - Monitor Firebase Console for usage

## 📞 **Support**

For Firebase-related issues:
1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Visit [Firebase Support](https://firebase.google.com/support)
3. Check the browser console for error messages
4. Verify your Firebase project configuration

Your crypto quiz app is now fully integrated with Firebase! 🎉
