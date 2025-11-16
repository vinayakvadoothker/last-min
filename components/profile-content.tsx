'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import toast from 'react-hot-toast'

export function ProfileContent({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile(data)
        setFullName(data.full_name || user.user_metadata?.full_name || '')
        setPhone(data.phone || user.user_metadata?.phone || '')
      } else {
        // If no profile exists, use user metadata
        setFullName(user.user_metadata?.full_name || '')
        setPhone(user.user_metadata?.phone || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          phone,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success('Profile updated!')
      loadProfile()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Email</label>
          <Input value={user.email || ''} disabled className="w-full" />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Phone</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Role</label>
          <Input value={profile?.role || 'consumer'} disabled className="w-full" />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        {profile?.role !== 'provider' && profile?.role !== 'admin' && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-2">Partner With Us</h3>
            <p className="text-sm text-gray-600 mb-4">
              Want to list your activities on our platform? Request provider access to start offering your services.
            </p>
            <Link href="/partner">
              <Button className="w-full">
                Request Provider Access
              </Button>
            </Link>
          </div>
        )}

        {(profile?.role === 'provider' || profile?.role === 'admin') && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-2">Provider Dashboard</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage your activities, bookings, and provider settings.
            </p>
            <Link href="/provider/dashboard">
              <Button variant="outline" className="w-full">
                Go to Provider Dashboard
              </Button>
            </Link>
          </div>
        )}

        {profile?.role === 'admin' && (
          <div className="mt-4">
            <Link href="/admin/provider-requests">
              <Button variant="outline" className="w-full">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

