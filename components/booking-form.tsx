'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

export function BookingForm({ activity }: { activity: any }) {
  const router = useRouter()
  const [numberOfSpots, setNumberOfSpots] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    
    try {
      // Validate booking deadline before proceeding
      const deadline = new Date(activity.booking_deadline)
      const now = new Date()
      if (deadline <= now) {
        toast.error('Booking deadline has passed')
        setLoading(false)
        return
      }

      // Create Stripe Checkout Session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: activity.id,
          number_of_spots: numberOfSpots,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      toast.error(error.message || 'Failed to initialize checkout')
      setLoading(false)
    }
  }

  const handleSpotsChange = (spots: number) => {
    if (spots < 1 || spots > activity.available_spots) return
    setNumberOfSpots(spots)
  }

  const totalPrice = activity.discount_price * numberOfSpots

  // Check if booking deadline has passed
  const deadline = new Date(activity.booking_deadline)
  const now = new Date()
  const deadlinePassed = deadline <= now

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Number of Spots</label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSpotsChange(numberOfSpots - 1)}
            disabled={numberOfSpots <= 1 || loading}
          >
            -
          </Button>
          <Input
            type="number"
            min={1}
            max={activity.available_spots}
            value={numberOfSpots}
            onChange={(e) => handleSpotsChange(parseInt(e.target.value) || 1)}
            className="w-20 text-center"
            disabled={loading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSpotsChange(numberOfSpots + 1)}
            disabled={numberOfSpots >= activity.available_spots || loading}
          >
            +
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {activity.available_spots} spots available
        </p>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span>Price per spot:</span>
          <span className="font-medium">${activity.discount_price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Number of spots:</span>
          <span className="font-medium">{numberOfSpots}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {deadlinePassed ? (
        <div className="text-center text-sm text-red-600 py-2">
          Booking deadline has passed
        </div>
      ) : (
        <Button
          onClick={handleCheckout}
          className="w-full"
          disabled={loading || numberOfSpots < 1 || numberOfSpots > activity.available_spots || activity.available_spots < numberOfSpots}
        >
          {loading ? 'Processing...' : `Checkout - $${totalPrice.toFixed(2)}`}
        </Button>
      )}
    </div>
  )
}

