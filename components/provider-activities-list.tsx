'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { Plus, Edit, Trash2, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export function ProviderActivitiesList() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get provider ID
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!provider) return

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

      if (error) throw error

      toast.success('Activity deleted')
      loadActivities()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete activity')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading activities...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Link href="/provider/activities/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Activity
          </Button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven't created any activities yet.</p>
            <Link href="/provider/activities/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Activity
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{activity.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    activity.status === 'active' ? 'bg-green-100 text-green-800' :
                    activity.status === 'sold_out' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {formatDateTime(activity.activity_start_time)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {activity.available_spots} / {activity.total_spots} spots
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(activity.discount_price)}
                    {activity.regular_price > activity.discount_price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(activity.regular_price)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/activities/${activity.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

