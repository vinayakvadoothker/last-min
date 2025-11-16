'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export function ProviderDashboard() {
  const [stats, setStats] = useState({
    totalActivities: 0,
    activeActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasProvider, setHasProvider] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    const superAdmin = user.email === 'vinvadoothker@gmail.com'
    setIsAdmin(superAdmin)

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    setHasProvider(!!provider)
  }

  const loadStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single()

      const isSuperAdmin = user.email === 'vinvadoothker@gmail.com'

      // Get provider ID
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // If super admin without provider record, show platform stats instead
      if (isSuperAdmin && !provider) {
        // Get all activities count (admin can see all)
        const { count: totalCount } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true })

        const { count: activeCount } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        // Get all bookings count and revenue
        const { data: bookings } = await supabase
          .from('bookings')
          .select('total_price, payment_status')
          .eq('payment_status', 'paid')

        const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.total_price), 0) || 0

        setStats({
          totalActivities: totalCount || 0,
          activeActivities: activeCount || 0,
          totalBookings: bookings?.length || 0,
          totalRevenue,
        })
        setLoading(false)
        return
      }

      if (!provider) {
        setLoading(false)
        return
      }

      // Get activities count
      const { count: totalCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', provider.id)

      const { count: activeCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', provider.id)
        .eq('status', 'active')

      // Get bookings count and revenue
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price, payment_status')
        .eq('provider_id', provider.id)
        .eq('payment_status', 'paid')

      const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.total_price), 0) || 0

      setStats({
        totalActivities: totalCount || 0,
        activeActivities: activeCount || 0,
        totalBookings: bookings?.length || 0,
        totalRevenue,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{isAdmin ? 'Admin Dashboard' : 'Provider Dashboard'}</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage the platform and view all activities' : 'Manage your activities and bookings'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Users className="h-5 w-5 mr-2" />
                Manage Partners
              </Button>
            </Link>
          )}
          {(hasProvider || isAdmin) && (
            <Link href="/provider/activities/new">
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                Create Activity
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeActivities} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From paid bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeActivities}</div>
            <p className="text-xs text-muted-foreground">Available activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Partners
                </Button>
              </Link>
            )}
            {(hasProvider || isAdmin) && (
              <>
                <Link href="/provider/activities/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Activity
                  </Button>
                </Link>
                <Link href="/provider/activities">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Activities
                  </Button>
                </Link>
                <Link href="/provider/bookings">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View Bookings
                  </Button>
                </Link>
              </>
            )}
            {isAdmin && !hasProvider && (
              <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-md">
                <p className="font-medium mb-2">You're the super admin!</p>
                <p>You can manage partners and create activities directly. A provider profile will be created automatically when you create your first activity.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? 'Admin Info' : 'Provider Info'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {isAdmin 
                ? 'As an admin, you have full access to manage the platform, approve provider requests, and view all activities and bookings.'
                : 'Manage your provider profile, view analytics, and track your performance.'}
            </p>
            {hasProvider && (
              <Link href="/provider/settings" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Provider Settings
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

