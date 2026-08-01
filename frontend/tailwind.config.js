/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#030303', card: '#0d0d0d', elevated: '#111111' },
        border: { DEFAULT: '#222222', subtle: '#1a1a1a', bright: '#333333' },
        accent: {
          blue: '#48b9ff',
          'blue-dim': '#1a6b9a',
          'blue-glow': 'rgba(72,185,255,0.15)',
        },
        danger: { DEFAULT: '#ff3b5b', dim: '#7a1a2a', glow: 'rgba(255,59,91,0.15)' },
        success: { DEFAULT: '#3cff83', dim: '#1a7a3c', glow: 'rgba(60,255,131,0.15)' },
        gold: { DEFAULT: '#ffd54f', dim: '#7a6320', glow: 'rgba(255,213,79,0.15)' },
        text: {
          primary: '#e8e8e8',
          secondary: '#888888',
          muted: '#555555',
          inverse: '#030303',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', '0.875rem'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(72,185,255,0.3), 0 0 60px rgba(72,185,255,0.1)',
        'glow-blue-sm': '0 0 10px rgba(72,185,255,0.2)',
        'glow-red': '0 0 20px rgba(255,59,91,0.3), 0 0 60px rgba(255,59,91,0.1)',
        'glow-green': '0 0 20px rgba(60,255,131,0.3)',
        'glow-gold': '0 0 20px rgba(255,213,79,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.6)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.8), 0 0 1px rgba(72,185,255,0.2)',
      },
      backgroundImage: {
        'scanline': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)',
        'grid': 'linear-gradient(rgba(72,185,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(72,185,255,0.03) 1px, transparent 1px)',
        'radial-accent': 'radial-gradient(ellipse at top, rgba(72,185,255,0.05) 0%, transparent 60%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'typewriter': 'typewriter 0.05s steps(1) both',
        'fade-up': 'fadeUp 0.5s ease-out both',
        'slide-in-right': 'slideInRight 0.4s ease-out both',
        'level-up': 'levelUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        levelUp: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
