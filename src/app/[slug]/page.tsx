import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import PublicStorefrontClient from '@/components/public/PublicStorefrontClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function PublicStorefrontPage({ params }: PageProps) {
  const supabase = createClient()
  const { slug } = params

  // 1. Fetch business details
  const { data: business, error: bError } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (bError || !business) {
    return notFound()
  }

  // 2. Fetch inventory items
  const { data: items, error: iError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('business_id', business.id)
    .order('category', { ascending: true })

  if (iError) {
    console.error('Error fetching inventory:', iError)
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicStorefrontClient 
        business={business} 
        items={items || []} 
      />
    </div>
  )
}
