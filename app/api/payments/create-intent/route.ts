import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
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

    const { activity_id, number_of_spots } = await request.json()

    // Get activity details
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activity_id)
      .single()

    if (activityError || !activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (activity.available_spots < number_of_spots) {
      return NextResponse.json({ error: 'Not enough spots available' }, { status: 400 })
    }

    // Check if booking deadline has passed (allow bookings up to the deadline)
    const deadline = new Date(activity.booking_deadline)
    const now = new Date()
    if (deadline <= now) {
      return NextResponse.json({ error: 'Booking deadline has passed' }, { status: 400 })
    }

    const totalAmount = Math.round(activity.discount_price * number_of_spots * 100) // Convert to cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        activity_id,
        number_of_spots,
        user_id: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ client_secret: paymentIntent.client_secret })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

