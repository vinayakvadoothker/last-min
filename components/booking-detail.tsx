'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { Clock, MapPin, Users, CheckCircle, XCircle, ArrowLeft, ExternalLink, QrCode, Mail, Phone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Image from 'next/image'

export function BookingDetail({ bookingId, userId }: { bookingId: string; userId: string }) {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const loadBooking = async () => {
    try {
      const { data, error } = await supabase
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
            category,
            tags,
            providers (
              id,
              name,
              address,
              city,
              state,
              country,
              phone,
              email,
              latitude,
              longitude
            )
          ),
          profiles (
            email,
            full_name,
            phone
          )
        `)
        .eq('id', bookingId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setBooking(data)
    } catch (error: any) {
      console.error('Error loading booking:', error)
      if (error.code === 'PGRST116') {
        // Not found or not authorized
        setBooking(null)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500">Loading booking details...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
        <p className="text-gray-500 mb-4">This booking doesn't exist or you don't have access to it.</p>
        <Link href="/bookings">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Button>
        </Link>
      </div>
    )
  }

  const activity = booking.activities
  const provider = activity?.providers

  // Generate Google Maps URL
  const getGoogleMapsUrl = () => {
    if (activity?.location) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`
    }
    if (provider?.latitude && provider?.longitude) {
      return `https://www.google.com/maps?q=${provider.latitude},${provider.longitude}`
    }
    if (provider?.address) {
      const addressParts = [
        provider.address,
        provider.city,
        provider.state,
        provider.country
      ].filter(Boolean)
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts.join(', '))}`
    }
    if (provider?.city) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.city)}`
    }
    return null
  }

  const mapsUrl = getGoogleMapsUrl()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/bookings">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Bookings
        </Button>
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{activity?.title || 'Activity'}</h1>
          <p className="text-gray-600">Booking Details</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            booking.status === 'confirmed'
              ? 'bg-green-100 text-green-800'
              : booking.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {booking.status}
          </div>
          {booking.checked_in && (
            <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Checked In
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Image */}
          {activity?.image_urls && activity.image_urls[0] && (
            <Card>
              <div className="relative h-64 w-full">
                <Image
                  src={activity.image_urls[0]}
                  alt={activity.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            </Card>
          )}

          {/* Activity Details */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity?.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{activity.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Start Time</span>
                  </div>
                  <p>{formatDateTime(activity?.activity_start_time)}</p>
                </div>
                {activity?.activity_end_time && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">End Time</span>
                    </div>
                    <p>{formatDateTime(activity.activity_end_time)}</p>
                  </div>
                )}
              </div>

              {activity?.location && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="mb-2">{activity.location}</p>
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Maps
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {activity?.tags && activity.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider Information */}
          {provider && (
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{provider.name}</h3>
                  {provider.address && (
                    <div className="flex items-start gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div>
                        <p>{provider.address}</p>
                        <p>{[provider.city, provider.state, provider.country].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                  )}
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Maps
                      </Button>
                    </a>
                  )}
                </div>
                {provider.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${provider.phone}`} className="hover:text-primary">
                      {provider.phone}
                    </a>
                  </div>
                )}
                {provider.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${provider.email}`} className="hover:text-primary">
                      {provider.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Number of Spots</div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-lg font-semibold">
                    {booking.number_of_spots} {booking.number_of_spots === 1 ? 'spot' : 'spots'}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Price per Spot</div>
                <p className="text-lg font-semibold">{formatPrice(booking.price_per_spot)}</p>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                <p className="text-3xl font-bold text-primary">{formatPrice(booking.total_price)}</p>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Payment Status</div>
                <div className="flex items-center gap-2">
                  {booking.payment_status === 'paid' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Paid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">{booking.payment_status}</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Booked On</div>
                <p>{formatDateTime(booking.booked_at)}</p>
              </div>

              {booking.checked_in_at && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Checked In At</div>
                  <p>{formatDateTime(booking.checked_in_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          {booking.qr_code && booking.status === 'confirmed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Check-in QR Code
                </CardTitle>
                <CardDescription>
                  Show this QR code at check-in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG value={booking.qr_code} size={200} />
                  </div>
                  {booking.checked_in ? (
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-600">Already Checked In</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center">
                      Present this QR code to the provider at the activity location
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Link href={`/activities/${activity?.id}`} className="block">
              <Button variant="outline" className="w-full">
                View Activity
              </Button>
            </Link>
            <Link href="/bookings">
              <Button variant="outline" className="w-full">
                Back to My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

