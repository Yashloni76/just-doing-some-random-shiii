export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import InventoryDashboardClient from '@/components/inventory/InventoryDashboardClient'
import { Database } from '@/types/database.types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export default async function InventoryPage() {
  const supabase = createClient()
  
  let items: InventoryItem[] = []
  let errorMessage = null
  
  try {
    const DUMMY_BUSINESS_ID = '00000000-0000-0000-0000-000000000001'
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('business_id', DUMMY_BUSINESS_ID)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    items = data || []
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Failed to fetch from real Supabase. Running in offline/demo mode."
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Inventory Management</h1>
        <InventoryDashboardClient initialItems={items} error={errorMessage} />
      </div>
    </div>
  )
}
