'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface LocationPickerProps {
  value?: string
  onChange?: (location: string) => void
  placeholder?: string
  className?: string
}

export function LocationPicker({ 
  value = '', 
  onChange, 
  placeholder = 'Enter city, district, or area',
  className 
}: LocationPickerProps) {
  const [location, setLocation] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocation(value)
  }, [value])

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation)
    onChange?.(newLocation)
    
    // Simple autocomplete - you can enhance this with a geocoding API
    if (newLocation.length > 2) {
      // Mock suggestions - replace with actual geocoding API
      const mockSuggestions = [
        `${newLocation}, San Francisco, CA`,
        `${newLocation}, Los Angeles, CA`,
        `${newLocation}, New York, NY`,
        `${newLocation}, Chicago, IL`,
      ]
      setSuggestions(mockSuggestions.slice(0, 3))
    } else {
      setSuggestions([])
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          // Reverse geocode - you can use a service like OpenStreetMap Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const address = data.display_name || `${latitude}, ${longitude}`
            handleLocationChange(address)
            setIsOpen(false)
          } catch (error) {
            const address = `${latitude}, ${longitude}`
            handleLocationChange(address)
            setIsOpen(false)
          }
        },
        () => {
          alert('Location access denied')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder={placeholder}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="p-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start mb-2"
              onClick={handleUseCurrentLocation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
            {suggestions.length > 0 && (
              <div className="border-t pt-2">
                <div className="text-xs text-gray-500 mb-1 px-2">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                    onClick={() => {
                      handleLocationChange(suggestion)
                      setIsOpen(false)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

