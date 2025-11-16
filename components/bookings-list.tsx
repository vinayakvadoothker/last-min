'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

export function BookingsList({ sessionId }: { sessionId?: string }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    let intervals: NodeJS.Timeout[] = []
    let interval: NodeJS.Timeout | null = null

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Set up real-time subscription for booking updates and inserts
      const channel = supabase
        .channel(`bookings-updates-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('New booking created:', payload)
            // Reload bookings immediately when a new booking is created
            loadBookings()
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Booking updated:', payload)
            // Reload bookings when any booking is updated
            loadBookings()
          }
        )
        .subscribe()
      
      channelRef.current = channel
    }

    // Sync on every page load - check for any recent bookings that might be missing
    const syncRecentBookings = async () => {
      try {
        // If we have a specific session ID, sync that first
        if (sessionId) {
          console.log('Syncing specific session:', sessionId)
          const sessionResponse = await fetch('/api/bookings/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          })
          const sessionResult = await sessionResponse.json()
          if (sessionResult.success) {
            console.log('Session synced successfully:', sessionResult)
            // Reload bookings after sync
            setTimeout(() => loadBookings(), 500)
            return // If specific session sync worked, we're done
          }
        }

        // Always sync recent bookings on page load to catch any missed webhooks
        console.log('Syncing recent bookings...')
        const response = await fetch('/api/bookings/sync-recent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        const result = await response.json()
        if (result.synced && result.count > 0) {
          console.log(`Synced ${result.count} booking(s)`)
          // Reload bookings after sync
          setTimeout(() => loadBookings(), 500)
        }
      } catch (error) {
        console.error('Error syncing bookings:', error)
      }
    }

    loadBookings()
    setupRealtime()
    syncRecentBookings()

    // If we just completed checkout, refresh more aggressively
    if (sessionId) {
      // Refresh immediately, then every 1 second for 10 seconds
      for (let i = 1; i <= 10; i++) {
        intervals.push(
          setTimeout(() => {
            loadBookings()
          }, i * 1000)
        )
      }
    } else {
      // Normal refresh every 30 seconds to catch updates
      interval = setInterval(() => {
        loadBookings()
      }, 30000)
    }
    
    return () => {
      intervals.forEach(clearTimeout)
      if (interval) clearInterval(interval)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [sessionId])

  const loadBookings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          activities (
            id,
            title,
            activity_start_time,
            activity_end_time,
            image_urls
          ),
          providers (
            name,
            address,
            city
          )
        `)
        .eq('user_id', user.id)
        .order('booked_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
      
      // If no bookings and we have a session ID, try to sync from Stripe
      if (data?.length === 0 && sessionId) {
        // Try to find recent payment intents and sync them
        try {
          const response = await fetch('/api/bookings/sync-recent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
          const result = await response.json()
          if (result.synced) {
            // Reload bookings after sync
            setTimeout(() => loadBookings(), 1000)
          }
        } catch (syncError) {
          console.error('Error syncing bookings:', syncError)
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>
  }

  const handleSyncRecent = async () => {
    try {
      const response = await fetch('/api/bookings/sync-recent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await response.json()
      
      if (result.error) {
        toast.error(result.error)
        console.error('Sync error:', result)
        return
      }
      
      if (result.synced) {
        toast.success(`Synced ${result.count} booking(s)!`)
        loadBookings()
      } else {
        if (result.errors && result.errors.length > 0) {
          console.error('Sync errors:', result.errors)
          toast.error(`No bookings found. Check console for details.`)
        } else {
          toast.error('No recent bookings found to sync')
        }
      }
    } catch (error) {
      console.error('Error syncing bookings:', error)
      toast.error('Failed to sync bookings')
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button onClick={loadBookings} variant="outline">
            Refresh
          </Button>
          <Button onClick={handleSyncRecent} variant="outline">
            Sync Recent Payments
          </Button>
          <Link href="/activities">
            <Button>Browse Activities</Button>
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          If you just completed a payment, click "Sync Recent Payments" to create your booking.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{booking.activities?.title || 'Activity'}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {booking.providers?.name} • {booking.providers?.city}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </div>
                {booking.checked_in && (
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Checked In
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Date & Time</span>
                </div>
                <p>{formatDateTime(booking.activities?.activity_start_time)}</p>
                <p className="text-sm text-gray-500">
                  {booking.number_of_spots} {booking.number_of_spots === 1 ? 'spot' : 'spots'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600 font-medium">Total Price</div>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(booking.total_price)}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  {booking.payment_status === 'paid' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Paid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">{booking.payment_status}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {booking.qr_code && booking.status === 'confirmed' && !booking.checked_in && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Check-in QR Code</p>
                    <div className="flex justify-center">
                      <QRCodeSVG value={booking.qr_code} size={120} />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Show this at check-in
                    </p>
                  </div>
                )}
                {booking.checked_in && (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-600">Checked In</p>
                    {booking.checked_in_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(booking.checked_in_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link href={`/activities/${booking.activities?.id}`}>
                <Button variant="outline" size="sm">
                  View Activity
                </Button>
              </Link>
              {booking.status === 'confirmed' && (
                <Link href={`/bookings/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

