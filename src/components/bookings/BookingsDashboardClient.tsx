'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Plus, AlertCircle, Calendar, LayoutList, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const statusColors: any = {
    quote: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const handleSaveBooking = (newBooking: any) => {
    setBookings([newBooking, ...bookings])
    setIsModalOpen(false)
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
              <Calendar size={16} /> Calendar
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
        <CalendarGrid bookings={bookings} statusColors={statusColors} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No bookings found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {bookings.map((booking: any) => (
                <Link 
                  key={booking.id} 
                  href={`/dashboard/bookings/${booking.id}`}
                  className="p-5 hover:bg-gray-50 flex justify-between items-center group border-b last:border-0 border-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{booking.customer_name}</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right flex flex-col items-end">
                      <span className="font-extrabold text-gray-900 text-base">₹{Number(booking.total_amount).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{booking.payment_status || 'unpaid'}</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                    <ArrowUpRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-opacity opacity-0 group-hover:opacity-100" />
                  </div>
                </Link>
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
