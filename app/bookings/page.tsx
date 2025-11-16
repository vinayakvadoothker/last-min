import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { BookingsList } from '@/components/bookings-list'
import { Suspense } from 'react'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { success?: string; session_id?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If we have a session_id, try to verify the booking was created
  let bookingCreated = false
  if (searchParams.session_id) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (booking) {
      bookingCreated = true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        {searchParams.success === 'true' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              Payment successful! {bookingCreated ? 'Your booking has been confirmed.' : 'Your booking is being processed and will appear shortly.'}
            </p>
          </div>
        )}
        <Suspense fallback={<div>Loading bookings...</div>}>
          <BookingsList sessionId={searchParams.session_id} />
        </Suspense>
      </div>
    </div>
  )
}

