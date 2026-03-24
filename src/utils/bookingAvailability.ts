import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export async function checkAvailability(
  supabase: SupabaseClient<Database>,
  itemId: string,
  quantityNeeded: number,
  startDate: string, // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
): Promise<boolean> {
  // 1. Fetch the maximum capacity inventory stock for this item
  const { data: item, error: itemError } = await supabase
    .from('inventory_items')
    .select('total_quantity')
    .eq('id', itemId)
    .single()

  if (itemError || !item) {
    console.error("Item not found or error fetching inventory_items:", itemError)
    return false
  }

  const totalQuantity = item.total_quantity

  // 2. Discover overlapping reservations
  // Overlap theorem: Existing Start <= Requested End AND Existing End >= Requested Start
  const { data: overlappingItems, error: overlapError } = await supabase
    .from('booking_items')
    .select(`
      quantity_booked,
      bookings!inner (
        status,
        start_date,
        end_date
      )
    `)
    .eq('inventory_item_id', itemId)
    .neq('bookings.status', 'cancelled')
    .lte('bookings.start_date', endDate)
    .gte('bookings.end_date', startDate)

  if (overlapError) {
    console.error("Error fetching overlapping bookings logic:", overlapError)
    return false
  }

  // 3. Summate the constrained physical quantity currently allocated across all overlapping bookings
  const totalBooked = (overlappingItems || []).reduce((sum, current) => {
    return sum + current.quantity_booked
  }, 0)

  // 4. Assert True if remaining capacity is vast enough to handle the customer's request
  return (totalQuantity - totalBooked) >= quantityNeeded
}
