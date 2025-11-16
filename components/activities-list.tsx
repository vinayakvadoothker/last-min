'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice, formatDateTime, calculateDistance } from '@/lib/utils'
import Link from 'next/link'
import { MapPin, Clock, Users, Star, Search, Filter, Sparkles, TrendingUp, Map, X } from 'lucide-react'
import Image from 'next/image'

const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: '🌟' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'wellness', label: 'Wellness', icon: '🧘' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'arts', label: 'Arts', icon: '🎨' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'food-drink', label: 'Food & Drink', icon: '🍕' },
  { value: 'outdoor', label: 'Outdoor', icon: '🌲' },
]

const SORT_OPTIONS = [
  { value: 'date', label: 'Starting Soon' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'discount', label: 'Best Deals' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'rating', label: 'Highest Rated' },
]

export function ActivitiesList() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => {
          console.log('Location access denied')
        }
      )
    }

    // Fetch activities
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      setLoading(true)
      
      // First try with full query including providers
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          providers (
            id,
            name,
            city,
            latitude,
            longitude,
            rating_average
          )
        `)
        .eq('status', 'active')
        .gt('booking_deadline', new Date().toISOString())
        .order('activity_start_time', { ascending: true })
        .limit(100)

      if (error) {
        console.error('Error loading activities:', error)
        // If RLS error or join error, try without provider join
        if (error.code === 'PGRST301' || error.code === 'PGRST116' || error.message?.includes('permission') || error.message?.includes('relation')) {
          console.log('Trying simple query without provider join...')
          const { data: simpleData, error: simpleError } = await supabase
            .from('activities')
            .select('*')
            .eq('status', 'active')
            .gt('booking_deadline', new Date().toISOString())
            .order('activity_start_time', { ascending: true })
            .limit(100)
          
          if (simpleError) {
            console.error('Error loading activities (simple query):', simpleError)
            // Try even simpler - just get all active activities
            const { data: allActive, error: allError } = await supabase
              .from('activities')
              .select('*')
              .eq('status', 'active')
              .order('activity_start_time', { ascending: true })
              .limit(100)
            
            if (allError) {
              console.error('Error loading all active activities:', allError)
              setActivities([])
              return
            }
            
            console.log('Loaded activities (no deadline filter):', allActive?.length)
            setActivities(allActive || [])
            return
          }
          
          console.log('Loaded activities (simple query):', simpleData?.length)
          setActivities(simpleData || [])
          return
        }
        throw error
      }

      console.log('Loaded activities (full query):', data?.length)

      // Calculate distances if user location is available
      let activitiesWithDistance = data || []
      if (userLocation) {
        activitiesWithDistance = activitiesWithDistance.map((activity: any) => {
          if (activity.providers?.latitude && activity.providers?.longitude) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lon,
              activity.providers.latitude,
              activity.providers.longitude
            )
            return { ...activity, distance: Math.round(distance * 10) / 10 }
          }
          return activity
        })
      }

      setActivities(activitiesWithDistance)
    } catch (error) {
      console.error('Error loading activities:', error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    let filtered = [...activities]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((activity) => {
        const titleMatch = activity.title?.toLowerCase().includes(query)
        const descMatch = activity.description?.toLowerCase().includes(query)
        const categoryMatch = activity.category?.toLowerCase().includes(query)
        const subcategoryMatch = activity.subcategory?.toLowerCase().includes(query)
        const tagsMatch = activity.tags?.some((tag: string) => tag.toLowerCase().includes(query))
        const locationMatch = activity.location?.toLowerCase().includes(query)
        const providerMatch = activity.providers?.name?.toLowerCase().includes(query)
        
        return titleMatch || descMatch || categoryMatch || subcategoryMatch || tagsMatch || locationMatch || providerMatch
      })
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((activity) => activity.category === selectedCategory)
    }

    // Price range filter
    filtered = filtered.filter((activity) => {
      const price = activity.discount_price || activity.regular_price
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discount_price || a.regular_price) - (b.discount_price || b.regular_price)
        case 'price-high':
          return (b.discount_price || b.regular_price) - (a.discount_price || a.regular_price)
        case 'discount':
          const discountA = ((a.regular_price - a.discount_price) / a.regular_price) * 100
          const discountB = ((b.regular_price - b.discount_price) / b.regular_price) * 100
          return discountB - discountA
        case 'distance':
          return (a.distance || 999) - (b.distance || 999)
        case 'rating':
          return (b.providers?.rating_average || 0) - (a.providers?.rating_average || 0)
        case 'date':
        default:
          return new Date(a.activity_start_time).getTime() - new Date(b.activity_start_time).getTime()
      }
    })

    return filtered
  }, [activities, searchQuery, selectedCategory, sortBy, priceRange])

  // Calculate max price for slider
  const maxPrice = useMemo(() => {
    if (activities.length === 0) return 1000
    return Math.max(...activities.map(a => a.discount_price || a.regular_price || 0), 1000)
  }, [activities])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500">Loading amazing activities...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No activities available at the moment.</p>
        <Button onClick={loadActivities}>Refresh</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search activities, locations, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-2"
          >
            🌟 All
          </Button>
          {CATEGORIES.slice(1).map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className="flex items-center gap-2"
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        {/* Sort and Advanced Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <div className="text-sm text-gray-500 ml-auto">
            {filteredAndSortedActivities.length} {filteredAndSortedActivities.length === 1 ? 'activity' : 'activities'} found
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                      className="w-24"
                      min="0"
                    />
                    <span className="text-gray-400">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || maxPrice])}
                      className="w-24"
                      min="0"
                    />
                  </div>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="10"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Activities Grid */}
      {filteredAndSortedActivities.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No activities match your filters.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setPriceRange([0, maxPrice])
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedActivities.map((activity) => {
            const discountPercent = activity.regular_price > activity.discount_price
              ? Math.round(((activity.regular_price - activity.discount_price) / activity.regular_price) * 100)
              : 0
            const spotsLeft = activity.available_spots
            const isLowSpots = spotsLeft <= 3 && spotsLeft > 0

            return (
              <Link key={activity.id} href={`/activities/${activity.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full group overflow-hidden border-2 hover:border-primary/50">
                  {/* Image with Badge */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {activity.image_urls && activity.image_urls[0] ? (
                      <Image
                        src={activity.image_urls[0]}
                        alt={activity.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {discountPercent > 0 && (
                        <Badge className="bg-red-500 text-white font-bold">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {discountPercent}% OFF
                        </Badge>
                      )}
                      {isLowSpots && (
                        <Badge variant="destructive" className="font-bold">
                          <Users className="h-3 w-3 mr-1" />
                          Only {spotsLeft} left!
                        </Badge>
                      )}
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="font-medium">
                        {CATEGORIES.find(c => c.value === activity.category)?.icon || '🌟'} {activity.category}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {activity.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {activity.location || `${activity.providers?.name || ''} • ${activity.providers?.city || ''}`.trim()}
                      </span>
                      {activity.distance && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          <Map className="h-3 w-3 inline mr-1" />
                          {activity.distance} km
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(activity.activity_start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className={isLowSpots ? 'text-red-600 font-semibold' : ''}>
                            {activity.available_spots} / {activity.total_spots} spots
                          </span>
                        </div>
                      </div>
                      {activity.providers?.rating_average && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{activity.providers.rating_average.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">rating</span>
                        </div>
                      )}
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {activity.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {activity.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{activity.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(activity.discount_price)}
                        </div>
                        {activity.regular_price > activity.discount_price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(activity.regular_price)}
                          </div>
                        )}
                      </div>
                      <Button className="group-hover:scale-105 transition-transform">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
