'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Package, 
  CalendarCheck, 
  Settings, 
  LayoutDashboard, 
  Menu, 
  X 
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NavLink = ({ item, onClick }: { item: typeof navItems[0], onClick?: () => void }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link 
        href={item.href} 
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${
          isActive 
            ? 'bg-orange-50 text-orange-600 shadow-sm' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-900'} />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-[240px] bg-white border-r border-gray-200 flex-col hidden md:flex shrink-0">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white font-black text-xl">R</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Rentpe</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">R</span>
          </div>
          <span className="font-black text-gray-900 tracking-tighter">Rentpe</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} className="text-gray-900" />
        </button>
      </div>

      {/* Mobile Slide-over Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <nav className="absolute top-0 left-0 bottom-0 w-3/4 max-w-sm bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">R</span>
                </div>
                <span className="font-black text-gray-900 tracking-tighter text-xl">Rentpe</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full">
                <X size={20} className="text-gray-900" />
              </button>
            </div>
            <div className="space-y-4">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} onClick={() => setMobileMenuOpen(false)} />
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
