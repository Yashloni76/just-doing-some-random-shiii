/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import { Database } from '@/types/database.types'
import CategoryTabs from './CategoryTabs'
import InventoryTable from './InventoryTable'
import AddEditItemModal from './AddEditItemModal'
import { createClient } from '@/utils/supabase/client'
import { Plus, AlertCircle } from 'lucide-react'
import { assignGSTRate } from '@/utils/gstEngine'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export default function InventoryDashboardClient({
  initialItems,
  error
}: {
  initialItems: InventoryItem[]
  error: string | null
}) {
  // If we had no initial items and there is an error (meaning we're just testing the UI without a DB),
  // let's bootstrap a couple of mock items so the UI isn't totally empty.
  const bootstrapMockItems: InventoryItem[] = (initialItems.length === 0 && error) ? [
    {
      id: crypto.randomUUID(),
      business_id: crypto.randomUUID(),
      name: 'Sony A7III Camera',
      category: 'Electronics',
      total_quantity: 4,
      price_per_day: 1500.00,
      gst_rate: 18.00,
      hsn_code: '9973',
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      business_id: crypto.randomUUID(),
      name: 'Honda Activa 6G',
      category: 'Vehicles',
      total_quantity: 12,
      price_per_day: 450.00,
      gst_rate: 28.00,
      hsn_code: '9966',
      created_at: new Date().toISOString()
    }
  ] : initialItems;

  const [items, setItems] = useState<InventoryItem[]>(bootstrapMockItems)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))]
  
  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => item.category === activeCategory)

  const handleSave = async (item: Partial<InventoryItem>) => {
    const isEditing = !!editingItem;
    const supabase = createClient()
    
    const taxInfo = assignGSTRate(item.category || '', item.name || '');

    let savedItem: any = {
      id: isEditing ? editingItem!.id : crypto.randomUUID(),
      business_id: isEditing ? editingItem!.business_id : '00000000-0000-0000-0000-000000000001',
      name: item.name!,
      category: item.category!,
      total_quantity: item.total_quantity || 0,
      price_per_day: item.price_per_day || 0,
      gst_rate: isEditing ? (editingItem!.gst_rate ?? taxInfo.rate) : taxInfo.rate,
      hsn_code: isEditing ? (editingItem!.hsn_code ?? taxInfo.hsn) : taxInfo.hsn,
      created_at: isEditing ? editingItem!.created_at : new Date().toISOString()
    }

    try {
      if (!error) {
        if (isEditing) {
          const { data } = await supabase.from('inventory_items').update(item).eq('id', editingItem!.id).select().single()
          if (data) savedItem = data
        } else {
          const { data } = await supabase.from('inventory_items').insert(savedItem).select().single()
          if (data) savedItem = data
        }
      }
    } catch (e) {
      console.error("Supabase failed, falling back to local state updates", e)
    }

    if (isEditing) {
      setItems(items.map(i => i.id === savedItem.id ? savedItem : i))
    } else {
      setItems([savedItem, ...items])
    }
    
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    try {
      if (!error) {
        await supabase.from('inventory_items').delete().eq('id', id)
      }
    } catch (e) {
      console.error("Supabase failed, falling back to local state updates", e)
    }
    setItems(items.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-amber-500 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Local Demo Mode Active</h3>
            <p className="text-sm text-amber-700 mt-1">
              Could not connect to a live Supabase database. You are operating via local mocked state for UI demonstration. 
              Changes will reset on refresh.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <CategoryTabs 
          categories={categories} 
          activeCategory={activeCategory} 
          onChange={setActiveCategory} 
        />
        <button
          onClick={() => {
            setEditingItem(null)
            setIsModalOpen(true)
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Item</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <InventoryTable 
          items={filteredItems} 
          onEdit={(item) => {
            setEditingItem(item)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
        />
      </div>

      {isModalOpen && (
        <AddEditItemModal 
          item={editingItem}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
