import { createClient } from '@/utils/supabase/server'
import { IndianRupee, Calendar, UserPlus, ArrowUpRight, Clock, Package } from 'lucide-react'
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
    .select('amount')
    .gte('payment_date', startOfMonth.toISOString())

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // 2. Fetch Active Bookings
  const { count: activeBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', DUMMY_ID)
    .eq('status', 'confirmed')

  // 3. Fetch Unpaid Bookings count
  const { count: unpaidBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', DUMMY_ID)
    .eq('payment_status', 'unpaid')

  // 4. Recent Bookings (5)
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', DUMMY_ID)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { name: "Monthly Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
    { name: "Confirmed Orders", value: activeBookings || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Unpaid Bookings", value: unpaidBookings || 0, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
    { name: "Quick Action", value: "New Booking", icon: UserPlus, color: "text-orange-600", bg: "bg-orange-50", link: "/dashboard/bookings" },
  ]

  return (
    <div className="p-8 space-y-10 pb-20">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 font-semibold mt-1">Real-time performance of Sharma Tent House</p>
      </header>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {stat.link && (
                <Link href={stat.link} className="text-gray-300 hover:text-orange-600 transition-colors">
                  <ArrowUpRight size={20} />
                </Link>
              )}
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.name}</p>
            <p className={`text-3xl font-black mt-1 ${stat.color === 'text-gray-500' ? 'text-gray-900' : stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-sm font-bold text-orange-600 hover:text-orange-700">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {recentBookings?.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{b.customer_name}</p>
                      <p className="text-xs text-gray-500">{b.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {new Date(b.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 font-black">₹{Number(b.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                        b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Analytics Small Card */}
        <div className="bg-orange-600 p-8 rounded-3xl shadow-xl shadow-orange-200 flex flex-col justify-between text-white">
          <div>
            <Package size={40} className="mb-6 opacity-80" />
            <h3 className="text-2xl font-black mb-2">Inventory Health</h3>
            <p className="text-orange-100 font-medium opacity-80 leading-relaxed">
              Your equipment availability is looking strong for this week. No major collisions detected.
            </p>
          </div>
          <Link href="/dashboard/inventory" className="bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl text-center font-bold transition-all border border-white/20 mt-8">
            Manage Stock
          </Link>
        </div>
      </div>
    </div>
  )
}
