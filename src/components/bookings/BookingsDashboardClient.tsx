'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, AlertCircle, Calendar, LayoutList, CalendarDays, Download, MessageCircle, IndianRupee } from 'lucide-react'
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
  const [paymentAmount, setPaymentAmount] = useState('')
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentNotes, setPaymentNotes] = useState('')

  const paymentStatusColors: any = {
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800'
  }

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

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const rawAmount = Number(paymentAmount)
    if (!paymentAmount || isNaN(rawAmount) || rawAmount <= 0) return
    setIsRecordingPayment(true)
    
    try {
      const id = viewBooking.id
      const booking = bookings.find(b => b.id === id)
      if (!booking) return
      
      const supabase = createClient()
      if (!error) {
        // 1. Insert into relative payments table
        const { data: newPayment, error: pError } = await supabase.from('payments').insert({
          booking_id: id,
          amount: rawAmount,
          payment_method: paymentMethod,
          payment_date: paymentDate,
          notes: paymentNotes
        }).select().single()

        if (pError) throw pError

        // 2. Assess cumulative mapping mathematically
        const currentSum = (booking.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0)
        const activeSum = currentSum + rawAmount
        const newStatus = activeSum >= Number(booking.total_amount) ? 'paid' : 'partial'
        
        // 3. Update master tracking flag
        await supabase.from('bookings').update({ payment_status: newStatus }).eq('id', id)

        // 4. Evolve local arrays flawlessly to immediately populate history GUI
        const updatedBooking = { 
          ...booking, 
          payment_status: newStatus, 
          payments: [newPayment, ...(booking.payments || [])] 
        }

        setBookings(bookings.map(b => b.id === id ? updatedBooking : b))
        setViewBooking(updatedBooking)
        setShowPaymentForm(false)
        setPaymentAmount('')
        setPaymentNotes('')
        setPaymentMethod('Cash')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsRecordingPayment(false)
    }
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
          <div className="flex gap-2 flex-col items-end">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[viewBooking.status]}`}>
              {viewBooking.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${paymentStatusColors[viewBooking.payment_status || 'unpaid']}`}>
              {viewBooking.payment_status || 'unpaid'}
            </span>
          </div>
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

        {(viewBooking.payments && viewBooking.payments.length > 0) && (
          <div className="mb-6 border border-gray-100 rounded-xl overflow-hidden">
            <h3 className="font-bold text-gray-900 bg-gray-50 px-4 py-3 border-b border-gray-100">Payment History</h3>
            <ul className="divide-y divide-gray-100">
              {viewBooking.payments.map((p: any) => (
                <li key={p.id} className="p-4 flex justify-between items-center text-sm font-medium">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-bold">{p.payment_method}</span>
                      <span className="text-gray-400 font-normal">{new Date(p.payment_date).toLocaleDateString()}</span>
                    </div>
                    {p.notes && <p className="text-gray-500 text-xs mt-1">{p.notes}</p>}
                  </div>
                  <span className="text-green-600 font-extrabold text-base">₹{Number(p.amount).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-500">Total Contract Value</span>
            <span className="text-xl font-extrabold text-gray-900">₹{Number(viewBooking.total_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-500">Amount Paid</span>
            <span className="text-lg font-bold text-green-600">₹{Number(viewBooking.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-500">Outstanding Balance</span>
            <span className="text-lg font-bold text-red-600">₹{Math.max(0, Number(viewBooking.total_amount) - Number(viewBooking.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0)).toLocaleString()}</span>
          </div>
        </div>

        {viewBooking.payment_status !== 'paid' && (
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl mb-8">
            {!showPaymentForm ? (
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-900">Need to record a manual receipt?</span>
                <button onClick={() => setShowPaymentForm(true)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">
                  <IndianRupee size={16} className="inline mr-2 -mt-0.5" />
                  Record Payment
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <h4 className="font-bold text-indigo-900 border-b border-indigo-100 pb-2">Log Collection Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase tracking-wider">Amount (₹)</label>
                    <input type="number" required value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full bg-white border border-indigo-200 focus:border-indigo-500 rounded-lg px-4 py-2 outline-none text-black font-bold" min="1" max={Math.max(0, Number(viewBooking.total_amount) - Number(viewBooking.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase tracking-wider">Method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-white border border-indigo-200 focus:border-indigo-500 rounded-lg px-4 py-2 outline-none text-black font-bold">
                      <option>Cash</option>
                      <option>UPI</option>
                      <option>NEFT</option>
                      <option>Card</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase tracking-wider">Receipt Date</label>
                    <input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full bg-white border border-indigo-200 focus:border-indigo-500 rounded-lg px-4 py-2 outline-none text-black font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase tracking-wider">Admin Notes</label>
                    <input type="text" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} className="w-full bg-white border border-indigo-200 focus:border-indigo-500 rounded-lg px-4 py-2 outline-none text-black font-medium" placeholder="Optionally log UTR..." />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowPaymentForm(false)} className="px-4 py-2 font-bold text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isRecordingPayment || !paymentAmount} className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors">
                    {isRecordingPayment ? 'Saving...' : 'Confirm Receipt'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

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



          <button onClick={() => deleteBooking(viewBooking.id)} className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm ml-auto">
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
