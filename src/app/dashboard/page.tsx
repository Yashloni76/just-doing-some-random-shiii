import { createClient } from '@/utils/supabase/server'
import { IndianRupee, Calendar, UserPlus, ArrowUpRight, Package, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardHome() {
  const supabase = createClient()
  const DUMMY_ID = '00000000-0000-0000-0000-000000000001'

  // 1. Fetch Revenue this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, payment_date')
    .gte('payment_date', startOfMonth.toISOString())

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // 2. Fetch Active Bookings (Confirmed/On-Rental)
  const { count: activeBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', DUMMY_ID)
    .in('status', ['confirmed', 'on-rental'])

  // 3. Fetch Unpaid Bookings count (unused but keeping for now or removing)
  // Removing it to pass build

  // 4. Fetch Recent Bookings (5)
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', DUMMY_ID)
    .order('created_at', { ascending: false })
    .limit(5)

  // 5. Fetch Top Products (Most frequent items in booking_items)
  const { data: topProductsRaw } = await supabase
    .from('booking_items')
    .select('inventory_items(name)')
    .limit(10)

  const productCloud: Record<string, number> = {}
  topProductsRaw?.forEach(item => {
    const name = item.inventory_items?.name || 'Unknown Item'
    productCloud[name] = (productCloud[name] || 0) + 1
  })
  const topProducts = Object.entries(productCloud)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  // 6. Utilization Calculation (Simulation)
  const { count: totalItems } = await supabase
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', DUMMY_ID)
  
  const utilization = totalItems ? Math.round(((activeBookings || 0) / totalItems) * 100) : 0

  const stats = [
    { name: "Monthly Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
    { name: "Active Rentals", value: activeBookings || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Utilization", value: `${utilization}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Quick Action", value: "New Booking", icon: UserPlus, color: "text-orange-600", bg: "bg-orange-50", link: "/dashboard/bookings" },
  ]

  return (
    <div className="p-8 space-y-10 pb-20 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 font-semibold mt-1">Real-time performance of Sharma Tent House</p>
        </div>
        <div className="flex bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-gray-400">
          <Calendar size={18} className="mr-2" />
          {startOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </div>
      </header>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              {stat.link && (
                <Link href={stat.link} className="text-gray-300 hover:text-orange-600 transition-colors">
                  <ArrowUpRight size={20} />
                </Link>
              )}
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.name}</p>
            <p className={`text-3xl font-black mt-1 ${stat.color === 'text-gray-500' ? 'text-gray-900' : stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Performance Chart (Simulated CSS) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold text-gray-900">Monthly Performance</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <div className="w-3 h-3 bg-orange-600 rounded-full" />
                  Revenue
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <div className="w-3 h-3 bg-gray-100 rounded-full" />
                  Target
                </div>
              </div>
           </div>
           
           <div className="h-64 flex items-end justify-between gap-4">
              {[...Array(12)].map((_, i) => {
                const height = Math.floor(Math.random() * 80) + 20 // Simulated data
                const isCurrent = i === new Date().getMonth()
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="w-full relative bg-gray-50 rounded-lg h-full overflow-hidden">
                       <div 
                        className={`absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-t-lg ${isCurrent ? 'bg-orange-600' : 'bg-orange-100 group-hover:bg-orange-300'}`}
                        style={{ height: `${height}%` }}
                       />
                    </div>
                    <span className={`text-[10px] font-black uppercase ${isCurrent ? 'text-orange-600' : 'text-gray-300'}`}>
                      {new Date(0, i).toLocaleString('en', { month: 'short' })}
                    </span>
                  </div>
                )
              })}
           </div>
        </div>

        {/* Top Products Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Star className="text-yellow-500 fill-yellow-500" size={20} />
            <h2 className="text-xl font-bold text-gray-900">Top Items</h2>
          </div>
          
          <div className="space-y-6 flex-1">
            {topProducts.length > 0 ? topProducts.map(([name, count], i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-gray-400 text-sm group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{count} bookings</p>
                  </div>
                </div>
                <div className="w-24 h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-600" style={{ width: `${(count / (topProducts[0][1] || 1)) * 100}%` }} />
                </div>
              </div>
            )) : (
              <p className="text-gray-400 font-medium text-center mt-10">No data available yet</p>
            )}
          </div>

          <Link href="/dashboard/inventory" className="mt-10 bg-gray-900 text-white p-4 rounded-2xl text-center font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
            <Package size={18} />
            Full Inventory
          </Link>
        </div>

        {/* Recent Bookings Table (Updated Layout) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Latest Bookings</h2>
            <Link href="/dashboard/bookings" className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">View All Archive</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Event Dates</th>
                  <th className="px-8 py-5">Total Valuation</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {recentBookings?.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900">{b.customer_name}</p>
                      <p className="text-xs text-gray-500 font-medium">{b.customer_phone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-bold text-gray-700">
                         <div className="w-2 h-2 bg-green-500 rounded-full" />
                         {new Date(b.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900">₹{Number(b.total_amount).toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                        b.status === 'on-rental' ? 'bg-blue-100 text-blue-700' : 
                        b.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Link href={`/dashboard/bookings/${b.id}`} className="p-2 text-gray-300 hover:text-orange-600 transition-colors opacity-0 group-hover:opacity-100">
                          <ArrowUpRight size={20} />
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
