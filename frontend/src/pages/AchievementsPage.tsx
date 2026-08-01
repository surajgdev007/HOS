import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { achievementService } from '../services/services'
import type { Achievement } from '../types'
import { Lock, Trophy } from 'lucide-react'

const RARITY_STYLES = {
  common: 'border-border bg-bg',
  rare: 'border-accent-blue/40 bg-accent-blue/5',
  epic: 'border-purple-500/40 bg-purple-500/5',
  legendary: 'border-gold/50 bg-gold/5',
}

const RARITY_LABEL_STYLES = {
  common: 'text-text-muted',
  rare: 'text-accent-blue',
  epic: 'text-purple-400',
  legendary: 'text-gold',
}

export function AchievementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: achievementService.getAchievements,
  })

  const achievements: Achievement[] = data?.achievements || []
  const unlocked = achievements.filter(a => a.isUnlocked)
  const locked = achievements.filter(a => !a.isUnlocked && a.isRevealed)
  const hidden = achievements.filter(a => !a.isRevealed)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-text-primary tracking-wider">ACHIEVEMENT VAULT</h2>
          <p className="text-text-muted text-xs mt-1 font-mono">
            {unlocked.length}/{data?.totalCount || 0} UNLOCKED · {hidden.length} HIDDEN
          </p>
        </div>
        <div className="flex items-center gap-2 text-gold">
          <Trophy size={20} />
          <span className="font-display text-2xl font-bold">{unlocked.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex justify-between text-xs font-mono text-text-muted mb-2">
          <span>COMPLETION</span>
          <span>{data?.totalCount ? Math.floor((unlocked.length / data.totalCount) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data?.totalCount ? (unlocked.length / data.totalCount) * 100 : 0}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gold rounded-full"
          />
        </div>
      </div>

      {/* Unlocked achievements */}
      {unlocked.length > 0 && (
        <section>
          <h3 className="font-display text-xs text-success tracking-widest mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-success" />
            UNLOCKED ({unlocked.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`card p-5 border ${RARITY_STYLES[a.rarity]}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-text-primary font-semibold text-sm">{a.title}</h4>
                      <span className={`text-2xs font-mono uppercase ${RARITY_LABEL_STYLES[a.rarity]}`}>
                        {a.rarity}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs">{a.description}</p>
                    {a.xpReward > 0 && (
                      <p className="text-accent-blue text-xs mt-2 font-mono">+{a.xpReward} XP</p>
                    )}
                    {a.unlockedAt && (
                      <p className="text-text-muted text-2xs mt-1 font-mono">
                        {new Date(a.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Locked achievements */}
      {locked.length > 0 && (
        <section>
          <h3 className="font-display text-xs text-text-muted tracking-widest mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-border" />
            LOCKED ({locked.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="card p-5 opacity-50"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl grayscale">{a.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-text-muted font-semibold text-sm mb-1">{a.title}</h4>
                    <p className="text-text-muted text-xs">{a.description}</p>
                    {a.xpReward > 0 && (
                      <p className="text-text-muted text-xs mt-2 font-mono">+{a.xpReward} XP</p>
                    )}
                  </div>
                  <Lock size={14} className="text-text-muted shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Hidden achievements */}
      {hidden.length > 0 && (
        <section>
          <h3 className="font-display text-xs text-text-muted tracking-widest mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-border" />
            HIDDEN ({hidden.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hidden.map((_, i) => (
              <div key={i} className="card p-5 opacity-30 flex items-center gap-4">
                <span className="text-3xl">❓</span>
                <div>
                  <p className="text-text-muted text-sm font-medium">??? Hidden Achievement</p>
                  <p className="text-text-muted text-xs">Keep playing to reveal.</p>
                </div>
                <Lock size={12} className="text-text-muted ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      )}
    </div>
  )
}
