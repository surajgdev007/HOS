import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { skillService } from '../services/services'
import type { SkillNode, SkillBranch } from '../types'
import { Lock, Unlock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const BRANCH_COLORS: Record<SkillBranch, { color: string; bg: string; border: string }> = {
  Coding:        { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  Communication: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  Leadership:    { color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
  Fitness:       { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  Money:         { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  Mindset:       { color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30' },
  Business:      { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  AI:            { color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
}

const BRANCH_ICONS: Record<SkillBranch, string> = {
  Coding: '💻', Communication: '💬', Leadership: '👑', Fitness: '💪',
  Money: '💰', Mindset: '🧘', Business: '📊', AI: '🤖',
}

function SkillBranchSection({ branch, nodes, onUnlock }: {
  branch: SkillBranch
  nodes: SkillNode[]
  onUnlock: (id: string) => void
}) {
  const { color, bg, border } = BRANCH_COLORS[branch]
  const branchNodes = nodes.filter(n => n.branch === branch).sort((a, b) => a.tier - b.tier)

  return (
    <div className={`card p-5 border ${border}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{BRANCH_ICONS[branch]}</span>
        <h3 className={`font-display text-sm font-bold ${color}`}>{branch}</h3>
        <span className="text-text-muted text-xs font-mono ml-auto">
          {branchNodes.filter(n => n.isUnlocked).length}/{branchNodes.length}
        </span>
      </div>

      <div className="space-y-3">
        {branchNodes.map((node, i) => (
          <motion.div
            key={node._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              node.isUnlocked
                ? `${bg} ${border}`
                : node.canUnlock
                ? 'bg-accent-blue-glow border-accent-blue/20 cursor-pointer hover:border-accent-blue/50'
                : 'bg-bg border-border opacity-50'
            }`}
            onClick={() => node.canUnlock && !node.isUnlocked && onUnlock(node.skillId)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
              node.isUnlocked ? `${bg} ${border}` : node.canUnlock ? 'border-accent-blue/30 bg-accent-blue/5' : 'border-border bg-bg'
            }`}>
              {node.icon || '⚡'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${node.isUnlocked ? color : 'text-text-primary'}`}>
                {node.name}
              </p>
              <p className="text-text-muted text-xs truncate">{node.description}</p>
            </div>
            <div className="shrink-0">
              {node.isUnlocked ? (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${bg}`}>
                  <Unlock size={10} className={color} />
                </div>
              ) : node.canUnlock ? (
                <button className="flex items-center gap-1 text-accent-blue text-xs font-mono hover:underline">
                  <Zap size={10} /> Unlock
                </button>
              ) : (
                <Lock size={12} className="text-text-muted" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function SkillsPage() {
  const queryClient = useQueryClient()
  const { data: nodes, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: skillService.getSkills,
  })

  const unlockMutation = useMutation({
    mutationFn: skillService.unlockSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('SKILL UNLOCKED.', { icon: '⚡' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Cannot unlock skill.'
      toast.error(msg)
    },
  })

  const branches = ['Coding', 'Communication', 'Leadership', 'Fitness', 'Money', 'Mindset', 'Business', 'AI'] as SkillBranch[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg text-text-primary tracking-wider">SKILL MATRIX</h2>
        <p className="text-text-muted text-xs mt-1 font-mono">
          {nodes?.filter((n: SkillNode) => n.isUnlocked).length || 0}/{nodes?.length || 0} SKILLS UNLOCKED
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(branch => (
            <SkillBranchSection
              key={branch}
              branch={branch}
              nodes={nodes || []}
              onUnlock={(id) => unlockMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
