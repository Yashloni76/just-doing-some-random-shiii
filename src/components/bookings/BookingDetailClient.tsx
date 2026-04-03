'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  IndianRupee, 
  Clock, 
  Package, 
  Download, 
  MessageCircle, 
  Trash2, 
  ShieldCheck, 
  Truck,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BookingDetailClient({ initialBooking }: { initialBooking: any }) {
  const [booking, setBooking] = useState(initialBooking)
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentNotes, setPaymentNotes] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const totalPaid = booking.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0
  const outstanding = Math.max(0, Number(booking.total_amount) - totalPaid)

  const updateStatus = async (status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', booking.id)
    if (!error) setBooking({ ...booking, status })
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRecordingPayment(true)
    const rawAmount = Number(paymentAmount)

    const { data: newPayment, error: pError } = await supabase.from('payments').insert({
      booking_id: booking.id,
      amount: rawAmount,
      payment_method: paymentMethod,
      payment_date: paymentDate,
      notes: paymentNotes
    }).select().single()

    if (!pError) {
      const activeSum = totalPaid + rawAmount
      const newStatus = activeSum >= Number(booking.total_amount) ? 'paid' : 'partial'
      await supabase.from('bookings').update({ payment_status: newStatus }).eq('id', booking.id)
      
      setBooking({
        ...booking,
        payment_status: newStatus,
        payments: [newPayment, ...(booking.payments || [])]
      })
      setShowPaymentForm(false)
      setPaymentAmount('')
    }
    setIsRecordingPayment(false)
  }

  const updateReturnQuantity = async (itemId: string, qty: number) => {
    const { error } = await supabase.from('booking_items').update({ returned_quantity: qty }).eq('id', itemId)
    if (!error) {
      setBooking({
        ...booking,
        booking_items: booking.booking_items.map((item: any) => 
          item.id === itemId ? { ...item, returned_quantity: qty } : item
        )
      })
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this booking permanently?')) {
      await supabase.from('bookings').delete().eq('id', booking.id)
      router.push('/dashboard/bookings')
    }
  }

  const whatsappMsg = encodeURIComponent(
    `Hi ${booking.customer_name},\n\n` +
    `Your booking with Sharma Tent House for ${new Date(booking.start_date).toLocaleDateString()} is ${booking.status.toUpperCase()}.\n\n` +
    `💰 Total: ₹${Number(booking.total_amount).toLocaleString()}\n` +
    `✅ Paid: ₹${totalPaid.toLocaleString()}\n` +
    `❌ Balance: ₹${outstanding.toLocaleString()}\n\n` +
    `Thank you!`
  )

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/bookings" className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-orange-600 hover:border-orange-100 transition-all shadow-sm group">
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{booking.customer_name}</h1>
            <div className="flex items-center gap-3 mt-1 text-gray-500 font-bold">
              <Phone size={16} />
              {booking.customer_phone}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border ${
            booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
            booking.status === 'on-rental' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
          }`}>
             Status: {booking.status}
          </div>
          <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border ${
            booking.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
             Payment: {booking.payment_status || 'unpaid'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Main Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Logistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Rental Period</p>
                <p className="text-lg font-black text-gray-900 mt-0.5">
                  {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Security Deposit</p>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-black text-blue-900 mt-0.5">₹{Number(booking.security_deposit_amount || 0).toLocaleString()}</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${booking.security_deposit_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {booking.security_deposit_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items & Returns List */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2">
              <Package size={20} className="text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Inventory Items & Returns</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {booking.booking_items?.map((bi: any) => (
                <div key={bi.id} className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-extrabold text-gray-900 text-lg">{bi.inventory_items?.name}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Category: {bi.inventory_items?.category || 'Misc'}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Booked</p>
                       <div className="px-4 py-2 bg-gray-50 rounded-xl font-black text-gray-900">{bi.quantity_booked}</div>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Returned</p>
                       <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-xl">
                          <span className={`font-black text-lg ${bi.returned_quantity >= bi.quantity_booked ? 'text-green-600' : 'text-orange-600'}`}>
                            {bi.returned_quantity || 0}
                          </span>
                          {bi.returned_quantity < bi.quantity_booked && (
                            <button onClick={() => updateReturnQuantity(bi.id, (bi.returned_quantity || 0) + 1)} className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                               <CheckCircle2 size={16} />
                            </button>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Collection Form / History */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <IndianRupee size={20} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Collections</h2>
              </div>
              <button 
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl text-xs hover:bg-green-700 transition-all shadow-md shadow-green-100"
              >
                {showPaymentForm ? 'Close Form' : 'Record Collection'}
              </button>
            </div>
            
            {showPaymentForm && (
               <form onSubmit={handleRecordPayment} className="p-8 bg-green-50/30 border-b border-green-50 space-y-6 animate-in slide-in-from-top duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-[10px]">Amount (₹)</label>
                      <input type="number" required value={paymentAmount} onChange={(e: any) => setPaymentAmount(e.target.value)} max={outstanding} placeholder={outstanding.toString()} className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-black text-xl shadow-inner shadow-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-[10px]">Method</label>
                      <select value={paymentMethod} onChange={(e: any) => setPaymentMethod(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none font-bold text-lg shadow-inner shadow-gray-50">
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Bank Transfer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-[10px]">Date</label>
                       <input type="date" required value={paymentDate} onChange={(e: any) => setPaymentDate(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold shadow-inner shadow-gray-50 uppercase text-xs" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-[10px]">Reference</label>
                       <input type="text" value={paymentNotes} onChange={(e: any) => setPaymentNotes(e.target.value)} placeholder="UTR / Ref No." className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold shadow-inner shadow-gray-50" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-green-100">
                    <button disabled={isRecordingPayment || !paymentAmount} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-lg disabled:opacity-50 hover:bg-green-700 transition-all shadow-xl shadow-green-100 ring-4 ring-white">
                      {isRecordingPayment ? 'Recording...' : 'Confirm Receipt'}
                    </button>
                  </div>
               </form>
            )}

            <div className="divide-y divide-gray-50">
               {booking.payments?.map((p: any) => (
                 <div key={p.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900">{p.payment_method}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">{new Date(p.payment_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-xl font-black text-green-600">₹{Number(p.amount).toLocaleString()}</p>
                 </div>
               ))}
               {!booking.payments?.length && (
                 <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No collections recorded yet</div>
               )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Summary */}
        <div className="space-y-8">
          
          {/* Status Actions */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Operations</h2>
            {booking.status === 'quote' && (
              <button 
                onClick={() => updateStatus('confirmed')}
                className="w-full p-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                Confirm Booking
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button 
                onClick={() => updateStatus('delivered')}
                className="w-full p-4 bg-orange-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-orange-700 transition shadow-lg shadow-orange-100"
              >
                <Truck size={20} /> Mark Out for Delivery
              </button>
            )}
            {(booking.status === 'delivered' || booking.status === 'confirmed') && (
               <button 
               onClick={() => updateStatus('on-rental')}
               className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
             >
               Set To On-Rental
             </button>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
               <a href={`/api/invoice?id=${booking.id}`} target="_blank" className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition-all border border-gray-100">
                 <Download size={16} /> PDF Invoice
               </a>
               <a href={`https://wa.me/91${booking.customer_phone.replace(/\D/g,'')}?text=${whatsappMsg}`} target="_blank" className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-xl text-xs font-black text-green-700 hover:bg-green-100 transition-all border border-green-100">
                 <MessageCircle size={16} /> WhatsApp
               </a>
            </div>
            
            <button onClick={handleDelete} className="w-full p-3 text-red-500 font-bold text-xs hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 opacity-50 hover:opacity-100">
              <Trash2 size={14} /> Permanent Delete
            </button>
          </div>

          {/* Ledger Summary */}
          <div className="bg-gray-900 p-8 rounded-3xl shadow-xl space-y-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
             <h2 className="text-lg font-bold opacity-80 uppercase tracking-widest text-[10px]">Financial Summary</h2>
             
             <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-gray-400 font-bold text-sm">Total Valuation</span>
                  <span className="text-2xl font-black">₹{Number(booking.total_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-gray-400 font-bold text-sm">Collected</span>
                  <span className="text-xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-orange-300 font-bold text-sm">Outstanding</span>
                  <span className="text-2xl font-black text-orange-400">₹{outstanding.toLocaleString()}</span>
                </div>
             </div>

             <div className={`p-4 rounded-2xl text-center font-black uppercase text-xs tracking-tighter ${outstanding === 0 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                {outstanding === 0 ? 'Fully Collected' : 'Payment Pending'}
             </div>
          </div>

        </div>

      </div>
    </div>
  )
}
