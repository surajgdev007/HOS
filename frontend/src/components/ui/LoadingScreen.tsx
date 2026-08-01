import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center z-50">
      <div className="scanlines fixed inset-0 opacity-30 pointer-events-none" />
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border border-accent-blue border-t-2 rounded-full mx-auto mb-6"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Zap className="w-6 h-6 text-accent-blue mx-auto mb-4" />
        </motion.div>
        <motion.p
          className="font-display text-accent-blue text-sm tracking-widest"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          SYSTEM INITIALIZING...
        </motion.p>
        <p className="text-text-muted text-xs mt-2 font-mono">Verifying identity</p>
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-border rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-bg-card border border-border rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 bg-bg-card border border-border rounded-xl" />
        <div className="h-64 bg-bg-card border border-border rounded-xl" />
      </div>
    </div>
  )
}
