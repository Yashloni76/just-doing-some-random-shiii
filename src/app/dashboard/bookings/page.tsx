export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server'
import BookingsDashboardClient from '@/components/bookings/BookingsDashboardClient'

export default async function BookingsPage() {
  const supabase = createClient()
  const DUMMY_BUSINESS_ID = '00000000-0000-0000-0000-000000000001'
  
  let bookings: any[] = []
  let inventoryItems: any[] = []
  let errorMessage: string | null = null

  try {
    const { data: bData, error: bError } = await supabase
      .from('bookings')
      .select('*, booking_items(*, inventory_items(name, price_per_day)), payments(*)')
      .eq('business_id', DUMMY_BUSINESS_ID)
      .order('created_at', { ascending: false })

    if (bError) throw bError
    bookings = bData || []

    const { data: iData, error: iError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('business_id', DUMMY_BUSINESS_ID)
      .order('name', { ascending: true })

    if (iError) throw iError
    inventoryItems = iData || []

  } catch (e) {
    errorMessage = e instanceof Error ? e.message : 'Fallback local mode active'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Bookings Management</h1>
        <BookingsDashboardClient 
          initialBookings={bookings} 
          inventoryItems={inventoryItems} 
          error={errorMessage} 
        />
      </div>
    </div>
  )
}
