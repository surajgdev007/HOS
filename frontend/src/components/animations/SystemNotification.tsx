import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '../../store'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

const TYPE_STYLES = {
  success: { icon: CheckCircle, color: 'text-success border-success/30 bg-success/5', label: 'SYSTEM' },
  warning: { icon: AlertTriangle, color: 'text-gold border-gold/30 bg-gold/5', label: 'WARNING' },
  error: { icon: XCircle, color: 'text-danger border-danger/30 bg-danger/5', label: 'ALERT' },
  info: { icon: Info, color: 'text-accent-blue border-accent-blue/30 bg-accent-blue/5', label: 'NOTICE' },
}

export function SystemNotification() {
  const { showNotification } = useUIStore()

  return (
    <div className="fixed top-20 right-6 z-50 w-80 pointer-events-none">
      <AnimatePresence>
        {showNotification && (
          <motion.div
            key="notification"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`card border ${TYPE_STYLES[showNotification.type].color} p-4 pointer-events-auto`}
          >
            <div className="flex items-start gap-3">
              {(() => {
                const { icon: Icon, color, label } = TYPE_STYLES[showNotification.type]
                return (
                  <>
                    <Icon size={16} className={color.split(' ')[0]} />
                    <div>
                      <p className={`font-display text-2xs tracking-widest mb-1 ${color.split(' ')[0]}`}>
                        {label}
                      </p>
                      <p className="text-text-primary text-xs leading-relaxed">
                        {showNotification.message}
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
