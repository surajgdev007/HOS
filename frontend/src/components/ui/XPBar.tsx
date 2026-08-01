import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface Props {
  percentage: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'gold'
  showGlow?: boolean
  animated?: boolean
}

const SIZE = { sm: 'h-1', md: 'h-1.5', lg: 'h-2.5' }
const COLORS = {
  blue: 'from-accent-blue/60 to-accent-blue',
  green: 'from-success/60 to-success',
  red: 'from-danger/60 to-danger',
  gold: 'from-gold/60 to-gold',
}
const GLOW = {
  blue: 'shadow-[0_0_8px_rgba(72,185,255,0.5)]',
  green: 'shadow-[0_0_8px_rgba(60,255,131,0.5)]',
  red: 'shadow-[0_0_8px_rgba(255,59,91,0.5)]',
  gold: 'shadow-[0_0_8px_rgba(255,213,79,0.5)]',
}

export function XPBar({ percentage, size = 'md', color = 'blue', showGlow = true, animated = true }: Props) {
  const pct = Math.min(100, Math.max(0, percentage))

  return (
    <div className={cn('xp-bar-track w-full', SIZE[size])}>
      <motion.div
        className={cn(
          'h-full rounded-full bg-gradient-to-r relative overflow-hidden',
          COLORS[color],
          showGlow && GLOW[color]
        )}
        initial={animated ? { width: '0%' } : { width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
        />
      </motion.div>
    </div>
  )
}
