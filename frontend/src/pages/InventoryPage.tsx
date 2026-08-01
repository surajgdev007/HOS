import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { inventoryService } from '../services/services'
import type { InventoryItem } from '../types'
import { Package, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const RARITY_STYLES = {
  common: 'border-border',
  rare: 'border-accent-blue/40 rarity-rare',
  epic: 'border-purple-500/40 rarity-epic',
  legendary: 'border-gold/50 rarity-legendary',
}

const RARITY_TEXT = {
  common: 'text-text-muted',
  rare: 'text-accent-blue',
  epic: 'text-purple-400',
  legendary: 'text-gold',
}

export function InventoryPage() {
  const queryClient = useQueryClient()
  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getInventory,
  })

  const equipMutation = useMutation({
    mutationFn: inventoryService.equipItem,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(result.message)
    },
  })

  const typeCounts = items?.reduce((acc: Record<string, number>, item: InventoryItem) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-text-primary tracking-wider">ITEM REGISTRY</h2>
          <p className="text-text-muted text-xs mt-1 font-mono">{items?.length || 0} ITEMS CATALOGUED</p>
        </div>
        <Package size={24} className="text-text-muted" />
      </div>

      {/* Category summary */}
      {Object.keys(typeCounts).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} className="px-3 py-1.5 bg-bg-card border border-border rounded-lg">
              <span className="text-text-muted text-xs font-mono capitalize">{type}: </span>
              <span className="text-text-primary text-xs font-mono">{count as number}</span>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-40 bg-bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <div className="text-center py-24">
          <Package size={48} className="text-text-muted mx-auto mb-4" />
          <p className="font-display text-text-muted text-sm tracking-wider">INVENTORY EMPTY</p>
          <p className="text-text-muted text-xs mt-2">Complete quests and purchase items from the shop.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items?.map((item: InventoryItem, i: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className={`card p-4 cursor-pointer text-center group border ${RARITY_STYLES[item.rarity]} transition-all duration-200`}
              onClick={() => equipMutation.mutate(item._id)}
            >
              <div className="relative mb-3">
                <span className="text-5xl">{item.icon}</span>
                {item.isEquipped && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                    <Shield size={10} className="text-bg" />
                  </div>
                )}
              </div>
              <p className="text-text-primary text-xs font-medium mb-1 truncate">{item.name}</p>
              <p className={`text-2xs font-mono uppercase ${RARITY_TEXT[item.rarity]}`}>{item.rarity}</p>
              <p className="text-text-muted text-2xs mt-1 capitalize">{item.type}</p>
              {item.quantity > 1 && (
                <p className="text-text-muted text-2xs mt-1 font-mono">x{item.quantity}</p>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                <span className="text-2xs text-accent-blue font-mono">
                  {item.isEquipped ? 'Unequip' : 'Equip'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
