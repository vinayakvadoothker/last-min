import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

// Sync a specific checkout session immediately
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Check if session is completed and paid
    if (session.payment_status !== 'paid' || session.status !== 'complete') {
      return NextResponse.json({ 
        error: 'Session not completed',
        payment_status: session.payment_status,
        status: session.status
      }, { status: 400 })
    }

    // Get payment intent ID
    const paymentIntentId = session.payment_intent as string
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'No payment intent found' }, { status: 400 })
    }

    // Check if booking already exists
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    if (existingBooking) {
      return NextResponse.json({ 
        success: true, 
        bookingId: existingBooking.id,
        message: 'Booking already exists'
      })
    }

    // Check metadata
    const metadata = session.metadata
    if (!metadata || !metadata.activity_id || !metadata.number_of_spots || !metadata.user_id) {
      return NextResponse.json({ error: 'Missing metadata in session' }, { status: 400 })
    }

    // Verify this session belongs to the current user
    if (metadata.user_id !== user.id) {
      return NextResponse.json({ error: 'Session does not belong to current user' }, { status: 403 })
    }

    const activityId = metadata.activity_id
    const numberOfSpots = parseInt(metadata.number_of_spots)

    // Get activity details
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single()

    if (activityError || !activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const providerId = activity.provider_id

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        activity_id: activityId,
        provider_id: providerId,
        number_of_spots: numberOfSpots,
        total_price: activity.discount_price * numberOfSpots,
        price_per_spot: activity.discount_price,
        payment_status: 'paid',
        payment_intent_id: paymentIntentId,
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json({ 
        error: 'Failed to create booking',
        details: bookingError.message
      }, { status: 500 })
    }

    // Update available spots
    await supabase
      .from('activities')
      .update({ 
        available_spots: activity.available_spots - numberOfSpots,
        ...(activity.available_spots - numberOfSpots === 0 ? { status: 'sold_out' } : {})
      })
      .eq('id', activityId)

    // Send confirmation emails (don't wait)
    if (booking?.id) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/api/bookings/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      }).catch((err) => console.error('Email error:', err))

      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/api/bookings/send-partner-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      }).catch((err) => console.error('Partner email error:', err))
    }

    return NextResponse.json({ 
      success: true, 
      bookingId: booking?.id,
      message: 'Booking created successfully'
    })
  } catch (error: any) {
    console.error('Error syncing session:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to sync session',
      details: error.stack
    }, { status: 500 })
  }
}

