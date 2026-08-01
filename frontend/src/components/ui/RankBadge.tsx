import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import type { Rank } from '../../types'

const RANK_STYLES: Record<string, string> = {
  'E': 'rank-e', 'E+': 'rank-e',
  'D': 'rank-d', 'D+': 'rank-d',
  'C': 'rank-c', 'C+': 'rank-c',
  'B': 'rank-b', 'B+': 'rank-b',
  'A': 'rank-a', 'A+': 'rank-a',
  'S': 'rank-s', 'SS': 'rank-ss',
  'SSS': 'rank-sss', 'Legend': 'rank-legend',
  'Immortal': 'rank-immortal',
}

interface Props {
  rank: Rank
  size?: 'xs' | 'sm' | 'md' | 'lg'
  animate?: boolean
}

const SIZE_CLASSES = {
  xs: 'text-2xs px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
}

export function RankBadge({ rank, size = 'sm', animate = false }: Props) {
  const rankClass = RANK_STYLES[rank] || 'rank-e'

  return (
    <motion.span
      className={cn('rank-badge', rankClass, SIZE_CLASSES[size])}
      animate={animate ? {
        boxShadow: ['0 0 5px transparent', '0 0 15px currentColor', '0 0 5px transparent'],
      } : {}}
      transition={animate ? { duration: 2, repeat: Infinity } : {}}
    >
      {rank}
    </motion.span>
  )
}
