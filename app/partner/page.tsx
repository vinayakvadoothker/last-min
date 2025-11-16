'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Nav } from '@/components/nav'
import toast from 'react-hot-toast'
import { Building2, MapPin, Phone, Globe, FileText } from 'lucide-react'

export default function BecomeProviderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    businessAddress: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    website: '',
    reason: '',
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in to request provider access')
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from('provider_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single()

      if (existingRequest) {
        toast.error('You already have a pending provider request')
        return
      }

      // Check if user is already a provider
      if (profile?.role === 'provider' || profile?.role === 'admin') {
        toast.error('You are already a provider or admin')
        router.push('/provider/dashboard')
        return
      }

      // Create provider request
      const { error: requestError } = await supabase
        .from('provider_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: profile?.full_name || '',
          organization_name: formData.organizationName,
          organization_type: formData.organizationType,
          business_address: formData.businessAddress,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          phone: formData.phone,
          website: formData.website,
          reason: formData.reason,
        })

      if (requestError) throw requestError

      // Send email to admin using Resend
      const emailResponse = await fetch('/api/provider-requests/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestData: {
            email: user.email,
            fullName: profile?.full_name || '',
            organizationName: formData.organizationName,
            organizationType: formData.organizationType,
            businessAddress: formData.businessAddress,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            phone: formData.phone,
            website: formData.website,
            reason: formData.reason,
          },
        }),
      })

      if (!emailResponse.ok) {
        console.error('Failed to send email, but request was created')
      }

      toast.success('Provider request submitted! We\'ll review it and get back to you soon.')
      router.push('/profile')
    } catch (error: any) {
      console.error('Error submitting request:', error)
      toast.error(error.message || 'Failed to submit provider request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Partner With Us</h1>
          <p className="text-sm md:text-base text-gray-600">
            Join our platform and start offering your activities to thousands of users
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provider Application</CardTitle>
            <CardDescription>
              Fill out the form below to request provider access. Our team will review your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization/Business Name *
                </label>
                <Input
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="e.g., Zen Yoga Studio"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Type *</label>
                <select
                  value={formData.organizationType}
                  onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  disabled={loading}
                >
                  <option value="">Select type...</option>
                  <option value="gym">Gym / Fitness Center</option>
                  <option value="studio">Studio (Yoga, Pilates, etc.)</option>
                  <option value="venue">Venue / Event Space</option>
                  <option value="workshop">Workshop / Class Provider</option>
                  <option value="outdoor">Outdoor Activity Provider</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address *
                </label>
                <Input
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  placeholder="123 Main St"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Why should you be onboarded? *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Tell us about your organization, what activities you offer, and why you'd be a great addition to our platform..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

