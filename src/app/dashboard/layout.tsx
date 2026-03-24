import Link from 'next/link'
import { Package, CalendarCheck } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">Rentpe</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard/inventory" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <Package size={20} />
            Inventory
          </Link>
          <Link href="/dashboard/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <CalendarCheck size={20} />
            Bookings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
