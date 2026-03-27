'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, Globe, Building2, MapPin, Mail, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react'

export default function SettingsDashboard({ initialBusiness }: { initialBusiness: any }) {
  const [business, setBusiness] = useState(initialBusiness)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)
    
    const supabase = createClient()
    const { error } = await supabase
      .from('businesses')
      .update({
        business_name: business.business_name,
        gstin: business.gstin,
        slug: business.slug,
        business_address: business.business_address,
        business_email: business.business_email,
        whatsapp_number: business.whatsapp_number,
        terms_conditions: business.terms_conditions,
        logo_url: business.logo_url
      })
      .eq('id', business.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Settings updated successfully!' })
      // If slug changed, we might want to refresh or notify
    }
    setIsSaving(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBusiness({ ...business, [name]: value })
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-20">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-semibold ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Section 1: Core Identity */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="text-blue-600" size={22} />
          Business Identity
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Company Name</label>
            <input 
              name="business_name"
              value={business.business_name || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
              placeholder="e.g. Rentpe Electronics"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">GSTIN (for Invoices)</label>
            <input 
              name="gstin"
              value={business.gstin || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium uppercase" 
              placeholder="27AAAAA0000A1Z5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Storefront Slug (Public URL)</label>
            <div className="flex gap-2 items-center text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
               <Globe size={18} />
               <span className="font-medium">rentpe.com/</span>
               <input 
                name="slug"
                value={business.slug || ''}
                onChange={handleChange}
                className="bg-transparent text-gray-900 font-bold outline-none flex-1" 
                placeholder="my-store"
              />
            </div>
            <p className="text-xs text-gray-500 font-medium">Changing this will break old public links.</p>
          </div>
        </div>
      </div>

      {/* Section 2: Contact & Branding */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin className="text-blue-600" size={22} />
          Contact & Branding
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Public Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input 
                  name="business_email"
                  value={business.business_email || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">WhatsApp Number (for Invoice sharing)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input 
                  name="whatsapp_number"
                  value={business.whatsapp_number || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Business Address (Shown on Invoices)</label>
            <textarea 
              name="business_address"
              value={business.business_address || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
              placeholder="Full shop address..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Logo URL (External link for now)</label>
            <input 
              name="logo_url"
              value={business.logo_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Legal */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Terms & Conditions</h2>
        <textarea 
          name="terms_conditions"
          value={business.terms_conditions || ''}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm" 
          placeholder="Enter the terms that will appear at the bottom of your bookings and invoices..."
        />
      </div>

      <div className="flex justify-end pt-4">
        <button 
          disabled={isSaving}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? 'Updating...' : (
            <>
              <Save size={24} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </form>
  )
}
