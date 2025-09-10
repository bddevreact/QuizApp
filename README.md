# 🎯 CryptoQuiz - Telegram WebApp

A comprehensive cryptocurrency quiz application built with React, featuring betting mechanics, tournaments, and USDT rewards. Integrated with Telegram WebApp for seamless user experience.

## 🚀 Features

### 🎮 Core Features
- **Interactive Quiz System** with betting mechanics
- **Tournament System** with entry fees and prize distribution
- **Real-time Balance Management** (Playable & Bonus balances)
- **Telegram WebApp Integration** for user authentication
- **Responsive Design** optimized for mobile devices

### 💰 Financial Features
- **USDT Deposit/Withdrawal** with multiple network support
- **Admin Approval System** for deposit verification
- **Proof Submission** with screenshot upload
- **Tournament Entry Fees** and prize pool management
- **App Fee System** (20% on tournament winnings)

### 🏆 Tournament System
- **Create Tournaments** with custom entry fees
- **Join Tournaments** with balance validation
- **Real-time Notifications** for new tournaments
- **Prize Distribution** with automatic fee calculation
- **Tournament History** and statistics

### 📋 Task Management
- **Daily Tasks** with reward system
- **Marketing Tasks** with external link verification
- **Partner Tasks** with proof submission
- **Admin Verification** for task completion
- **Resubmission System** for rejected tasks

### 🔧 Admin Features
- **Comprehensive Dashboard** for system management
- **User Management** and transaction monitoring
- **Deposit Verification** with proof review
- **Wallet Settings** for multiple networks
- **Tournament Management** and analytics
- **Task Verification** and approval system

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Lucide React** for modern icons
- **React Router** for navigation

### Backend & Database
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for user management
- **Firebase Storage** for file uploads
- **Firebase Analytics** for user tracking

### Integration
- **Telegram WebApp API** for seamless integration
- **Multi-network Support** (TRC20, ERC20, BEP20, Polygon, Arbitrum, Optimism)

## 📱 Supported Networks

| Network | Symbol | Description |
|---------|--------|-------------|
| TRC20 | 🟢 | Tron Network - Fast & Low fees |
| ERC20 | 🔵 | Ethereum Network - Most popular |
| BEP20 | 🟡 | Binance Smart Chain - Low fees |
| Polygon | 🟣 | Polygon Network - Fast transactions |
| Arbitrum | 🔴 | Arbitrum One - Layer 2 scaling |
| Optimism | 🟠 | Optimism - Layer 2 scaling |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project
- Telegram Bot Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bddevreact/QuizApp.git
   cd QuizApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in root directory
   VITE_FIREBASE_API_KEY=AIzaSyBV2-mYjI6z1kR1r5ip5_SIeJywmK6Rly4
   VITE_FIREBASE_AUTH_DOMAIN=quiz-app-81036.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=quiz-app-81036
   VITE_FIREBASE_STORAGE_BUCKET=quiz-app-81036.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=508287482023
   VITE_FIREBASE_APP_ID=1:508287482023:web:241e8797f62f3668520382
   VITE_FIREBASE_MEASUREMENT_ID=G-HJRN3KCCPT
   
   # Optional: App Configuration
   VITE_APP_NAME=CryptoQuiz
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENVIRONMENT=production
   
   # Optional: Telegram Bot Token
   VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   
   # Optional: Admin Settings
   VITE_ADMIN_EMAIL=admin@cryptoquiz.com
   VITE_ADMIN_PASSWORD=admin123
   
   # Optional: App Settings
   VITE_MIN_DEPOSIT=10
   VITE_MAX_DEPOSIT=10000
   VITE_MIN_WITHDRAWAL=10
   VITE_MAX_WITHDRAWAL=1000
   VITE_WITHDRAWAL_FEE=2.00
   VITE_APP_FEE_PERCENTAGE=20
   ```

4. **Firebase Configuration**
   - Create a Firebase project
   - Enable Firestore, Authentication, and Storage
   - Add your service account key as `serviceAccountKey.json`

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   └── ...
├── pages/              # Main application pages
│   ├── admin/          # Admin dashboard pages
│   └── ...
├── services/           # Business logic services
│   ├── firebaseService.js
│   ├── balanceService.js
│   ├── tournamentService.js
│   └── ...
├── utils/              # Utility functions
└── config/             # Configuration files
```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Enable Storage
5. Add your web app configuration

### Telegram Bot Setup
1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Configure WebApp URL
4. Set up bot commands

### Admin Configuration
1. Set up admin wallet addresses in admin panel
2. Configure network settings
3. Set minimum/maximum deposit limits
4. Configure app fee percentages

## 🎮 Usage

### For Users
1. **Access via Telegram** - Open the bot and start the WebApp
2. **Complete Registration** - Telegram profile data is automatically imported
3. **Deposit USDT** - Choose network and submit proof
4. **Play Quizzes** - Answer questions and win rewards
5. **Join Tournaments** - Compete with other users
6. **Complete Tasks** - Earn additional rewards

### For Admins
1. **Access Admin Panel** - Login with admin credentials
2. **Verify Deposits** - Review and approve user deposits
3. **Manage Tournaments** - Monitor active tournaments
4. **Verify Tasks** - Review task completion proofs
5. **Configure Settings** - Manage wallet addresses and limits

## 🔐 Security Features

- **Admin Approval** for all deposits
- **Proof Verification** with screenshot upload
- **Balance Validation** before transactions
- **Transaction Logging** for audit trails
- **Secure File Upload** to Firebase Storage
- **Input Validation** on all forms

## 📊 Admin Dashboard Features

- **User Management** - View and manage all users
- **Transaction Monitoring** - Track all financial transactions
- **Deposit Verification** - Review and approve deposits
- **Tournament Analytics** - Monitor tournament performance
- **Task Verification** - Approve/reject task submissions
- **Wallet Management** - Configure deposit addresses
- **System Settings** - Manage app configuration

## 🚀 Deployment

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables
5. Deploy!

### Vercel Deployment
1. Import project from GitHub
2. Configure build settings
3. Set environment variables
4. Deploy!

## 📈 Performance

- **Fast Loading** - Optimized bundle size
- **Responsive Design** - Works on all devices
- **Real-time Updates** - Firebase real-time database
- **Offline Support** - Service worker implementation
- **Mobile Optimized** - Touch-friendly interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Moshfiqur Rahman**
- 📧 Email: [moonbd01717@gmail.com](mailto:moonbd01717@gmail.com)
- 📘 Facebook: [@mushfiqr.moon](https://www.facebook.com/mushfiqr.moon)
- 📱 Telegram: [@mushfiqmoon](https://t.me/mushfiqmoon)

## 🙏 Acknowledgments

- Firebase for backend services
- Telegram for WebApp platform
- React team for the amazing framework
- Tailwind CSS for beautiful styling
- All contributors and testers

---

⭐ **Star this repository if you found it helpful!**

🔗 **Live Demo**: [Your deployed URL here]

📱 **Telegram Bot**: [Your bot link here]

---

*Built with ❤️ by Moshfiqur Rahman*