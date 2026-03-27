'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Send, CheckCircle, Info } from 'lucide-react'
import { checkAvailability } from '@/utils/bookingAvailability'

interface SelectedItem {
  item: {
    id: string
    name: string
    price_per_day: number
  }
  qty: number
}

export default function PublicBookingModal({ 
  businessId, 
  items, 
  onClose 
}: { 
  businessId: string, 
  items: SelectedItem[], 
  onClose: () => void 
}) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAvailabilityError(null)

    try {
      const supabase = createClient()
      
      // 1. Check availability
      for (const si of items) {
        const isAvailable = await checkAvailability(supabase, si.item.id, si.qty, startDate, endDate)
        if (!isAvailable) {
          setAvailabilityError(`Sorry, ${si.item.name} is not available for these dates in the requested quantity.`)
          setIsSubmitting(false)
          return
        }
      }

      // 2. Calculate total amount
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      const total_amount = items.reduce((sum, si) => sum + (si.item.price_per_day * si.qty * days), 0)

      // 3. Create booking
      const { data: booking, error: bError } = await supabase
        .from('bookings')
        .insert({
          business_id: businessId,
          customer_name: customerName,
          customer_phone: customerPhone,
          start_date: startDate,
          end_date: endDate,
          status: 'quote',
          total_amount,
          payment_status: 'unpaid'
        })
        .select()
        .single()

      if (bError) throw bError

      // 4. Create booking items
      const { error: biError } = await supabase
        .from('booking_items')
        .insert(
          items.map(si => ({
            booking_id: booking.id,
            inventory_item_id: si.item.id,
            quantity_booked: si.qty
          }))
        )

      if (biError) throw biError

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Quote Requested!</h2>
          <p className="text-gray-500 font-medium mb-8">
            {customerName}, we&apos;ve received your request! We&apos;ll contact you at {customerPhone} shortly to confirm.
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative animate-in slide-in-from-bottom-12 duration-500 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-10">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Complete Request</h2>
          <p className="text-gray-500 font-medium mb-8">Tell us where and when you need these.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Your Name</label>
                <input 
                  required 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Yash Soni"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
                <input 
                  required 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">End Date</label>
                <input 
                  required 
                  type="date" 
                  min={startDate || new Date().toISOString().split('T')[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {availabilityError && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                <Info size={18} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm font-bold text-red-700 leading-tight">{availabilityError}</p>
              </div>
            )}

            <button 
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} strokeWidth={3} />
                  SUBMIT REQUEST
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
