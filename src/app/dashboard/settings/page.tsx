import { createClient } from '@/utils/supabase/server'
import SettingsDashboard from '@/components/settings/SettingsDashboard'

export default async function SettingsPage() {
  const supabase = createClient()
  
  const DUMMY_BUSINESS_ID = '00000000-0000-0000-0000-000000000001'
  
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', DUMMY_BUSINESS_ID)
    .single()
    
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Business Settings</h1>
      <SettingsDashboard initialBusiness={business} />
    </div>
  )
}
