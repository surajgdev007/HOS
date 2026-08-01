import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sword, Target, Clock, CheckCircle, XCircle, Zap, Coins, ChevronDown, Filter, Sparkles } from 'lucide-react'
import { questService, terminalService } from '../services/services'
import { useUIStore } from '../store'
import toast from 'react-hot-toast'
import type { Quest } from '../types'

const DIFFICULTY_COLORS = {
  easy: 'text-success border-success/30 bg-success/5',
  medium: 'text-accent-blue border-accent-blue/30 bg-accent-blue/5',
  hard: 'text-danger border-danger/30 bg-danger/5',
  legendary: 'text-gold border-gold/30 bg-gold/5',
}

const CATEGORY_ICONS: Record<string, string> = {
  coding: '💻', fitness: '🏋️', mindset: '🧘', communication: '💬',
  finance: '💰', learning: '📚', health: '❤️', career: '🎯', custom: '⚡',
}

function QuestCard({ quest, onComplete, onFail, onAccept }: {
  quest: Quest
  onComplete: (id: string) => void
  onFail: (id: string) => void
  onAccept: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const difficultyClass = DIFFICULTY_COLORS[quest.difficulty]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`card card-hover p-5 relative overflow-hidden ${
        quest.status === 'active' ? 'border-accent-blue/30' : ''
      }`}
    >
      {quest.isAIGenerated && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-2xs text-accent-blue font-mono opacity-60">
          <Sparkles size={8} /> AI
        </div>
      )}

      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0 mt-0.5">{quest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-text-primary font-medium text-sm">{quest.title}</h3>
            <span className={`text-2xs px-1.5 py-0.5 rounded border font-mono ${difficultyClass}`}>
              {quest.difficulty.toUpperCase()}
            </span>
          </div>

          {quest.description && (
            <p className="text-text-muted text-xs leading-relaxed mb-3">{quest.description}</p>
          )}

          {/* Rewards / Penalties */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-accent-blue text-xs font-mono">
              <Zap size={10} /> +{quest.xpReward} XP
            </div>
            {quest.coinReward > 0 && (
              <div className="flex items-center gap-1 text-gold text-xs font-mono">
                <Coins size={10} /> +{quest.coinReward}
              </div>
            )}
            {quest.statRewards.map(r => (
              <div key={r.stat} className="text-xs font-mono text-success">
                +{r.amount} {r.stat}
              </div>
            ))}
            {quest.xpPenalty > 0 && (
              <div className="flex items-center gap-1 text-danger text-xs font-mono">
                <XCircle size={10} /> Fail: -{quest.xpPenalty} XP
              </div>
            )}
            {quest.expiresAt && (
              <div className="flex items-center gap-1 text-text-muted text-xs">
                <Clock size={10} />
                <span>{new Date(quest.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Objectives */}
          {quest.objectives.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-text-muted text-xs mt-2 hover:text-text-secondary transition-colors"
            >
              <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              {quest.objectives.length} objectives
            </button>
          )}

          <AnimatePresence>
            {expanded && quest.objectives.length > 0 && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {quest.objectives.map((obj, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text-muted">
                    <div className={`w-1.5 h-1.5 rounded-full ${obj.completed ? 'bg-success' : 'bg-border'}`} />
                    {obj.text}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      {['available', 'active'].includes(quest.status) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          {quest.status === 'available' && (
            <button onClick={() => onAccept(quest._id)} className="btn-ghost text-xs px-3 py-2">
              Accept
            </button>
          )}
          <button
            onClick={() => onComplete(quest._id)}
            className="btn-success text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <CheckCircle size={12} /> Complete
          </button>
          <button
            onClick={() => onFail(quest._id)}
            className="btn-ghost text-xs px-3 py-2 text-danger border-danger/30 hover:bg-danger/10"
          >
            Fail
          </button>
        </div>
      )}

      {quest.status === 'completed' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-success/20 text-success text-xs font-mono">
          <CheckCircle size={12} /> COMPLETED
        </div>
      )}
    </motion.div>
  )
}

export function QuestsPage() {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'boss'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newQuest, setNewQuest] = useState({ title: '', description: '', xpReward: 50, difficulty: 'medium', icon: '⚔️' })
  const { triggerLevelUp, showSystemNotification } = useUIStore()
  const queryClient = useQueryClient()

  const { data: quests, isLoading } = useQuery({
    queryKey: ['quests', filter],
    queryFn: () => questService.getQuests(filter !== 'all' ? { type: filter } : undefined),
  })

  const completeMutation = useMutation({
    mutationFn: questService.completeQuest,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`+${result.data?.rewards?.xp} XP earned!`, { icon: '⚡' })
      if (result.data?.levelResult?.leveled) {
        triggerLevelUp({ level: result.data.levelResult.newLevel })
      }
      showSystemNotification('QUEST COMPLETE.', 'success')
    },
    onError: () => toast.error('Failed to complete quest.'),
  })

  const failMutation = useMutation({
    mutationFn: questService.failQuest,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      toast.error(`Quest failed. -${result.data?.penalty?.xp || 0} XP`)
      showSystemNotification('QUEST FAILED. PENALTY APPLIED.', 'error')
    },
  })

  const acceptMutation = useMutation({
    mutationFn: questService.acceptQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      showSystemNotification('MISSION ACCEPTED.', 'info')
    },
  })

  const createMutation = useMutation({
    mutationFn: questService.createQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      setShowCreateModal(false)
      setNewQuest({ title: '', description: '', xpReward: 50, difficulty: 'medium', icon: '⚔️' })
      toast.success('Quest created.')
    },
  })

  const generateMutation = useMutation({
    mutationFn: terminalService.generateQuests,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      toast.success(result.message || 'AI quests generated!')
      showSystemNotification(result.message || 'QUESTS GENERATED.', 'success')
    },
    onError: () => toast.error('Failed to generate quests.'),
  })

  const FILTER_TABS = [
    { key: 'all', label: 'ALL' },
    { key: 'daily', label: 'DAILY' },
    { key: 'weekly', label: 'WEEKLY' },
    { key: 'boss', label: 'BOSS' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-text-primary tracking-wider">MISSION LOG</h2>
          <p className="text-text-muted text-xs mt-0.5">{quests?.length || 0} active assignments</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn-ghost flex items-center gap-2 text-xs py-2"
          >
            <Sparkles size={13} className="text-accent-blue" />
            {generateMutation.isPending ? 'Generating...' : 'AI Generate'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 text-xs py-2"
          >
            <Plus size={13} /> New Quest
          </motion.button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              filter === tab.key
                ? 'bg-accent-blue text-bg'
                : 'bg-bg-card border border-border text-text-muted hover:border-accent-blue/30 hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quest grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : quests?.length === 0 ? (
        <div className="text-center py-24">
          <Target size={48} className="text-text-muted mx-auto mb-4" />
          <p className="font-display text-text-muted text-sm tracking-wider">NO ACTIVE MISSIONS</p>
          <p className="text-text-muted text-xs mt-2">The System is watching. Create a quest or generate with AI.</p>
          <button
            onClick={() => generateMutation.mutate()}
            className="btn-primary mt-6 text-sm"
          >
            <Sparkles size={14} /> Generate AI Quests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {quests?.map((quest: Quest) => (
              <QuestCard
                key={quest._id}
                quest={quest}
                onComplete={(id) => completeMutation.mutate(id)}
                onFail={(id) => failMutation.mutate(id)}
                onAccept={(id) => acceptMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Quest Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card glass-bright w-full max-w-lg p-6"
            >
              <h3 className="font-display text-accent-blue text-sm tracking-widest mb-6">CREATE QUEST</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div>
                    <label className="text-text-muted text-xs font-mono mb-1.5 block">ICON</label>
                    <input
                      type="text"
                      value={newQuest.icon}
                      onChange={e => setNewQuest(q => ({ ...q, icon: e.target.value }))}
                      className="w-16 bg-bg border border-border rounded-lg px-3 py-3 text-text-primary text-center text-xl focus:border-accent-blue focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-text-muted text-xs font-mono mb-1.5 block">MISSION TITLE *</label>
                    <input
                      type="text"
                      value={newQuest.title}
                      onChange={e => setNewQuest(q => ({ ...q, title: e.target.value }))}
                      placeholder="Complete 3 Leetcode problems"
                      className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:border-accent-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-xs font-mono mb-1.5 block">DESCRIPTION</label>
                  <textarea
                    value={newQuest.description}
                    onChange={e => setNewQuest(q => ({ ...q, description: e.target.value }))}
                    placeholder="Optional details..."
                    rows={2}
                    className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:border-accent-blue focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-muted text-xs font-mono mb-1.5 block">XP REWARD</label>
                    <input
                      type="number"
                      value={newQuest.xpReward}
                      onChange={e => setNewQuest(q => ({ ...q, xpReward: parseInt(e.target.value) || 50 }))}
                      className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:border-accent-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs font-mono mb-1.5 block">DIFFICULTY</label>
                    <select
                      value={newQuest.difficulty}
                      onChange={e => setNewQuest(q => ({ ...q, difficulty: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:border-accent-blue focus:outline-none"
                    >
                      {['easy', 'medium', 'hard', 'legendary'].map(d => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreateModal(false)} className="btn-ghost flex-1 py-2.5">Cancel</button>
                  <button
                    onClick={() => createMutation.mutate(newQuest)}
                    disabled={!newQuest.title || createMutation.isPending}
                    className="btn-primary flex-1 py-2.5 font-display text-xs tracking-wider"
                  >
                    {createMutation.isPending ? 'CREATING...' : 'CREATE MISSION'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
