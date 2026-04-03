import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import BookingDetailClient from '@/components/bookings/BookingDetailClient'

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      booking_items (
        *,
        inventory_items (*)
      ),
      payments (*)
    `)
    .eq('id', params.id)
    .single()

  if (!booking) {
    return notFound()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <BookingDetailClient initialBooking={booking} />
    </div>
  )
}
