import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Target, Trophy, DollarSign, User, Zap } from 'lucide-react'
import dataService from '../services/dataService'

const BottomNavbar = () => {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      hasNotification: false
    },
    {
      path: '/quiz',
      icon: Target,
      label: 'Quiz',
      hasNotification: false
    },
    {
      path: '/tournaments',
      icon: Trophy,
      label: 'Battles',
      hasNotification: false
    },
    {
      path: '/earn',
      icon: DollarSign,
      label: 'Earn',
      hasNotification: false
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      hasNotification: false
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#01042D]/90 via-[#01042D]/70 to-transparent backdrop-blur-xl"></div>
      
      {/* Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#60BEF0]/50 to-transparent"></div>
      
      {/* Main Navbar Container */}
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-500 group ${
                  isActive
                    ? 'text-primary-accent'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {/* Active Background Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/20 to-transparent rounded-2xl blur-sm"></div>
                )}
                
                {/* Icon Container */}
                <div className="relative z-10">
                  <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-primary-accent/20 to-primary-accent/10 shadow-lg shadow-primary-accent/25' 
                      : 'group-hover:bg-gray-700/30'
                  }`}>
                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary-accent drop-shadow-lg' 
                        : 'text-gray-400 group-hover:text-white'
                    }`} />
                    
                    {/* Notification Badge */}
                    {item.hasNotification && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse shadow-lg shadow-red-500/50">
                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Label */}
                <span className={`text-xs mt-1 font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'text-primary-accent drop-shadow-sm' 
                    : 'text-gray-400 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-accent rounded-full shadow-lg shadow-primary-accent/50"></div>
                )}
                
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* Bottom Border Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#60BEF0]/30 to-transparent"></div>
    </nav>
  )
}

export default BottomNavbar
