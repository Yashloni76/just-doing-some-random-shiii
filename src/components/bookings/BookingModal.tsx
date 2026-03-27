'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Loader2, Info } from 'lucide-react'
import { verifyAvailabilityAction } from '@/app/actions/bookingActions'

export default function BookingModal({ inventoryItems, onClose, onSave, error }: any) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState(0)
  
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [itemToAdd, setItemToAdd] = useState('')
  const [quantityToAdd, setQuantityToAdd] = useState(1)
  
  const [availabilityStatus, setAvailabilityStatus] = useState<Record<string, boolean | 'loading'>>({})
  const [saving, setSaving] = useState(false)

  // Recalculate duration
  const calculateDays = () => {
    if (!startDate || !endDate) return 1
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
    return Math.max(1, Math.ceil(ms / (1000 * 3600 * 24)))
  }

  const handleAddItem = () => {
    if (!itemToAdd || quantityToAdd < 1) return
    const itemReference = inventoryItems.find((i: any) => i.id === itemToAdd)
    if (!itemReference) return

    setSelectedItems([
      ...selectedItems,
      {
        id: crypto.randomUUID(), 
        inventory_item_id: itemReference.id,
        name: itemReference.name,
        quantity: quantityToAdd,
        price_per_day: itemReference.price_per_day,
        gst_rate: itemReference.gst_rate // Required mathematically for total loop
      }
    ])
    setItemToAdd('')
    setQuantityToAdd(1)
  }

  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(i => i.id !== id))
    const updatedStatus = { ...availabilityStatus }
    delete updatedStatus[id]
    setAvailabilityStatus(updatedStatus)
  }

  // Automatically check availability of all items when dates change
  useEffect(() => {
    if (!startDate || !endDate || selectedItems.length === 0 || error) return
    
    // Throttle / Debounce checking logic across items
    selectedItems.forEach(async (item) => {
      setAvailabilityStatus(prev => ({ ...prev, [item.id]: 'loading' }))
      try {
        const isAvail = await verifyAvailabilityAction(item.inventory_item_id, item.quantity, startDate, endDate)
        setAvailabilityStatus(prev => ({ ...prev, [item.id]: isAvail }))
      } catch {
        setAvailabilityStatus(prev => ({ ...prev, [item.id]: true })) // fallback true if error
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedItems.length])

  // Dynamically compile Base Price + Autonomous Tool GST layers
  const totalAmount = calculateDays() * selectedItems.reduce((sum, item) => {
    const basePrice = Number(item.price_per_day) * Number(item.quantity)
    const taxRate = item.gst_rate || 18.00 
    return sum + basePrice + (basePrice * (taxRate / 100))
  }, 0)
  
  const isSubmitDisabled = !customerName || !customerPhone || !startDate || !endDate || selectedItems.length === 0 || Object.values(availabilityStatus).includes(false) || Object.values(availabilityStatus).includes('loading')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const dummyId = '00000000-0000-0000-0000-000000000001'

    const bookingPayload = {
      id: crypto.randomUUID(),
      business_id: dummyId,
      customer_name: customerName,
      customer_phone: customerPhone,
      start_date: startDate,
      end_date: endDate,
      status: 'confirmed',
      total_amount: totalAmount,
      security_deposit_amount: securityDeposit,
      security_deposit_status: 'unpaid',
      created_at: new Date().toISOString()
    }

    try {
      if (!error) {
        const { error: bError } = await supabase.from('bookings').insert(bookingPayload)
        if (bError) throw bError

        const bookingItemsPayload = selectedItems.map(item => ({
          booking_id: bookingPayload.id,
          inventory_item_id: item.inventory_item_id,
          quantity_booked: item.quantity
        }))

        await supabase.from('booking_items').insert(bookingItemsPayload)
      }
      
      onSave({
        ...bookingPayload,
        booking_items: selectedItems.map(item => ({
          id: crypto.randomUUID(),
          quantity_booked: item.quantity,
          inventory_items: { name: item.name, price_per_day: item.price_per_day }
        }))
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Create Booking</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Customer Name</label>
                <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-gray-50 focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none text-black font-semibold transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <input required type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-gray-50 focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none text-black font-semibold transition-colors" placeholder="9876543210" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none text-black font-semibold transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none text-black font-semibold transition-colors" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Security Deposit (₹)</label>
              <input 
                type="number" 
                value={securityDeposit} 
                onChange={e => setSecurityDeposit(Number(e.target.value))} 
                className="w-full bg-gray-50 focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none text-black font-semibold transition-colors" 
                placeholder="Refundable deposit amount" 
              />
              <p className="text-xs text-gray-500 mt-1 font-medium">This is handled separately from the rental total.</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Add Hardware Items</h3>
              <div className="flex gap-3">
                <select value={itemToAdd} onChange={e => setItemToAdd(e.target.value)} className="flex-1 bg-gray-50 border rounded-xl px-4 py-2.5 outline-none text-black font-semibold">
                  <option value="">Select an item...</option>
                  {inventoryItems.map((i: any) => (
                    <option key={i.id} value={i.id}>{i.name} (Stock: {i.total_quantity})</option>
                  ))}
                </select>
                <input type="number" min="1" value={quantityToAdd} onChange={e => setQuantityToAdd(Number(e.target.value))} className="w-24 bg-gray-50 border rounded-xl px-4 py-2.5 outline-none font-semibold text-black text-center" />
                <button type="button" onClick={handleAddItem} className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 rounded-xl transition-colors">
                  Add
                </button>
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <ul className="space-y-4">
                  {selectedItems.map(item => {
                    const status = availabilityStatus[item.id]
                    return (
                      <li key={item.id} className="flex justify-between items-center text-sm font-medium">
                        <div className="flex flex-col">
                          <span className="text-gray-900">{item.name} <span className="text-gray-500 mx-1">x</span> {item.quantity}</span>
                          
                          {startDate && endDate && (
                            <span className={`text-xs mt-0.5 flex items-center gap-1 ${status === true ? 'text-green-600' : status === false ? 'text-red-500' : 'text-gray-400'}`}>
                              {status === 'loading' ? <Loader2 size={12} className="animate-spin" /> : <Info size={12} />}
                              {status === 'loading' ? 'Checking overlap...' : status === true ? 'Hardware available' : 'Out of stock for these dates!'}
                            </span>
                          )}
                        </div>
                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-600 p-2">
                          <X size={16} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 shrink-0 bg-gray-50 rounded-b-3xl flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Estimated Total</p>
            <p className="text-2xl font-extrabold text-blue-600">₹{totalAmount.toLocaleString()}</p>
          </div>
          <button 
            type="submit" 
            form="booking-form"
            disabled={isSubmitDisabled || saving}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : 'Save Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
