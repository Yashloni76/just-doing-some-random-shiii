'use server'

import { createClient } from '@/utils/supabase/server'
import { checkAvailability } from '@/utils/bookingAvailability'

export async function verifyAvailabilityAction(
  itemId: string, 
  quantityNeeded: number, 
  startDate: string, 
  endDate: string
): Promise<boolean> {
  const supabase = createClient()
  return await checkAvailability(supabase, itemId, quantityNeeded, startDate, endDate)
}
