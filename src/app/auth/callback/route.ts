import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if they have a business profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (business) {
          return NextResponse.redirect(`${requestUrl.origin}/dashboard/inventory`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        }
      }
    }
  }

  // Return the user to login with instructions if callback fails
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not verify your magic link`)
}
