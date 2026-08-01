import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { rankingService } from '../services/services'
import { useAuthStore } from '../store'
import { RankBadge } from '../components/ui/RankBadge'
import type { RankingEntry } from '../types'
import { Crown, Medal, Award, Flame } from 'lucide-react'

export function RankingsPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['rankings'],
    queryFn: () => rankingService.getRankings({ limit: 50 }),
  })

  const rankings: RankingEntry[] = data?.rankings || []

  const getPositionIcon = (pos: number) => {
    if (pos === 1) return <Crown size={16} className="text-gold" />
    if (pos === 2) return <Medal size={16} className="text-gray-400" />
    if (pos === 3) return <Award size={16} className="text-yellow-600" />
    return <span className="text-text-muted font-mono text-sm w-4 text-center">{pos}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-text-primary tracking-wider">GLOBAL RANKINGS</h2>
          <p className="text-text-muted text-xs mt-1 font-mono">{rankings.length} OPERATIVES RANKED</p>
        </div>
        <Crown size={24} className="text-gold" />
      </div>

      {/* Top 3 podium */}
      {rankings.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-8">
          {[rankings[1], rankings[0], rankings[2]].map((rank, i) => {
            const heights = ['h-28', 'h-36', 'h-24']
            const positions = [2, 1, 3]
            const actualPos = positions[i]

            return (
              <motion.div
                key={rank._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative">
                  {rank.avatar ? (
                    <img src={rank.avatar} className="w-12 h-12 rounded-full border-2 border-gold/40 object-cover" alt={rank.displayName} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent-blue-glow border-2 border-accent-blue/40 flex items-center justify-center">
                      <span className="text-accent-blue font-bold">{(rank.displayName || rank.username)[0]}</span>
                    </div>
                  )}
                  {actualPos === 1 && (
                    <Crown size={14} className="absolute -top-3 left-1/2 -translate-x-1/2 text-gold" />
                  )}
                </div>
                <p className="text-text-primary text-xs font-medium truncate max-w-[80px] text-center">
                  {rank.displayName || rank.username}
                </p>
                <RankBadge rank={rank.rank} size="xs" />
                <div className={`${heights[i]} w-20 bg-bg-card border border-border rounded-t-lg flex items-end justify-center pb-3`}>
                  <span className="font-display text-2xl font-black text-text-muted">{actualPos}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Full rankings list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border grid grid-cols-12 text-2xs font-mono text-text-muted">
          <div className="col-span-1">#</div>
          <div className="col-span-5">OPERATIVE</div>
          <div className="col-span-2 text-center">RANK</div>
          <div className="col-span-2 text-right">LEVEL</div>
          <div className="col-span-2 text-right">TOTAL XP</div>
        </div>

        {isLoading ? (
          <div className="space-y-0">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-14 border-b border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            {rankings.map((entry, i) => {
              const isCurrentUser = entry._id === user?._id
              return (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`grid grid-cols-12 items-center px-6 py-4 border-b border-border last:border-0 transition-colors ${
                    isCurrentUser
                      ? 'bg-accent-blue-glow border-accent-blue/20'
                      : 'hover:bg-bg-elevated'
                  }`}
                >
                  <div className="col-span-1 flex justify-center">
                    {getPositionIcon(entry.position)}
                  </div>

                  <div className="col-span-5 flex items-center gap-3">
                    {entry.avatar ? (
                      <img src={entry.avatar} className="w-8 h-8 rounded-full border border-border object-cover shrink-0" alt={entry.displayName} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center shrink-0">
                        <span className="text-text-muted text-xs">{(entry.displayName || entry.username)[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-accent-blue' : 'text-text-primary'}`}>
                        {entry.displayName || entry.username}
                        {isCurrentUser && <span className="text-2xs ml-2 font-mono text-accent-blue">(YOU)</span>}
                      </p>
                      {entry.currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-danger text-2xs">
                          <Flame size={8} /> {entry.currentStreak}d
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <RankBadge rank={entry.rank} size="xs" />
                  </div>

                  <div className="col-span-2 text-right font-display text-sm font-bold text-text-primary">
                    {entry.level}
                  </div>

                  <div className="col-span-2 text-right font-mono text-xs text-text-muted">
                    {entry.totalXP.toLocaleString()}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
