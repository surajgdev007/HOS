import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { shopService } from '../services/services'
import type { ShopItem } from '../types'
import { ShoppingBag, Coins, Check, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store'
import { useState } from 'react'

const RARITY_BORDER = {
  common: 'border-border',
  rare: 'border-accent-blue/40',
  epic: 'border-purple-500/40',
  legendary: 'border-gold/50',
}

const RARITY_GLOW = {
  common: '',
  rare: 'hover:shadow-[0_0_15px_rgba(72,185,255,0.15)]',
  epic: 'hover:shadow-[0_0_15px_rgba(162,155,254,0.15)]',
  legendary: 'hover:shadow-[0_0_20px_rgba(255,213,79,0.2)]',
}

const TYPE_FILTERS = ['all', 'theme', 'avatar', 'badge', 'title', 'item']

export function ShopPage() {
  const [filter, setFilter] = useState('all')
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['shop', filter],
    queryFn: () => shopService.getItems(filter !== 'all' ? filter : undefined),
  })

  const purchaseMutation = useMutation({
    mutationFn: shopService.purchaseItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('ITEM ACQUIRED.', { icon: '⚡' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Purchase failed.'
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-text-primary tracking-wider">SYSTEM STORE</h2>
          <p className="text-text-muted text-xs mt-1 font-mono">{data?.items?.length || 0} ITEMS AVAILABLE</p>
        </div>
        <div className="flex items-center gap-2 bg-bg-card border border-gold/30 px-4 py-2 rounded-lg">
          <Coins size={14} className="text-gold" />
          <span className="font-mono font-bold text-gold">{user?.coins?.toLocaleString() || 0}</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-xs font-mono capitalize transition-all ${
              filter === t
                ? 'bg-accent-blue text-bg'
                : 'bg-bg-card border border-border text-text-muted hover:border-accent-blue/30'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted font-display text-sm tracking-wider">NO ITEMS AVAILABLE</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.items?.map((item: ShopItem, i: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card p-5 border ${RARITY_BORDER[item.rarity]} ${RARITY_GLOW[item.rarity]} transition-all duration-200`}
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{item.icon || '📦'}</div>
                <h3 className="text-text-primary text-sm font-medium">{item.name}</h3>
                <p className="text-text-muted text-xs mt-1 capitalize">{item.type}</p>
              </div>

              <p className="text-text-muted text-xs text-center mb-4 leading-relaxed">{item.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gold font-mono font-bold">
                  <Coins size={12} />
                  <span className="text-sm">{item.price}</span>
                </div>

                {item.isPurchased ? (
                  <div className="flex items-center gap-1.5 text-success text-xs font-mono">
                    <Check size={12} /> Owned
                  </div>
                ) : !item.canAfford ? (
                  <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <Lock size={12} /> Need {item.price - (user?.coins || 0)} more
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => purchaseMutation.mutate(item.itemId)}
                    disabled={purchaseMutation.isPending}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    Buy
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
