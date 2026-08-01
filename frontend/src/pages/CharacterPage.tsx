import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { statService } from '../services/services'
import { useAuthStore } from '../store'
import { XPBar } from '../components/ui/XPBar'
import { RankBadge } from '../components/ui/RankBadge'
import { PageSkeleton } from '../components/ui/LoadingScreen'
import type { Stat, StatName } from '../types'

const STAT_CONFIG: Record<StatName, { icon: string; color: string; barColor: 'blue' | 'green' | 'red' | 'gold'; description: string }> = {
  Strength:      { icon: '💪', color: 'text-red-400', barColor: 'red',  description: 'Physical power and endurance' },
  Discipline:    { icon: '🔥', color: 'text-orange-400', barColor: 'red', description: 'Consistency and willpower' },
  Intelligence:  { icon: '🧠', color: 'text-accent-blue', barColor: 'blue', description: 'Learning and cognitive ability' },
  Communication: { icon: '💬', color: 'text-purple-400', barColor: 'blue', description: 'Speaking, writing, and social skill' },
  Coding:        { icon: '💻', color: 'text-success', barColor: 'green', description: 'Programming and technical skill' },
  Health:        { icon: '❤️', color: 'text-pink-400', barColor: 'red', description: 'Physical and mental wellbeing' },
  Finance:       { icon: '💰', color: 'text-gold', barColor: 'gold', description: 'Wealth building and money management' },
  Confidence:    { icon: '⚡', color: 'text-yellow-400', barColor: 'gold', description: 'Self-belief and boldness' },
  Luck:          { icon: '🍀', color: 'text-gray-400', barColor: 'blue', description: 'Preparation meets opportunity' },
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const config = STAT_CONFIG[stat.name as StatName]
  const xpRequired = stat.level * stat.level * 50
  const percentage = Math.min(100, Math.floor((stat.currentXP / xpRequired) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="card card-hover p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className={`font-display text-sm font-bold ${config.color}`}>{stat.name}</h3>
            <p className="text-text-muted text-xs">{config.description}</p>
          </div>
        </div>
        <div className={`font-display text-2xl font-black ${config.color}`}>
          {stat.level}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-text-muted">
          <span>Level {stat.level}</span>
          <span>{stat.currentXP} / {xpRequired} XP</span>
        </div>
        <XPBar percentage={percentage} size="md" color={config.barColor} />
        <div className="flex justify-between text-2xs font-mono text-text-muted">
          <span>Total XP: {stat.totalXP.toLocaleString()}</span>
          <span>{percentage}%</span>
        </div>
      </div>
    </motion.div>
  )
}

export function CharacterPage() {
  const { user } = useAuthStore()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: statService.getStats,
  })

  if (isLoading) return <PageSkeleton />

  const totalStatLevels = stats?.reduce((acc: number, s: Stat) => acc + s.level, 0) || 0
  const avgStatLevel = stats?.length ? Math.floor(totalStatLevels / stats.length) : 1

  return (
    <div className="space-y-8">
      {/* Character header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-4 rounded-full bg-accent-blue/10 blur-xl"
            />
            <div className="relative w-32 h-32 rounded-full border-2 border-accent-blue/40 overflow-hidden bg-accent-blue-glow">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-4xl text-accent-blue font-black">
                    {(user?.displayName || user?.username || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-success border-2 border-bg-card shadow-glow-green" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-2">
              <h2 className="text-text-primary text-2xl font-bold">
                {user?.displayName || user?.username}
              </h2>
              <RankBadge rank={user?.rank || 'E'} size="md" animate />
            </div>
            <p className="text-text-muted text-sm font-mono mb-4">@{user?.username}</p>

            {/* Core stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'LEVEL', value: user?.level || 1, color: 'text-accent-blue' },
                { label: 'TOTAL XP', value: (user?.totalXP || 0).toLocaleString(), color: 'text-success' },
                { label: 'QUESTS', value: user?.questsCompleted || 0, color: 'text-gold' },
                { label: 'STREAK', value: `${user?.currentStreak || 0}d`, color: 'text-danger' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-bg rounded-lg p-3 border border-border">
                  <p className="text-text-muted text-2xs font-mono">{label}</p>
                  <p className={`font-display text-xl font-bold ${color} mt-0.5`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Overall power */}
          <div className="shrink-0 text-center">
            <p className="text-text-muted text-xs font-mono mb-1">POWER LEVEL</p>
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="font-display text-5xl font-black text-gold text-glow-gold"
            >
              {totalStatLevels}
            </motion.div>
            <p className="text-text-muted text-xs font-mono mt-1">Avg Lv.{avgStatLevel}</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs font-mono">
              LEVEL {user?.level} PROGRESSION
            </span>
            <span className="text-accent-blue text-xs font-mono">
              {user?.currentXP?.toLocaleString()} / {(user?.level ? user.level * user.level * 100 : 100).toLocaleString()} XP
            </span>
          </div>
          <XPBar percentage={user?.xpProgress?.percentage || 0} size="lg" />
        </div>
      </motion.div>

      {/* Stats heading */}
      <div>
        <h3 className="font-display text-sm text-text-secondary tracking-widest mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-accent-blue" />
          CHARACTER ATTRIBUTES
          <span className="flex-1 h-px bg-border" />
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.map((stat: Stat, i: number) => (
            <StatCard key={stat._id} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
