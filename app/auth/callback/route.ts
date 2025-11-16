import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/activities'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to login with error
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'verification_failed')
      return NextResponse.redirect(loginUrl)
    }
    
    // If successful, ensure admin role for vinvadoothker@gmail.com
    if (data.user?.email === 'vinvadoothker@gmail.com') {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (existingProfile) {
        // Update to admin if not already
        if (existingProfile.role !== 'admin') {
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', data.user.id)
        }
      } else {
        // Create profile with admin role
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            role: 'admin',
          })
      }
    }
    
    // If successful, user is now signed in
    // Redirect to activities page
    return NextResponse.redirect(new URL('/activities', requestUrl.origin))
  }

  // If no code, redirect to activities (user might already be signed in)
  return NextResponse.redirect(new URL('/activities', requestUrl.origin))
}

