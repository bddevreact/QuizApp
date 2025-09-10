/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#121212',      // Main dark background (charcoal black)
          card: '#1E1E1E',      // Card background (graphite gray)
          button: '#4a4a5a',    // Button color (grey)
          text: '#E0E0E0',      // Text color (light gray)
          accent: '#00BFFF',    // Accent color (electric blue)
          secondary: '#FFD700', // Secondary accent (golden highlight)
          success: '#10b981',   // Success green
          warning: '#f59e0b',   // Warning orange
          error: '#ef4444',     // Error red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)',
        'button': '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
        'premium': '0 20px 40px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(0, 191, 255, 0.3), 0 0 40px rgba(0, 191, 255, 0.1)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'floatUp 12s infinite ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-60px) scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 191, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 191, 255, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'premium-gradient': 'linear-gradient(135deg, #1E1E1E 0%, #2A2A2A 100%)',
        'accent-gradient': 'linear-gradient(135deg, #00BFFF 0%, #0099CC 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      },
    },
  },
  plugins: [],
}
