'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { MapPin, Clock, Users, Star, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { BookingForm } from './booking-form'

// Helper function to generate Google Maps URL
function getGoogleMapsUrl(provider: any): string {
  // If we have coordinates, use them (most accurate)
  if (provider?.latitude && provider?.longitude) {
    return `https://www.google.com/maps?q=${provider.latitude},${provider.longitude}`
  }
  
  // Otherwise, use the address
  if (provider?.address) {
    const addressParts = [
      provider.address,
      provider.city,
      provider.state,
      provider.country
    ].filter(Boolean)
    const address = encodeURIComponent(addressParts.join(', '))
    return `https://www.google.com/maps/search/?api=1&query=${address}`
  }
  
  // Fallback to just city if nothing else is available
  if (provider?.city) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.city)}`
  }
  
  return 'https://www.google.com/maps'
}

export function ActivityDetail({ activityId }: { activityId: string }) {
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadActivity()
  }, [activityId])

  const loadActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          providers (
            id,
            name,
            description,
            address,
            city,
            state,
            latitude,
            longitude,
            phone,
            email,
            website,
            rating_average,
            rating_count
          )
        `)
        .eq('id', activityId)
        .single()

      if (error) throw error
      setActivity(data)
    } catch (error) {
      console.error('Error loading activity:', error)
    setActivity(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Activity not found.</p>
        <Link href="/activities">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/activities">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activities
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activity.image_urls && activity.image_urls[0] && (
            <div className="relative h-96 w-full rounded-lg overflow-hidden">
              <Image
                src={activity.image_urls[0]}
                alt={activity.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{activity.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <MapPin className="h-4 w-4" />
                {activity.location ? (
                  <span>{activity.location}</span>
                ) : (
                  <span>{activity.providers?.name} • {activity.providers?.city}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Activity Location */}
                {activity.location && (
                  <div className="flex items-center gap-2 flex-wrap pb-4 border-b">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{activity.location}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => {
                        const mapsUrl = getGoogleMapsUrl({ address: activity.location })
                        window.open(mapsUrl, '_blank', 'noopener,noreferrer')
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open in Maps
                    </Button>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{activity.description || 'No description available.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Start Time</div>
                      <div className="font-medium">{formatDateTime(activity.activity_start_time)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Available Spots</div>
                      <div className="font-medium">{activity.available_spots} of {activity.total_spots}</div>
                    </div>
                  </div>
                </div>

                {activity.providers?.rating_average && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{activity.providers.rating_average.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({activity.providers.rating_count} reviews)
                    </span>
                  </div>
                )}

                {activity.tags && activity.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {activity.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {activity.providers && (
            <Card>
              <CardHeader>
                <CardTitle>About {activity.providers.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{activity.providers.description || 'No description available.'}</p>
                <div className="space-y-2 text-sm">
                  {activity.providers.address && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {activity.providers.address}, {activity.providers.city}
                        {activity.providers.state && `, ${activity.providers.state}`}
                      </span>
                      {(activity.providers.latitude && activity.providers.longitude) || activity.providers.address ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          onClick={() => {
                            const mapsUrl = getGoogleMapsUrl(activity.providers)
                            window.open(mapsUrl, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open in Maps
                        </Button>
                      ) : null}
                    </div>
                  )}
                  {activity.providers.phone && (
                    <div>Phone: {activity.providers.phone}</div>
                  )}
                  {activity.providers.email && (
                    <div>Email: {activity.providers.email}</div>
                  )}
                  {activity.providers.website && (
                    <div>
                      Website:{' '}
                      <a
                        href={activity.providers.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {activity.providers.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Book Now</CardTitle>
              <CardDescription>
                {activity.available_spots > 0
                  ? `${activity.available_spots} spots available`
                  : 'Sold out'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatPrice(activity.discount_price)}
                  </div>
                  {activity.regular_price > activity.discount_price && (
                    <>
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(activity.regular_price)}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {activity.discount_percentage}% off
                      </div>
                    </>
                  )}
                </div>

                {activity.available_spots > 0 ? (
                  <BookingForm activity={activity} />
                ) : (
                  <Button disabled className="w-full">
                    Sold Out
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

