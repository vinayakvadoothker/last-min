import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { formatPrice, formatDateTime } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        activities (
          id,
          title,
          description,
          activity_start_time,
          activity_end_time,
          location,
          image_urls,
          provider_id
        ),
        profiles (
          email,
          full_name,
          phone
        ),
        providers (
          id,
          name,
          email,
          address,
          city,
          phone,
          user_id
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const activity = booking.activities
    const provider = booking.providers
    const customer = booking.profiles

    if (!provider) {
      console.error('Provider not found for booking:', bookingId)
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Get provider email - check provider.email first, then get from user profile
    let providerEmail = provider.email
    if (!providerEmail && provider.user_id) {
      const { data: providerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', provider.user_id)
        .single()
      
      if (providerProfile?.email) {
        providerEmail = providerProfile.email
      }
    }

    if (!providerEmail) {
      console.error('Provider email not found for booking:', bookingId)
      return NextResponse.json({ error: 'Provider email not found' }, { status: 404 })
    }

    // Format activity date/time
    const activityDate = activity?.activity_start_time
      ? formatDateTime(activity.activity_start_time)
      : 'TBD'
    
    const activityEnd = activity?.activity_end_time
      ? formatDateTime(activity.activity_end_time)
      : null

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { color: #333; margin-bottom: 15px; }
            .price { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 New Booking Received!</h1>
              <p>You have a new booking for your activity</p>
            </div>
            <div class="content">
              <p>Hi ${provider.name || 'Provider'},</p>
              <p>Great news! You've received a new booking. Here are the details:</p>

              <div class="info-card">
                <div class="label">Activity</div>
                <div class="value" style="font-size: 20px; font-weight: bold;">${activity?.title || 'Activity'}</div>
              </div>

              <div class="info-card">
                <div class="label">Date & Time</div>
                <div class="value">${activityDate}${activityEnd ? ` - ${activityEnd}` : ''}</div>
              </div>

              ${activity?.location ? `
              <div class="info-card">
                <div class="label">Location</div>
                <div class="value">${activity.location}</div>
              </div>
              ` : ''}

              <div class="info-card">
                <div class="label">Customer Details</div>
                <div class="value">
                  <strong>${customer?.full_name || 'Guest'}</strong><br>
                  ${customer?.email || 'N/A'}<br>
                  ${customer?.phone ? `Phone: ${customer.phone}` : ''}
                </div>
              </div>

              <div class="info-card">
                <div class="label">Number of Spots</div>
                <div class="value" style="font-size: 18px;">${booking.number_of_spots} ${booking.number_of_spots === 1 ? 'spot' : 'spots'}</div>
              </div>

              <div class="info-card">
                <div class="label">Total Amount</div>
                <div class="price">${formatPrice(booking.total_price)}</div>
                <div style="font-size: 12px; color: #666;">Payment Status: ${booking.payment_status === 'paid' ? '✅ Paid' : booking.payment_status}</div>
              </div>

              <div class="highlight">
                <strong>📋 Action Required:</strong><br>
                Please prepare for this booking and be ready to check in the customer at the scheduled time.
              </div>

              <div style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:6060'}/provider/bookings" class="button">
                  View Booking in Dashboard
                </a>
              </div>

              <div class="footer">
                <p>Thank you for using Last-Min!</p>
                <p>You can manage all your bookings from your provider dashboard.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Send email
    console.log('Sending partner confirmation email to:', providerEmail)
    const emailResult = await resend.emails.send({
      from: 'Last-Min <onboarding@resend.dev>', // Update with your verified domain
      to: providerEmail,
      subject: `New Booking: ${activity?.title || 'Activity'} - ${customer?.full_name || 'Guest'}`,
      html: emailHtml,
    })

    console.log('Partner email sent successfully:', emailResult)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending partner confirmation email:', error)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    })
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 })
  }
}

