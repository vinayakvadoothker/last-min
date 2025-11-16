import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Test endpoint to manually trigger email sending
// Usage: POST /api/bookings/test-email with { bookingId: "..." }
export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY is not configured',
        hint: 'Please add RESEND_API_KEY to your .env.local file'
      }, { status: 500 })
    }

    // Try to send customer email
    const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/api/bookings/send-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })

    const customerResult = await customerResponse.json()

    // Try to send partner email
    const partnerResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/api/bookings/send-partner-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })

    const partnerResult = await partnerResponse.json()

    return NextResponse.json({
      success: true,
      customer: {
        sent: customerResponse.ok,
        result: customerResult,
      },
      partner: {
        sent: partnerResponse.ok,
        result: partnerResult,
      },
      envCheck: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060',
      },
    })
  } catch (error: any) {
    console.error('Error testing email:', error)
    return NextResponse.json({ 
      error: error.message,
      envCheck: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060',
      },
    }, { status: 500 })
  }
}

