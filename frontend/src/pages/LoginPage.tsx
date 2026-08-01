import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Github, Mail, Zap, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store'
import { authService } from '../services/services'
import { cn } from '../utils/cn'

const BOOT_LINES = [
  'INITIALIZING CORE SYSTEMS...',
  'SCANNING ENVIRONMENT...',
  'LOADING OPERATIVE DATABASE...',
  'ESTABLISHING SECURE CONNECTION...',
  'IDENTITY VERIFICATION REQUIRED.',
]

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [bootIndex, setBootIndex] = useState(0)
  const [bootComplete, setBootComplete] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setBootIndex(i => {
        if (i >= BOOT_LINES.length - 1) {
          clearInterval(timer)
          setTimeout(() => setBootComplete(true), 500)
          return i
        }
        return i + 1
      })
    }, 350)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {}
  }

  const handleGoogleLogin = () => authService.googleLogin()
  const handleGithubLogin = () => authService.githubLogin()

  return (
    <div className="min-h-screen w-full bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="scanlines fixed inset-0 pointer-events-none opacity-20" />
      <div className="fixed inset-0 bg-system-grid opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-0 right-0 h-96 bg-radial-accent pointer-events-none" />
      
      {/* Animated corner decorations */}
      {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
        <div key={i} className={`fixed ${pos} w-12 h-12 border-accent-blue opacity-20`} style={{
          borderTop: pos.includes('top') ? '1px solid' : 'none',
          borderBottom: pos.includes('bottom') ? '1px solid' : 'none',
          borderLeft: pos.includes('left') ? '1px solid' : 'none',
          borderRight: pos.includes('right') ? '1px solid' : 'none',
        }} />
      ))}

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Boot sequence */}
        <AnimatePresence>
          {!bootComplete && (
            <motion.div
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 font-mono text-xs space-y-1"
            >
              {BOOT_LINES.slice(0, bootIndex + 1).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    i === bootIndex ? 'text-accent-blue' : 'text-text-muted'
                  )}
                >
                  {'>'} {line}
                  {i === bootIndex && <span className="terminal-cursor ml-1" />}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: bootComplete ? 1 : 0, y: bootComplete ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Zap className="w-8 h-8 text-accent-blue drop-shadow-[0_0_10px_rgba(72,185,255,0.8)]" />
          </motion.div>
          <h1 className="font-display text-3xl font-black text-accent-blue tracking-[0.15em] text-glow-blue">
            THE SYSTEM
          </h1>
          <p className="text-text-muted text-xs mt-2 font-mono tracking-wider">
            IDENTITY VERIFICATION REQUIRED
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: bootComplete ? 1 : 0, y: bootComplete ? 0 : 30 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card glass p-8"
        >
          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="btn-ghost flex items-center justify-center gap-2 py-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm">Google</span>
            </button>
            <button
              onClick={handleGithubLogin}
              className="btn-ghost flex items-center justify-center gap-2 py-2.5"
            >
              <Github size={16} />
              <span className="text-sm">GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-muted text-xs font-mono">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded-lg mb-4"
              >
                <AlertCircle size={14} className="text-danger shrink-0" />
                <p className="text-danger text-xs">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-xs font-mono mb-2 tracking-wider">
                EMAIL
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="operative@system.io"
                  className="w-full bg-bg border border-border rounded-lg pl-9 pr-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:border-accent-blue focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-mono mb-2 tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:border-accent-blue focus:outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full py-3 font-display text-sm tracking-widest"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border border-bg border-t-transparent rounded-full"
                  />
                  VERIFYING...
                </span>
              ) : 'ACCESS SYSTEM'}
            </motion.button>
          </form>

          <p className="text-center text-text-muted text-xs mt-6 font-mono">
            NO IDENTITY?{' '}
            <Link to="/register" className="text-accent-blue hover:underline">
              REGISTER
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
