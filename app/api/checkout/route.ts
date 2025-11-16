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
      .select(`
        *,
        providers (
          id,
          name,
          address,
          city,
          state
        )
      `)
      .eq('id', activity_id)
      .single()

    if (activityError || !activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Validate booking
    if (activity.available_spots < number_of_spots) {
      return NextResponse.json({ error: 'Not enough spots available' }, { status: 400 })
    }

    // Check if booking deadline has passed
    const deadline = new Date(activity.booking_deadline)
    const now = new Date()
    if (deadline <= now) {
      return NextResponse.json({ error: 'Booking deadline has passed' }, { status: 400 })
    }

    // Check if activity is still active
    if (activity.status !== 'active') {
      return NextResponse.json({ error: 'Activity is not available for booking' }, { status: 400 })
    }

    const totalAmount = Math.round(activity.discount_price * number_of_spots * 100) // Convert to cents

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: activity.title,
              description: `${number_of_spots} spot${number_of_spots > 1 ? 's' : ''} for ${activity.title}`,
              images: activity.image_urls && activity.image_urls.length > 0 ? [activity.image_urls[0]] : undefined,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/bookings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/activities/${activity_id}?canceled=true`,
      customer_email: profile?.email || user.email,
      metadata: {
        activity_id,
        number_of_spots: number_of_spots.toString(),
        user_id: user.id,
        provider_id: activity.provider_id,
      },
      // Collect shipping address if needed (for physical activities)
      // shipping_address_collection: {
      //   allowed_countries: ['US', 'CA'],
      // },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 })
  }
}

