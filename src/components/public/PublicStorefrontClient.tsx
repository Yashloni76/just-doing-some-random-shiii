'use client'

import { useState } from 'react'
import { ShoppingBag, ChevronRight, MapPin } from 'lucide-react'
import PublicBookingModal from './PublicBookingModal'

interface Business {
  id: string
  business_name: string
  city: string
  slug: string | null
}

interface InventoryItem {
  id: string
  name: string
  category: string
  price_per_day: number
  total_quantity: number
}

export default function PublicStorefrontClient({ 
  business, 
  items 
}: { 
  business: Business, 
  items: InventoryItem[] 
}) {
  const [selectedItems, setSelectedItems] = useState<{item: InventoryItem, qty: number}[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleItem = (item: InventoryItem) => {
    const exists = selectedItems.find(si => si.item.id === item.id)
    if (exists) {
      setSelectedItems(selectedItems.filter(si => si.item.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, { item, qty: 1 }])
    }
  }

  const updateQty = (itemId: string, qty: number) => {
    setSelectedItems(selectedItems.map(si => 
      si.item.id === itemId ? { ...si, qty: Math.max(1, qty) } : si
    ))
  }

  const totalPrice = selectedItems.reduce((sum, si) => sum + (si.item.price_per_day * si.qty), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">{business.business_name}</h1>
        <div className="flex items-center justify-center gap-2 text-gray-500 font-medium">
          <MapPin size={18} />
          <span>{business.city}</span>
        </div>
      </header>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {items.map(item => {
          const isSelected = selectedItems.some(si => si.item.id === item.id)
          return (
            <div 
              key={item.id}
              onClick={() => toggleItem(item)}
              className={`group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' 
                  : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-md">
                  {item.category}
                </span>
                {isSelected && (
                   <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                     <ChevronRight size={16} strokeWidth={3} />
                   </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                {item.name}
              </h3>
              <p className="text-gray-500 text-sm font-medium mb-6">
                ₹{item.price_per_day.toLocaleString()} <span className="text-gray-400">/ day</span>
              </p>

              {isSelected && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Qty:</label>
                  <input 
                    type="number" 
                    value={selectedItems.find(si => si.item.id === item.id)?.qty || 1}
                    onChange={(e) => updateQty(item.id, parseInt(e.target.value))}
                    className="w-16 bg-white border border-blue-200 rounded-md px-2 py-1 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-500 select-none">
          <div className="bg-gray-900 text-white p-5 rounded-3xl shadow-2xl shadow-blue-900/40 flex items-center justify-between border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected {selectedItems.length} items</p>
                <p className="text-xl font-black">₹{totalPrice.toLocaleString()} <span className="text-xs font-medium text-gray-500">/ day</span></p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-50 transition-colors"
            >
              Request Quote
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <PublicBookingModal 
          businessId={business.id}
          items={selectedItems}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
