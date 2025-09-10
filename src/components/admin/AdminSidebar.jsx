import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Trophy, 
  DollarSign, 
  Activity, 
  Users2, 
  Target as TargetIcon,
  CheckCircle,
  Gift,
  Database,
  Wallet
} from 'lucide-react'

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Quiz Management', href: '/admin/quiz', icon: Target },
    { name: 'Tournaments', href: '/admin/tournaments', icon: Trophy },
    { name: 'Earn System', href: '/admin/earn', icon: DollarSign, badge: 'New' },
    { name: 'Transactions', href: '/admin/transactions', icon: Activity },
    { name: 'Referrals', href: '/admin/referrals', icon: Users2 },
    { name: 'Marketing Tasks', href: '/admin/marketing-tasks', icon: TargetIcon, badge: 'Hot' },
    { name: 'Task Verifications', href: '/admin/task-verifications', icon: CheckCircle, badge: 'New' },
    { name: 'Daily Bonus', href: '/admin/daily-bonus', icon: Gift, badge: 'New' },
    { name: 'Wallet Settings', href: '/admin/wallet-settings', icon: Wallet, badge: 'New' },
    { name: 'Database Management', href: '/admin/database', icon: Database, badge: 'Danger' }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-600 bg-opacity-50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-16 left-0 z-50 w-64 h-[calc(100%-4rem)] bg-white/90 backdrop-blur-xl shadow-xl transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200/60">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-slate-900">Admin</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-4 border-blue-500 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose()
                    }
                  }}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  {item.name}
                  {item.badge && (
                    <span className={`ml-auto px-2 py-0.5 text-xs font-semibold text-white rounded-full ${
                      item.badge === 'Danger' ? 'bg-red-500' : 
                      item.badge === 'Hot' ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200/60">
            <div className="text-xs text-slate-500 text-center">
              Admin Panel v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
