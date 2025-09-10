import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Bell, Star, Trophy } from 'lucide-react';
import dataService from '../services/dataService';
import LoadingSpinner from './LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';

const Header = () => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize dataService if not already initialized
      if (!dataService.isInitialized) {
        await dataService.initializeData();
      }
      
      // Load user data
      const userData = dataService.getUserData();
      setUserData(userData || {});
    } catch (error) {
      console.error('Error loading user data in Header:', error);
      setError('Failed to load user data');
      setUserData({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce user data updates to prevent excessive re-renders
  const debouncedUserData = useDebounce(userData, 500);

  useEffect(() => {
    loadUserData();
    
    // Listen for data updates with reduced frequency
    const interval = setInterval(() => {
      const currentUserData = dataService.getUserData();
      if (JSON.stringify(currentUserData) !== JSON.stringify(userData)) {
        setUserData(currentUserData || {});
      }
    }, 5000); // Update every 5 seconds instead of every second
    
    return () => clearInterval(interval);
  }, [loadUserData, userData]);

  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-r from-blue-900/80 to-blue-800/90 rounded-2xl p-4 shadow-premium border border-blue-600/30 overflow-hidden">
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="medium" text="Loading..." color="white" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (error) {
    return (
      <header className="sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-r from-red-900/80 to-red-800/90 rounded-2xl p-4 shadow-premium border border-red-600/30 overflow-hidden">
            <div className="flex items-center justify-center py-2">
              <span className="text-red-200 text-sm">⚠️ {error}</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        {/* Main Header Panel with wavy concave dip in middle */}
        <div className="relative bg-gradient-to-r from-blue-900/80 to-blue-800/90 rounded-2xl p-4 shadow-premium border border-blue-600/30 overflow-hidden">
          {/* Top edge glow */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 opacity-60"></div>
          
          {/* Wavy concave dip in middle of top edge */}
          <div className="absolute top-0 left-0 right-0 h-16">
            <svg className="w-full h-full" viewBox="0 0 100 16" preserveAspectRatio="none">
              <path
                d="M 0 0 L 30 0 Q 50 16 70 0 L 100 0"
                fill="none"
                stroke="url(#wavyGradient)"
                strokeWidth="2"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="wavyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60BEF0" />
                  <stop offset="50%" stopColor="#00BFFF" />
                  <stop offset="100%" stopColor="#60BEF0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Diagonal line patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-400/20 to-transparent transform rotate-12"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-cyan-400/20 to-transparent transform -rotate-6"></div>
          </div>

          <div className="flex items-center justify-between relative z-10">
            {/* Left Section: Profile */}
            <div className="flex items-center space-x-3">
              {/* User Profile Section */}
              <div className="flex items-center space-x-3">
                {/* Profile Image with hexagonal frame */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 p-0.5 rounded-xl transform rotate-45">
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 rounded-lg transform -rotate-45 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {debouncedUserData?.telegramFullName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Username and App Name */}
                <div className="flex flex-col">
                  <span className="text-white font-medium text-xs">
                    {debouncedUserData?.telegramFullName || 'CryptoMaster'}
                  </span>
                  <span className="text-blue-300 text-xs">CryptoQuiz</span>
                </div>
              </div>
            </div>

            {/* Right Section: Balance, Notifications and Stats */}
            <div className="flex items-center space-x-3">
              {/* USDT Balance */}
              <div className="bg-blue-500/15 border border-blue-400/25 rounded-xl px-3 py-2 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200 text-sm font-semibold">
                    ${debouncedUserData?.totalEarned?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {/* Notifications */}
              <button 
                className="relative p-1.5 bg-blue-500/15 border border-blue-400/25 rounded-xl hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-blue-200" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-blue-900"></div>
              </button>

              {/* Level and XP */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="bg-blue-500/15 border border-blue-400/25 rounded-xl px-2.5 py-1.5 backdrop-blur-sm">
                  <div className="flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 text-blue-200" />
                    <span className="text-blue-200 text-xs font-semibold">
                      Lv. {debouncedUserData?.level || 0}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-500/15 border border-blue-400/25 rounded-xl px-2.5 py-1.5 backdrop-blur-sm">
                  <div className="flex items-center space-x-1.5">
                    <Trophy className="w-3.5 h-3.5 text-blue-200" />
                    <span className="text-blue-200 text-xs font-semibold">
                      {debouncedUserData?.xp?.toLocaleString() || '0'} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
