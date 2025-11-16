'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import { useEffect } from 'react'

// Fix for default marker icons in Next.js
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapProps {
  center: LatLngExpression
  zoom?: number
  className?: string
  children?: React.ReactNode
}

export function Map({ center, zoom = 13, className = 'h-[400px] w-full', children }: MapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  )
}

interface MapMarkerProps {
  position: LatLngExpression
  children?: React.ReactNode
}

export function MapMarker({ position, children }: MapMarkerProps) {
  return (
    <Marker position={position}>
      {children && <Popup>{children}</Popup>}
    </Marker>
  )
}

interface MapPopupProps {
  children: React.ReactNode
}

export function MapPopup({ children }: MapPopupProps) {
  return <Popup>{children}</Popup>
}

interface MapZoomControlProps {
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright'
}

export function MapZoomControl({ position = 'topright' }: MapZoomControlProps) {
  const map = useMap()
  
  useEffect(() => {
    // Zoom controls are handled by Leaflet automatically
    // This is just a placeholder component for compatibility
  }, [map])
  
  return null
}

interface MapLocateControlProps {
  watch?: boolean
  onLocationFound?: (location: any) => void
  onLocationError?: (error: any) => void
}

export function MapLocateControl({ watch = false, onLocationFound, onLocationError }: MapLocateControlProps) {
  const map = useMap()
  
  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
    
    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords
      const location = [latitude, longitude] as LatLngExpression
      
      map.setView(location, 15)
      
      if (onLocationFound) {
        onLocationFound({
          latlng: L.latLng(latitude, longitude),
          bounds: map.getBounds(),
          accuracy: position.coords.accuracy,
        })
      }
    }
    
    const error = (err: GeolocationPositionError) => {
      if (onLocationError) {
        onLocationError(err)
      }
    }
    
    if (watch) {
      const watchId = navigator.geolocation.watchPosition(success, error, options)
      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      navigator.geolocation.getCurrentPosition(success, error, options)
    }
  }, [map, watch, onLocationFound, onLocationError])
  
  return null
}

