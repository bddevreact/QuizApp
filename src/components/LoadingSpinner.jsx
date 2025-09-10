import React from 'react'

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  className = '',
  color = 'primary'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-primary-accent',
    white: 'border-white',
    gray: 'border-gray-400',
    blue: 'border-blue-500',
    green: 'border-green-500'
  }

  const textColorClasses = {
    primary: 'text-primary-accent',
    white: 'text-white',
    gray: 'text-gray-400',
    blue: 'text-blue-500',
    green: 'text-green-500'
  }

  const spinner = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
      {text && (
        <p className={`text-sm ${textColorClasses[color]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-primary-card/90 backdrop-blur-md rounded-2xl p-8 shadow-premium border border-primary-accent/30">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner
