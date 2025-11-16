'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { X, Upload, Building2 } from 'lucide-react'

export function PartnerForm({
  partner,
  onClose,
  onSuccess,
}: {
  partner?: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    name: partner?.name || '',
    description: partner?.description || '',
    category: partner?.category || '',
    address: partner?.address || '',
    city: partner?.city || '',
    state: partner?.state || '',
    country: partner?.country || 'United States',
    postal_code: partner?.postal_code || '',
    phone: partner?.phone || '',
    email: partner?.email || '',
    website: partner?.website || '',
    logo_url: partner?.logo_url || '',
    user_email: '', // Email of user to link to
  })
  const supabase = createClient()

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `partner-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      setFormData({ ...formData, logo_url: publicUrl })
      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let userId = partner?.user_id

      // If creating new partner, user_email is required
      if (!partner) {
        if (!formData.user_email) {
          toast.error('User email is required')
          setLoading(false)
          return
        }

        // Find user by email in profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', formData.user_email)
          .single()
        
        if (profile) {
          userId = profile.id

          // Ensure user has provider role
          await supabase
            .from('profiles')
            .update({ role: 'provider' })
            .eq('id', userId)
        } else {
          toast.error('User with this email does not exist. Please create the user account first.')
          setLoading(false)
          return
        }
      }

      const providerData: any = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        address: formData.address,
        city: formData.city,
        state: formData.state || null,
        country: formData.country,
        postal_code: formData.postal_code || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        logo_url: formData.logo_url || null,
        updated_at: new Date().toISOString(),
      }

      if (userId) {
        providerData.user_id = userId
      }

      if (partner) {
        // Update existing partner
        const { error } = await supabase
          .from('providers')
          .update(providerData)
          .eq('id', partner.id)

        if (error) throw error
        toast.success('Partner updated successfully!')
      } else {
        // Create new partner
        const { error } = await supabase
          .from('providers')
          .insert(providerData)

        if (error) throw error
        toast.success('Partner created successfully!')
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save partner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{partner ? 'Edit Partner' : 'Add New Partner'}</CardTitle>
            <CardDescription>
              {partner ? 'Update partner information' : 'Create a new partner account'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Logo</label>
            <div className="flex items-center gap-4">
              {formData.logo_url ? (
                <div className="relative">
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="w-20 h-20 rounded-lg object-cover border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={() => setFormData({ ...formData, logo_url: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 border-2 border-dashed flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingLogo}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Acme Fitness Studio"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the company..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={loading}
            />
          </div>

          {/* Category */}
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
              <option value="other">Other</option>
            </select>
          </div>

          {/* User Email (for linking to existing user) */}
          {!partner && (
            <div className="space-y-2">
              <label className="text-sm font-medium">User Email *</label>
              <Input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                placeholder="user@example.com"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Enter the email of the user account to link this partner. The user will be granted provider access.
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://company.com"
              disabled={loading}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Address *</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St"
              required
              disabled={loading}
            />
          </div>

          {/* City, State, Country */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City *</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="NY"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country *</label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="United States"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Postal Code</label>
            <Input
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="10001"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : partner ? 'Update Partner' : 'Create Partner'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

