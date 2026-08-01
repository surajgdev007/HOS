import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Zap, Coins } from 'lucide-react'
import { useAuthStore } from '../../store'
import { XPBar } from '../ui/XPBar'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'COMMAND CENTER', subtitle: 'Your operational overview' },
  '/quests': { title: 'MISSION LOG', subtitle: 'Active assignments and objectives' },
  '/character': { title: 'OPERATIVE PROFILE', subtitle: 'Stats, attributes and progression' },
  '/terminal': { title: 'AI TERMINAL', subtitle: 'Direct link to The System' },
  '/skills': { title: 'SKILL MATRIX', subtitle: 'Unlock capabilities and expertise' },
  '/achievements': { title: 'ACHIEVEMENT VAULT', subtitle: 'Milestones and hidden records' },
  '/inventory': { title: 'ITEM REGISTRY', subtitle: 'Equipped and acquired items' },
  '/shop': { title: 'SYSTEM STORE', subtitle: 'Upgrade your arsenal' },
  '/rankings': { title: 'GLOBAL RANKINGS', subtitle: 'Leaderboard of the elite' },
  '/settings': { title: 'SYSTEM CONFIG', subtitle: 'Preferences and account settings' },
}

export function Navbar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const page = PAGE_TITLES[location.pathname] || { title: 'THE SYSTEM', subtitle: '' }

  return (
    <header className="h-16 border-b border-border bg-bg-card/80 backdrop-blur-sm flex items-center px-6 gap-4 shrink-0">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="font-display text-accent-blue text-sm font-bold tracking-widest">
            {page.title}
          </h1>
          <p className="text-text-muted text-xs mt-0.5">{page.subtitle}</p>
        </motion.div>
      </div>

      {/* XP bar mini */}
      {user?.xpProgress && (
        <div className="hidden md:flex items-center gap-3 w-48">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xs text-text-muted font-mono">LV.{user.level}</span>
              <span className="text-2xs text-accent-blue font-mono">{user.xpProgress.percentage}%</span>
            </div>
            <XPBar percentage={user.xpProgress.percentage} size="sm" />
          </div>
        </div>
      )}

      {/* Stats */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gold">
            <Coins size={14} />
            <span className="text-sm font-mono font-medium">{user.coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-accent-blue">
            <Zap size={14} />
            <span className="text-sm font-mono font-medium">{user.energy}</span>
          </div>
          <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors relative">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-danger" />
          </button>
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-border object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent-blue-glow border border-accent-blue-dim flex items-center justify-center text-accent-blue font-bold text-sm">
              {(user.displayName || user.username)[0].toUpperCase()}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
