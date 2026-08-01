import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store'
import { Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function LevelUpOverlay() {
  const { showLevelUp, levelUpData, dismissLevelUp } = useUIStore()
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showLevelUp && particlesRef.current) {
      // Generate particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div')
        const angle = (i / 20) * 360
        const distance = 80 + Math.random() * 120
        const x = Math.cos((angle * Math.PI) / 180) * distance
        const y = Math.sin((angle * Math.PI) / 180) * distance
        particle.style.cssText = `
          position: absolute;
          top: 50%; left: 50%;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #48b9ff;
          --x: ${x}px;
          animation: particleFloat 1s ease-out ${i * 0.05}s both;
          box-shadow: 0 0 6px #48b9ff;
        `
        particlesRef.current.appendChild(particle)
        setTimeout(() => particle.remove(), 1500)
      }
    }
  }, [showLevelUp])

  return (
    <AnimatePresence>
      {showLevelUp && levelUpData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          onClick={dismissLevelUp}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Particle container */}
          <div ref={particlesRef} className="absolute inset-0 flex items-center justify-center" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10 text-center"
          >
            {/* Glow ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-accent-blue/10 blur-3xl scale-[2]"
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border border-accent-blue/20 rounded-full scale-[2.5]"
            />

            <Zap className="w-16 h-16 text-accent-blue mx-auto mb-4 drop-shadow-[0_0_20px_rgba(72,185,255,0.8)]" />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-accent-blue text-xs font-display tracking-[0.3em] mb-2"
            >
              LEVEL UP
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-white font-display text-7xl font-black text-glow-blue mb-4"
            >
              {levelUpData.level}
            </motion.div>

            {levelUpData.rank && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gold font-display text-sm tracking-widest"
              >
                RANK PROMOTED → {levelUpData.rank}
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
              className="text-text-muted text-xs mt-6 font-mono"
            >
              Click to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
