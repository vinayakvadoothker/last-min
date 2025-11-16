import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activity_id, number_of_spots, payment_intent_id } = await request.json()

    // Get activity details
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('*, providers(id)')
      .eq('id', activity_id)
      .single()

    if (activityError || !activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (activity.available_spots < number_of_spots) {
      return NextResponse.json({ error: 'Not enough spots available' }, { status: 400 })
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        activity_id,
        provider_id: activity.providers.id,
        number_of_spots,
        total_price: activity.discount_price * number_of_spots,
        price_per_spot: activity.discount_price,
        payment_intent_id,
        payment_status: 'paid',
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    return NextResponse.json(booking)
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

