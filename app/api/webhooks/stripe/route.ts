import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  let event: Stripe.Event

  // If webhook secret is provided, verify signature
  // Otherwise, parse the event directly (for local development or if not using webhook secrets)
  if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
  } else {
    // For local development or when webhook secret is not configured
    // Parse the event directly from the body
    try {
      event = JSON.parse(body) as Stripe.Event
    } catch (err: any) {
      console.error('Failed to parse webhook event:', err.message)
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }
  }

  const supabase = await createClient()

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Create booking when checkout is completed
      if (session.metadata?.activity_id && session.metadata?.number_of_spots && session.metadata?.user_id) {
        const activityId = session.metadata.activity_id
        const numberOfSpots = parseInt(session.metadata.number_of_spots)
        const userId = session.metadata.user_id

        // Get activity details
        const { data: activity } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single()

        if (activity) {
          // Get provider_id from activity
          const providerId = activity.provider_id
          
          // Create booking
          const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
              user_id: userId,
              activity_id: activityId,
              provider_id: providerId,
              number_of_spots: numberOfSpots,
              total_price: activity.discount_price * numberOfSpots,
              price_per_spot: activity.discount_price,
              payment_status: 'paid',
              payment_intent_id: session.payment_intent as string,
              status: 'confirmed',
            })
            .select()
            .single()

          if (bookingError) {
            console.error('Error creating booking:', bookingError)
            // Log full error for debugging
            console.error('Booking error details:', {
              error: bookingError,
              userId,
              activityId,
              numberOfSpots,
              providerId
            })
          } else {
            console.log('Booking created successfully:', {
              bookingId: booking?.id,
              activityId,
              numberOfSpots
            })
            
            // Update available spots
            const { error: updateError } = await supabase
              .from('activities')
              .update({ 
                available_spots: activity.available_spots - numberOfSpots,
                ...(activity.available_spots - numberOfSpots === 0 ? { status: 'sold_out' } : {})
              })
              .eq('id', activityId)
            
            if (updateError) {
              console.error('Error updating activity spots:', updateError)
            }

            // Send confirmation emails (don't wait for them to complete)
            if (booking?.id) {
              console.log('Sending confirmation emails for booking:', booking.id)
              
              // Send customer confirmation email
              fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/api/bookings/send-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id }),
              })
              .then(async (response) => {
                if (!response.ok) {
                  const error = await response.json()
                  console.error('Customer email failed:', error)
                } else {
                  console.log('Customer confirmation email sent successfully')
                }
              })
              .catch((emailError) => {
                console.error('Error sending customer confirmation email:', emailError)
                // Don't fail the webhook if email fails
              })

              // Send partner confirmation email
              fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/api/bookings/send-partner-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id }),
              })
              .then(async (response) => {
                if (!response.ok) {
                  const error = await response.json()
                  console.error('Partner email failed:', error)
                } else {
                  console.log('Partner confirmation email sent successfully')
                }
              })
              .catch((emailError) => {
                console.error('Error sending partner confirmation email:', emailError)
                // Don't fail the webhook if email fails
              })
            }
          }
        }
      }
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      // Update booking payment status if it exists
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('payment_intent_id', paymentIntent.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object as Stripe.PaymentIntent
      // Update booking payment status
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('payment_intent_id', failedPayment.id)
      break
    }

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

