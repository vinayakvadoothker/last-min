'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { Clock, Users, CheckCircle, QrCode } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import toast from 'react-hot-toast'

export function ProviderBookingsList() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get provider ID
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!provider) return

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          activities (
            id,
            title,
            activity_start_time
          ),
          profiles (
            full_name,
            email
          )
        `)
        .eq('provider_id', provider.id)
        .order('booked_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Booking checked in!')
      loadBookings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in')
    }
  }

  const startQRScanner = () => {
    setShowScanner(true)
  }

  useEffect(() => {
    if (!showScanner) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scanner.render(
      (decodedText) => {
        // Find booking by QR code
        const booking = bookings.find((b) => b.qr_code === decodedText)
        if (booking && !booking.checked_in) {
          handleCheckIn(booking.id)
          scanner.clear()
          setShowScanner(false)
        } else if (booking && booking.checked_in) {
          toast.error('This booking has already been checked in')
        } else {
          toast.error('Invalid QR code')
        }
      },
      (error) => {
        // Ignore scanning errors
      }
    )

    return () => {
      scanner.clear()
    }
  }, [showScanner, bookings])


  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.activities?.activity_start_time) > new Date()
  )
  const pastBookings = bookings.filter(
    (b) => new Date(b.activities?.activity_start_time) <= new Date() || b.status !== 'confirmed'
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={startQRScanner}>
          <QrCode className="h-4 w-4 mr-2" />
          Scan QR Code
        </Button>
      </div>

      {showScanner && (
        <Card>
          <CardHeader>
            <CardTitle>QR Code Scanner</CardTitle>
            <CardDescription>Scan a booking QR code to check in</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="qr-reader" className="w-full"></div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                setShowScanner(false)
              }}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCheckIn={() => handleCheckIn(booking.id)}
              />
            ))}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Bookings</h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCheckIn={() => handleCheckIn(booking.id)}
                readOnly
              />
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No bookings yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function BookingCard({
  booking,
  onCheckIn,
  readOnly = false,
}: {
  booking: any
  onCheckIn: () => void
  readOnly?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{booking.activities?.title || 'Activity'}</CardTitle>
            <CardDescription>
              {booking.profiles?.full_name || 'User'} • {booking.profiles?.email}
            </CardDescription>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            booking.checked_in ? 'bg-green-100 text-green-800' :
            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {booking.checked_in ? 'Checked In' : booking.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            {formatDateTime(booking.activities?.activity_start_time)}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            {booking.number_of_spots} {booking.number_of_spots === 1 ? 'spot' : 'spots'}
          </div>
        </div>
        <div className="text-lg font-bold text-primary mb-4">
          {formatPrice(booking.total_price)}
        </div>
        {!readOnly && !booking.checked_in && booking.status === 'confirmed' && (
          <Button onClick={onCheckIn} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Check In
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

