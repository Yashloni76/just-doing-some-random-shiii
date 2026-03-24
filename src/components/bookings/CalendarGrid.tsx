'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarGrid({ bookings, onViewBooking, statusColors }: any) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getBookingsForDate = (date: Date) => {
    const targetDate = new Date(date).setHours(0,0,0,0)
    
    return bookings.filter((b: any) => {
      const start = new Date(b.start_date).setHours(0,0,0,0)
      const end = new Date(b.end_date).setHours(0,0,0,0)
      return targetDate >= start && targetDate <= end
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 border border-gray-100 shadow-sm hover:shadow-md"><ChevronLeft size={20} /></button>
          <button onClick={nextMonth} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 border border-gray-100 shadow-sm hover:shadow-md"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shadow-inner">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}

        {blanks.map(b => (
          <div key={`blank-${b}`} className="bg-white min-h-[140px] p-2" />
        ))}

        {days.map(day => {
          const currentLoopDate = new Date(year, month, day)
          const dayBookings = getBookingsForDate(currentLoopDate)
          const isToday = new Date().toDateString() === currentLoopDate.toDateString()

          return (
            <div key={day} className="bg-white min-h-[140px] p-2 hover:bg-gray-50 transition-colors border-t border-gray-100 group flex flex-col">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold mb-2 transition-transform group-hover:scale-105 ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'}`}>
                {day}
              </span>
              
              <div className="space-y-1.5 mt-1 overflow-y-auto flex-1 scrollbar-hide">
                {dayBookings.map((b: any) => (
                  <div 
                    key={b.id} 
                    onClick={() => onViewBooking(b)}
                    className={`text-[10px] p-1.5 px-2 rounded-lg font-bold truncate cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all ${statusColors[b.status]}`}
                    title={`${b.customer_name} - ${b.status}`}
                  >
                    {b.customer_name}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
