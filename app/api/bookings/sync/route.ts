import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

// This endpoint allows manually syncing bookings from Stripe payment intents
// Useful if webhook didn't fire or was delayed
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { payment_intent_id } = await request.json()

    if (!payment_intent_id) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 })
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not succeeded' }, { status: 400 })
    }

    // Check if booking already exists
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('payment_intent_id', payment_intent_id)
      .single()

    if (existingBooking) {
      return NextResponse.json({ 
        message: 'Booking already exists',
        booking_id: existingBooking.id 
      })
    }

    // Get metadata from payment intent
    const metadata = paymentIntent.metadata
    if (!metadata.activity_id || !metadata.number_of_spots || !metadata.user_id) {
      return NextResponse.json({ 
        error: 'Missing required metadata in payment intent' 
      }, { status: 400 })
    }

    // Verify user matches
    if (metadata.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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
        payment_intent_id: payment_intent_id,
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json({ 
        error: bookingError.message || 'Failed to create booking' 
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

    return NextResponse.json({ 
      message: 'Booking created successfully',
      booking 
    })
  } catch (error: any) {
    console.error('Error syncing booking:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to sync booking' 
    }, { status: 500 })
  }
}

