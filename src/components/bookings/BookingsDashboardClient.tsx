'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, AlertCircle, Calendar, LayoutList, CalendarDays, Download, MessageCircle } from 'lucide-react'
import BookingModal from './BookingModal'
import CalendarGrid from './CalendarGrid'

export default function BookingsDashboardClient({
  initialBookings,
  inventoryItems,
  error
}: {
  initialBookings: any[]
  inventoryItems: any[]
  error: string | null
}) {
  const [bookings, setBookings] = useState<any[]>(initialBookings)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewBooking, setViewBooking] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const statusColors: any = {
    quote: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    if (!error) {
      await supabase.from('bookings').update({ status }).eq('id', id)
    }
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
    if (viewBooking?.id === id) {
      setViewBooking({ ...viewBooking, status })
    }
  }

  const deleteBooking = async (id: string) => {
    const supabase = createClient()
    if (!error) {
      await supabase.from('bookings').delete().eq('id', id)
    }
    setBookings(bookings.filter(b => b.id !== id))
    setViewBooking(null)
  }

  const handleSaveBooking = (newBooking: any) => {
    setBookings([newBooking, ...bookings])
    setIsModalOpen(false)
  }

  if (viewBooking) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">{viewBooking.customer_name}</h2>
            <p className="text-gray-500 font-medium mt-1">{viewBooking.customer_phone}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[viewBooking.status]}`}>
            {viewBooking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-xl text-sm font-medium">
          <div>
            <span className="text-gray-500 block mb-1">Start Date</span>
            <span className="text-gray-900">{new Date(viewBooking.start_date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">End Date</span>
            <span className="text-gray-900">{new Date(viewBooking.end_date).toLocaleDateString()}</span>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Reserved Items</h3>
        <ul className="space-y-3 mb-8">
          {viewBooking.booking_items?.map((bi: any) => (
            <li key={bi.id} className="flex justify-between items-center text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-lg">
              <span>{bi.inventory_items?.name || 'Unknown Item'} <span className="text-gray-400">x {bi.quantity_booked}</span></span>
              <span>₹{(bi.inventory_items?.price_per_day * bi.quantity_booked).toFixed(2)} / day</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center border-t pt-4 mb-8">
          <span className="font-bold text-gray-500">Total Contract Value</span>
          <span className="text-xl font-extrabold text-gray-900">₹{Number(viewBooking.total_amount).toLocaleString()}</span>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setViewBooking(null)} className="px-4 py-2 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Back to List
          </button>
          
          {viewBooking.status === 'quote' && (
            <button onClick={() => updateStatus(viewBooking.id, 'confirmed')} className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
              Confirm Booking
            </button>
          )}
          {viewBooking.status === 'confirmed' && (
            <button onClick={() => updateStatus(viewBooking.id, 'delivered')} className="px-4 py-2 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm">
              Mark Delivered
            </button>
          )}
          {viewBooking.status !== 'cancelled' && (
            <button onClick={() => updateStatus(viewBooking.id, 'cancelled')} className="px-4 py-2 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              Cancel
            </button>
          )}

          <a href={`/api/invoice?id=${viewBooking.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shadow-sm ml-auto">
            <Download size={16} /> Invoice
          </a>

          <a href={`https://wa.me/91${viewBooking.customer_phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${viewBooking.customer_name},\n\nYour equipment rental from ${new Date(viewBooking.start_date).toLocaleDateString()} to ${new Date(viewBooking.end_date).toLocaleDateString()} is officially ${viewBooking.status.toUpperCase()}.\n\nGrand Total: Rs. ${Number(viewBooking.total_amount).toLocaleString()}\n\nThank you for choosing us!`)}`} target="_blank" className="flex items-center gap-2 px-4 py-2 font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl transition-colors shadow-sm">
            <MessageCircle size={16} /> WhatsApp
          </a>

          <button onClick={() => deleteBooking(viewBooking.id)} className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">
            Delete 
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-amber-500 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Local Demo Mode Active</h3>
            <p className="text-sm text-amber-700 mt-1">
              Could not connect to a live Supabase database. You are operating via local mocked state.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Active Bookings
          </h2>
          
          <div className="hidden sm:flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutList size={16} /> List
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CalendarDays size={16} /> Calendar
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Booking</span>
        </button>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarGrid bookings={bookings} onViewBooking={setViewBooking} statusColors={statusColors} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No bookings found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <li 
                  key={booking.id} 
                  onClick={() => setViewBooking(booking)}
                  className="p-5 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center group"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{booking.customer_name}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-gray-900">₹{Number(booking.total_amount).toLocaleString()}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isModalOpen && (
        <BookingModal
          inventoryItems={inventoryItems}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBooking}
          error={error}
        />
      )}
    </div>
  )
}
