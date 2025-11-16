import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { CreateActivityForm } from '@/components/create-activity-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewActivityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is provider or super admin
  const isSuperAdmin = user.email === 'vinvadoothker@gmail.com'
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isProvider = profile?.role === 'provider'

  if (!isProvider && !isSuperAdmin) {
    redirect('/partner')
  }

  // Get provider info (or create one for super admin if needed)
  let provider = null
  if (isProvider) {
    const { data: providerData } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', user.id)
      .single()
    provider = providerData
  } else if (isSuperAdmin) {
    // For super admin, check if they have a provider record, create one if not
    const { data: providerData } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (providerData) {
      provider = providerData
    } else {
      // Create a provider record for super admin
      const { data: newProvider, error } = await supabase
        .from('providers')
        .insert({
          user_id: user.id,
          name: 'Super Admin',
          category: 'other',
          address: 'TBD',
          city: 'TBD',
          country: 'United States',
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating provider for super admin:', error)
        // Don't redirect - let them see the error or continue without provider
        // For super admin, we can still allow activity creation
      } else {
        provider = newProvider
      }
    }
  }

  // If not super admin and no provider, redirect
  if (!isSuperAdmin && !provider) {
    redirect('/partner')
  }

  // For super admin, create a minimal provider if needed
  if (isSuperAdmin && !provider) {
    // Create a temporary provider record
    const { data: tempProvider, error: tempError } = await supabase
      .from('providers')
      .insert({
        user_id: user.id,
        name: 'Super Admin',
        category: 'other',
        address: 'TBD',
        city: 'TBD',
        country: 'United States',
      })
      .select()
      .single()
    
    if (!tempError && tempProvider) {
      provider = tempProvider
    }
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Database Setup Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                The <code className="bg-gray-100 px-2 py-1 rounded">providers</code> table doesn't exist in your database yet.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to your Supabase dashboard</li>
                  <li>Open the SQL Editor</li>
                  <li>Run the schema file: <code className="bg-white px-2 py-1 rounded">supabase/schema.sql</code></li>
                  <li>This will create all necessary tables including <code className="bg-white px-2 py-1 rounded">providers</code></li>
                </ol>
              </div>
              <div className="pt-4">
                <Link href="/provider/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create New Activity</h1>
          <p className="text-gray-600">
            {isSuperAdmin ? 'Create a new activity listing' : 'Add a new activity listing to your provider profile'}
          </p>
        </div>
        <CreateActivityForm providerId={provider.id} />
      </div>
    </div>
  )
}

