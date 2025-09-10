import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BottomNavbar from './components/BottomNavbar';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Deposit from './pages/Deposit';
import Tournaments from './pages/Tournaments';
import Earn from './pages/Earn';
import Profile from './pages/Profile';
import firebaseInitializer from './utils/firebaseInit';
import './utils/databaseConsole'; // Make database console available globally

// Admin components
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuiz from './pages/admin/AdminQuiz';
import AdminTournaments from './pages/admin/AdminTournaments';
import AdminEarn from './pages/admin/AdminEarn';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminMarketingTasks from './pages/admin/AdminMarketingTasks';
import AdminTaskVerifications from './pages/admin/AdminTaskVerifications';
import AdminDailyBonus from './pages/admin/AdminDailyBonus';
import AdminDatabase from './pages/admin/AdminDatabase';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminLossPrevention from './pages/admin/AdminLossPrevention';
import AdminWalletSettings from './pages/admin/AdminWalletSettings';

// Component to conditionally render Header and BottomNavbar
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {/* Orange Glow Aura */}
      <div className="glow-orange"></div>
      
      {/* Only render Header and BottomNavbar for user routes */}
      {!isAdminRoute && <Header />}
      <main>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          } />
          <Route path="/admin/dashboard" element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          } />
          <Route path="/admin/users" element={
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          } />
          <Route path="/admin/quiz" element={
            <AdminLayout>
              <AdminQuiz />
            </AdminLayout>
          } />
          <Route path="/admin/tournaments" element={
            <AdminLayout>
              <AdminTournaments />
            </AdminLayout>
          } />
          <Route path="/admin/earn" element={
            <AdminLayout>
              <AdminEarn />
            </AdminLayout>
          } />
          <Route path="/admin/transactions" element={
            <AdminLayout>
              <AdminTransactions />
            </AdminLayout>
          } />
          <Route path="/admin/referrals" element={
            <AdminLayout>
              <AdminReferrals />
            </AdminLayout>
          } />
          <Route path="/admin/marketing-tasks" element={
            <AdminLayout>
              <AdminMarketingTasks />
            </AdminLayout>
          } />
          <Route path="/admin/task-verifications" element={
            <AdminLayout>
              <AdminTaskVerifications />
            </AdminLayout>
          } />
          <Route path="/admin/daily-bonus" element={
            <AdminLayout>
              <AdminDailyBonus />
            </AdminLayout>
          } />
          <Route path="/admin/database" element={
            <AdminLayout>
              <AdminDatabase />
            </AdminLayout>
          } />
          <Route path="/admin/security" element={
            <AdminLayout>
              <AdminSecurity />
            </AdminLayout>
          } />
          <Route path="/admin/loss-prevention" element={
            <AdminLayout>
              <AdminLossPrevention />
            </AdminLayout>
          } />
          <Route path="/admin/wallet-settings" element={
            <AdminLayout>
              <AdminWalletSettings />
            </AdminLayout>
          } />
        </Routes>
      </main>
      {!isAdminRoute && <BottomNavbar />}
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize Firebase database only when needed (for admin panel)
    // User interface works without Firebase
    const initializeFirebase = async () => {
      try {
        // Only initialize if we're in admin mode or if Firebase is actually needed
        const currentPath = window.location.pathname
        if (currentPath.startsWith('/admin')) {
          const isInitialized = await firebaseInitializer.isDatabaseInitialized()
          if (!isInitialized) {
            await firebaseInitializer.initializeDatabase()
          }
        }
      } catch (error) {
        console.warn('Firebase initialization skipped (not needed for user interface):', error.message)
        // Don't log as error since this is expected for user interface
      }
    }

    // Only initialize Firebase if we're in admin mode
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/admin')) {
      initializeFirebase()
    }
  }, [])

  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
