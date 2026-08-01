import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Zap, Coins, Flame, Target, TrendingUp, Swords, Brain, Sparkles, ChevronRight, CheckCircle, Clock } from 'lucide-react'
import { userService, questService } from '../services/services'
import { useAuthStore, useUIStore } from '../store'
import { XPBar } from '../components/ui/XPBar'
import { RankBadge } from '../components/ui/RankBadge'
import { PageSkeleton } from '../components/ui/LoadingScreen'
import toast from 'react-hot-toast'
import type { Quest } from '../types'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

const SYSTEM_MESSAGES = [
  'Performance metrics within acceptable parameters. Continue.',
  'Surveillance active. Every action is recorded.',
  'Stagnation is regression. Keep moving.',
  'The gap between where you are and where you want to be is called discipline.',
  'The System has identified improvement vectors. Consult the terminal.',
  'Warning: Idle cycles detected. Initiate task protocol.',
  'Your potential exceeds current utilization. Optimize.',
]

function StatBar({ color }: { color: string }) {
  return <div className={`w-1 h-8 rounded-full ${color} opacity-60`} />
}

function DashboardCard({ title, value, subtitle, icon: Icon, color = 'text-accent-blue', delay = 0 }: {
  title: string; value: string | number; subtitle?: string; icon: React.ElementType; color?: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card card-hover p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-current/10 ${color}`}>
          <Icon size={18} />
        </div>
        <span className="text-text-muted text-xs font-mono">{title}</span>
      </div>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-text-muted text-xs mt-1">{subtitle}</p>}
    </motion.div>
  )
}

export function DashboardPage() {
  const { user: authUser, setUser } = useAuthStore()
  const { triggerLevelUp, showSystemNotification } = useUIStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: userService.getDashboard,
    refetchInterval: 30000,
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => questService.completeQuest(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      const { levelResult, rewards } = result.data!
      toast.success(`+${rewards.xp} XP earned!`, { icon: '⚡' })
      if (levelResult?.leveled) {
        triggerLevelUp({ level: levelResult.newLevel, rank: levelResult.rankChanged ? levelResult.newRank : undefined })
      }
      showSystemNotification('QUEST COMPLETE. REWARDS DISTRIBUTED.', 'success')
    },
    onError: () => toast.error('Failed to complete quest.'),
  })

  if (isLoading) return <PageSkeleton />

  const { user, stats, activeQuests, activityMap } = data || {}
  const systemMessage = SYSTEM_MESSAGES[Math.floor(Date.now() / 86400000) % SYSTEM_MESSAGES.length]

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 border-accent-blue/20 bg-accent-blue-glow/30"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-accent-blue text-xs tracking-widest mb-1">SYSTEM ONLINE</p>
            <h2 className="text-text-primary text-xl font-semibold">
              Welcome back, <span className="text-accent-blue font-bold">{user?.displayName || authUser?.displayName || 'Operative'}</span>
            </h2>
            <p className="text-text-muted text-sm mt-1">{systemMessage}</p>
          </div>
          <RankBadge rank={user?.rank || 'E'} size="lg" animate />
        </div>

        {/* XP Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs font-mono">LEVEL {user?.level} → {(user?.level || 1) + 1}</span>
            <span className="text-accent-blue text-xs font-mono">
              {user?.xpProgress?.current?.toLocaleString()} / {user?.xpProgress?.required?.toLocaleString()} XP
            </span>
          </div>
          <XPBar percentage={user?.xpProgress?.percentage || 0} size="lg" />
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard title="LEVEL" value={user?.level || 1} subtitle="Current rank" icon={TrendingUp} delay={0.1} />
        <DashboardCard title="COINS" value={(user?.coins || 0).toLocaleString()} subtitle="System currency" icon={Coins} color="text-gold" delay={0.15} />
        <DashboardCard title="ENERGY" value={`${user?.energy || 100}%`} subtitle="Operational capacity" icon={Zap} delay={0.2} />
        <DashboardCard title="STREAK" value={`${user?.currentStreak || 0}d`} subtitle={`Best: ${user?.longestStreak || 0}d`} icon={Flame} color="text-danger" delay={0.25} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Swords size={16} className="text-accent-blue" />
              <h3 className="font-display text-sm text-text-primary tracking-wider">ACTIVE MISSIONS</h3>
            </div>
            <Link to="/quests" className="text-xs text-text-muted hover:text-accent-blue flex items-center gap-1 transition-colors">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          {activeQuests?.length === 0 ? (
            <div className="text-center py-12">
              <Target size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-muted text-sm font-mono">NO ACTIVE MISSIONS</p>
              <p className="text-text-muted text-xs mt-1">The System is generating your next assignment.</p>
              <Link to="/quests" className="btn-primary mt-4 inline-flex text-xs px-4 py-2">
                View Quests
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeQuests?.slice(0, 4).map((quest: Quest, i: number) => (
                <motion.div
                  key={quest._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4 p-4 bg-bg rounded-lg border border-border hover:border-accent-blue/30 transition-all group"
                >
                  <span className="text-2xl shrink-0">{quest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">{quest.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-accent-blue text-xs font-mono">+{quest.xpReward} XP</span>
                      {quest.coinReward > 0 && <span className="text-gold text-xs font-mono">+{quest.coinReward} 🪙</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                        quest.difficulty === 'legendary' ? 'bg-gold/10 text-gold' :
                        quest.difficulty === 'hard' ? 'bg-danger/10 text-danger' :
                        quest.difficulty === 'medium' ? 'bg-accent-blue/10 text-accent-blue' :
                        'bg-success/10 text-success'
                      }`}>
                        {quest.difficulty.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {quest.expiresAt && (
                      <div className="flex items-center gap-1 text-text-muted text-xs">
                        <Clock size={10} />
                        <span>{format(new Date(quest.expiresAt), 'HH:mm')}</span>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => completeMutation.mutate(quest._id)}
                      disabled={completeMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 btn-success px-3 py-1.5 text-xs transition-opacity"
                    >
                      <CheckCircle size={12} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI System Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card p-5 border-accent-blue/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-accent-blue" />
              <span className="font-display text-xs text-accent-blue tracking-widest">SYSTEM MESSAGE</span>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed font-mono">
              {systemMessage}
            </p>
            <Link to="/terminal" className="flex items-center gap-1 text-accent-blue text-xs mt-3 hover:underline font-mono">
              Open Terminal <ChevronRight size={10} />
            </Link>
          </motion.div>

          {/* Character Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gold" />
                <span className="font-display text-xs text-text-secondary tracking-wider">TOP STATS</span>
              </div>
              <Link to="/character" className="text-xs text-text-muted hover:text-accent-blue">
                <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-2.5">
              {stats?.sort((a: { level: number }, b: { level: number }) => b.level - a.level).slice(0, 4).map((stat: { name: string; level: number; currentXP: number; totalXP: number }) => (
                <div key={stat.name} className="flex items-center gap-3">
                  <span className="text-text-muted text-xs w-24 truncate font-mono">{stat.name}</span>
                  <div className="flex-1">
                    <XPBar
                      percentage={Math.floor((stat.currentXP / Math.max(1, stat.level * stat.level * 50)) * 100)}
                      size="sm"
                      color="blue"
                      showGlow={false}
                    />
                  </div>
                  <span className="text-text-muted text-xs font-mono w-8 text-right">Lv{stat.level}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-success" />
              <span className="font-display text-xs text-text-secondary tracking-wider">ACTIVITY</span>
            </div>
            <div className="grid grid-cols-14 gap-0.5">
              {[...Array(98)].map((_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (97 - i))
                const key = date.toISOString().split('T')[0]
                const xp = activityMap?.[key] || 0
                const intensity = xp > 200 ? 4 : xp > 100 ? 3 : xp > 50 ? 2 : xp > 0 ? 1 : 0
                const colors = ['bg-border/30', 'bg-success/20', 'bg-success/40', 'bg-success/70', 'bg-success']
                return (
                  <div
                    key={i}
                    className={`w-full aspect-square rounded-sm ${colors[intensity]} transition-colors`}
                    title={`${key}: ${xp} XP`}
                  />
                )
              })}
            </div>
            <p className="text-text-muted text-2xs mt-2 font-mono">Last 14 weeks of activity</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
