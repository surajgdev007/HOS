import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Sword, User, Terminal, GitBranch,
  Trophy, Package, ShoppingBag, BarChart3, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { useUIStore, useAuthStore } from '../../store'
import { RankBadge } from '../ui/RankBadge'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quests', label: 'Quests', icon: Sword },
  { to: '/character', label: 'Character', icon: User },
  { to: '/terminal', label: 'AI Terminal', icon: Terminal, highlight: true },
  { to: '/skills', label: 'Skills', icon: GitBranch },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/rankings', label: 'Rankings', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col bg-bg-card border-r border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-16 shrink-0">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <Zap className="w-5 h-5 text-accent-blue" />
              <span className="font-display text-accent-blue text-sm font-bold tracking-widest">
                THE SYSTEM
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {!sidebarOpen && <Zap className="w-5 h-5 text-accent-blue mx-auto" />}

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-border text-text-secondary hover:text-accent-blue transition-colors shrink-0"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* User Summary */}
      {user && (
        <div className={cn(
          'border-b border-border p-4 shrink-0',
          !sidebarOpen && 'flex justify-center py-4 px-2'
        )}>
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="relative shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="w-9 h-9 rounded-full border border-border object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full border border-accent-blue-dim bg-accent-blue-glow flex items-center justify-center">
                  <span className="text-accent-blue font-bold text-sm">{user.displayName?.[0] || user.username[0]}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-success border border-bg-card" />
            </div>

            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <p className="text-text-primary text-sm font-medium truncate">
                    {user.displayName || user.username}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RankBadge rank={user.rank} size="xs" />
                    <span className="text-text-muted text-xs">Lv. {user.level}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems.map(({ to, label, icon: Icon, highlight }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group relative',
                  isActive
                    ? 'bg-accent-blue-glow border border-accent-blue-dim text-accent-blue'
                    : 'text-text-secondary hover:bg-border hover:text-text-primary',
                  highlight && !isActive && 'border border-border-bright',
                  !sidebarOpen && 'justify-center px-2'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent-blue rounded-r glow-blue-sm"
                  />
                )}

                <Icon size={18} className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-accent-blue' : 'text-text-muted group-hover:text-text-secondary',
                  highlight && !isActive && 'text-accent-blue'
                )} />

                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-bg-elevated border border-border text-text-primary text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {label}
                  </div>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-border shrink-0"
          >
            <p className="text-text-muted text-2xs font-mono">THE SYSTEM v1.0.0</p>
            <p className="text-text-muted text-2xs font-mono">STATUS: ONLINE</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
