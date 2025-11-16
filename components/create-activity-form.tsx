'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LocationPicker } from '@/components/ui/location-picker'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, CheckCircle2, Upload, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const SESSION_STORAGE_KEY = 'create-activity-form-data'

export function CreateActivityForm({ providerId }: { providerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    regularPrice: '',
    discountPrice: '',
    activityStartTime: '',
    activityEndTime: '',
    bookingDeadline: '',
    totalSpots: '',
    minParticipants: '1',
    tags: '',
    location: '',
    isSurprise: false,
  })

  // Calculate duration from start and end time
  const calculateDuration = () => {
    if (formData.activityStartTime && formData.activityEndTime) {
      const startTime = new Date(formData.activityStartTime)
      const endTime = new Date(formData.activityEndTime)
      const durationMs = endTime.getTime() - startTime.getTime()
      const durationMinutes = Math.round(durationMs / (1000 * 60))
      return durationMinutes > 0 ? durationMinutes : null
    }
    return null
  }

  const calculatedDuration = calculateDuration()
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null)
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const uploadPromises: Promise<string>[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`)
        continue
      }

      // Upload each file
      const uploadPromise = (async () => {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `activity-images/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('public')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) {
            // Provide helpful error message for missing bucket
            if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
              throw new Error('Storage bucket not found. Please create a "public" bucket in Supabase Storage. See supabase/setup-storage.md for instructions.')
            }
            throw uploadError
          }

          const { data: { publicUrl } } = supabase.storage
            .from('public')
            .getPublicUrl(filePath)

          return publicUrl
        } catch (error: any) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`)
          throw error
        }
      })()

      uploadPromises.push(uploadPromise)
    }

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      setImageUrls((prev) => [...prev, ...uploadedUrls])
      toast.success(`Uploaded ${uploadedUrls.length} image(s) successfully`)
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setUploadingImages(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Load from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (saved) {
        try {
          const savedData = JSON.parse(saved)
          // Only load if there's actual data
          if (savedData && Object.keys(savedData).length > 0) {
            setFormData(savedData)
            // Load saved image URLs if they exist
            if (savedData.imageUrls && Array.isArray(savedData.imageUrls)) {
              setImageUrls(savedData.imageUrls)
            }
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus(null), 3000) // Hide after 3 seconds
          }
        } catch (error) {
          console.error('Error loading saved form data:', error)
        }
      }
    }
  }, [])

  // Auto-save to session storage whenever form data or images change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Debounce the save
      const timeoutId = setTimeout(() => {
        setSaveStatus('saving')
        const dataToSave = { ...formData, imageUrls }
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dataToSave))
        setTimeout(() => {
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus(null), 2000) // Hide status after 2 seconds
        }, 300)
      }, 500) // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId)
    }
  }, [formData, imageUrls])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const regularPrice = parseFloat(formData.regularPrice)
      const discountPrice = parseFloat(formData.discountPrice)
      
      // Validate prices are positive
      if (regularPrice <= 0 || discountPrice <= 0) {
        toast.error('Prices must be greater than 0')
        setLoading(false)
        return
      }
      
      if (discountPrice >= regularPrice) {
        toast.error('Discount price must be less than regular price')
        setLoading(false)
        return
      }

      // Validate start time is not in the past
      if (formData.activityStartTime) {
        const startDate = new Date(formData.activityStartTime)
        const now = new Date()
        if (startDate < now) {
          toast.error('Start time cannot be in the past')
          setLoading(false)
          return
        }
      }

      // Validate end time is not before start time
      if (formData.activityEndTime && formData.activityStartTime) {
        const endDate = new Date(formData.activityEndTime)
        const startDate = new Date(formData.activityStartTime)
        if (endDate < startDate) {
          toast.error('End time cannot be before start time')
          setLoading(false)
          return
        }
      }

      // Validate booking deadline is after now and before activity start time
      if (formData.bookingDeadline) {
        const deadlineDate = new Date(formData.bookingDeadline)
        const now = new Date()
        
        if (deadlineDate <= now) {
          toast.error('Booking deadline must be after the current time')
          setLoading(false)
          return
        }
        
        if (formData.activityStartTime) {
          const startDate = new Date(formData.activityStartTime)
          if (deadlineDate >= startDate) {
            toast.error('Booking deadline must be before activity start time')
            setLoading(false)
            return
          }
        }
      }
      
      const discountPercentage = Math.round(((regularPrice - discountPrice) / regularPrice) * 100)

      const { error } = await supabase
        .from('activities')
        .insert({
          provider_id: providerId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory || null,
          regular_price: regularPrice,
          discount_price: discountPrice,
          original_price: regularPrice,
          discount_percentage: discountPercentage,
          activity_start_time: formData.activityStartTime,
          activity_end_time: formData.activityEndTime || null,
          booking_deadline: formData.bookingDeadline,
          total_spots: parseInt(formData.totalSpots),
          available_spots: parseInt(formData.totalSpots),
          min_participants: parseInt(formData.minParticipants) || 1,
          duration_minutes: calculatedDuration,
          tags: formData.tags 
            ? formData.tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0) // Remove empty tags
            : [],
          location: formData.location || null,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          is_surprise: formData.isSurprise,
          status: 'active',
        })

      if (error) throw error

      // Clear session storage and image URLs on successful submit
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_STORAGE_KEY)
      }
      setImageUrls([])

      toast.success('Activity created successfully!')
      router.push('/provider/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create activity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href="/provider/dashboard">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        {saveStatus && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {saveStatus === 'saving' ? (
              <>
                <Save className="h-4 w-4 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Auto-saved</span>
              </>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
          <CardDescription>Fill in the information for your activity listing</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Evening Yoga Class"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your activity..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Images</label>
              <div className="space-y-4">
                {/* Image Upload Input */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      {uploadingImages ? 'Uploading...' : 'Upload Images'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={loading || uploadingImages}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    You can upload multiple images. Max 5MB per image.
                  </p>
                </div>

                {/* Image Previews */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
                          <Image
                            src={url}
                            alt={`Activity image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {imageUrls.length === 0 && (
                  <div className="flex items-center justify-center p-8 border border-dashed rounded-md bg-gray-50">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No images uploaded yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  disabled={loading}
                >
                  <option value="">Select category...</option>
                  <option value="fitness">Fitness</option>
                  <option value="wellness">Wellness</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="education">Education</option>
                  <option value="arts">Arts</option>
                  <option value="sports">Sports</option>
                  <option value="food-drink">Food & Drink</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subcategory</label>
                <Input
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="e.g., yoga, pilates"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Regular Price ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.regularPrice}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow numbers, decimal point, or empty string
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      const numValue = parseFloat(value)
                      // Only allow if it's a valid positive number or empty
                      if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
                        setFormData({ ...formData, regularPrice: value })
                      }
                    }
                  }}
                  placeholder="30.00"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Price ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discountPrice}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow numbers, decimal point, or empty string
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      const numValue = parseFloat(value)
                      // Only allow if it's a valid positive number or empty
                      if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
                        setFormData({ ...formData, discountPrice: value })
                      }
                    }
                  }}
                  placeholder="12.00"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <LocationPicker
                value={formData.location}
                onChange={(location) => setFormData({ ...formData, location })}
                placeholder="Enter activity location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity Start Time *</label>
                <DateTimePicker
                  value={formData.activityStartTime}
                  onChange={(value) => {
                    // Validate it's not in the past
                    if (value) {
                      const selectedDate = new Date(value)
                      const now = new Date()
                      if (selectedDate < now) {
                        toast.error('Start time cannot be in the past')
                        return
                      }
                    }
                    // Clear booking deadline if it's now after or equal to start time
                    if (formData.bookingDeadline && value) {
                      const deadlineDate = new Date(formData.bookingDeadline)
                      const startDate = new Date(value)
                      if (deadlineDate >= startDate) {
                        setFormData({ ...formData, activityStartTime: value, bookingDeadline: '' })
                        toast.error('Booking deadline was cleared because it must be before start time')
                        return
                      }
                    }
                    setFormData({ ...formData, activityStartTime: value })
                    // Clear end time if it's now before start time
                    if (formData.activityEndTime && value) {
                      const endDate = new Date(formData.activityEndTime)
                      const startDate = new Date(value)
                      if (endDate < startDate) {
                        setFormData({ ...formData, activityStartTime: value, activityEndTime: '' })
                        toast.error('End time was cleared because it was before the new start time')
                      }
                    }
                  }}
                  min={new Date().toISOString()}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity End Time</label>
                <DateTimePicker
                  value={formData.activityEndTime}
                  onChange={(value) => {
                    // Validate it's not before start time
                    if (value && formData.activityStartTime) {
                      const endDate = new Date(value)
                      const startDate = new Date(formData.activityStartTime)
                      if (endDate < startDate) {
                        toast.error('End time cannot be before start time')
                        return
                      }
                    }
                    setFormData({ ...formData, activityEndTime: value })
                  }}
                  min={formData.activityStartTime || new Date().toISOString()}
                  disabled={loading || !formData.activityStartTime}
                />
                {!formData.activityStartTime && (
                  <p className="text-xs text-gray-500">Set start time first</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Booking Deadline *</label>
              <DateTimePicker
                value={formData.bookingDeadline}
                onChange={(value) => {
                  if (value) {
                    const deadlineDate = new Date(value)
                    const now = new Date()
                    
                    // Validate it's after right now
                    if (deadlineDate <= now) {
                      toast.error('Booking deadline must be after the current time')
                      return
                    }
                    
                    // Validate it's before start time
                    if (formData.activityStartTime) {
                      const startDate = new Date(formData.activityStartTime)
                      if (deadlineDate >= startDate) {
                        toast.error('Booking deadline must be before activity start time')
                        return
                      }
                    }
                  }
                  setFormData({ ...formData, bookingDeadline: value })
                }}
                min={new Date().toISOString()}
                max={formData.activityStartTime || undefined}
                disabled={loading || !formData.activityStartTime}
                required
              />
              {!formData.activityStartTime && (
                <p className="text-xs text-gray-500">Set activity start time first</p>
              )}
              {formData.activityStartTime && (
                <p className="text-xs text-gray-500">Last time users can book this activity (must be after now and before start time)</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Spots *</label>
                <Input
                  type="number"
                  value={formData.totalSpots}
                  onChange={(e) => setFormData({ ...formData, totalSpots: e.target.value })}
                  placeholder="20"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={calculatedDuration || ''}
                  placeholder={calculatedDuration ? calculatedDuration.toString() : 'Auto-calculated from end time'}
                  disabled
                  className="bg-gray-50"
                />
                {!calculatedDuration && formData.activityStartTime && (
                  <p className="text-xs text-gray-500">Add an end time to calculate duration</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => {
                  let value = e.target.value
                  // Remove any existing commas at the end and normalize
                  value = value.replace(/,\s*,/g, ',') // Remove duplicate commas
                  setFormData({ ...formData, tags: value })
                }}
                onKeyDown={(e) => {
                  // On Enter, add comma if there's text
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const currentValue = formData.tags.trim()
                    if (currentValue && !currentValue.endsWith(',')) {
                      setFormData({ ...formData, tags: currentValue + ', ' })
                    } else if (currentValue) {
                      setFormData({ ...formData, tags: currentValue + ' ' })
                    }
                  }
                }}
                placeholder="beginner-friendly, mat-based, relaxing (press Enter to add comma)"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Separate tags with commas. Press Enter to add a comma automatically.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isSurprise"
                checked={formData.isSurprise}
                onChange={(e) => setFormData({ ...formData, isSurprise: e.target.checked })}
                className="h-4 w-4"
                disabled={loading}
              />
              <label htmlFor="isSurprise" className="text-sm font-medium">
                Mark as Surprise Activity (mystery activity)
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating...' : 'Create Activity'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

