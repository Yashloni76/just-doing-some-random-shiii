import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh the session if expired
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/onboarding')

  // Not logged in and accessing protected route -> Redirect to Login
  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Logged in user routing rules
  if (user) {
    // Determine if the user has a business profile by querying the businesses table
    // (Note: in production, one might embed this securely in auth metadata or use caching)
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    const hasBusiness = !!business

    // Logged in but trying to access login/home -> redirect to dashboard or onboarding
    if (isAuthPage || request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = hasBusiness ? '/dashboard/inventory' : '/onboarding'
      return NextResponse.redirect(url)
    }

    // Navigating to dashboard without a profile -> redirect to onboarding
    if (!hasBusiness && request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // Navigating to onboarding but already has a profile -> redirect to dashboard
    if (hasBusiness && request.nextUrl.pathname.startsWith('/onboarding')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/inventory'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
