import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { ProviderDashboard } from '@/components/provider-dashboard'

export default async function ProviderDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is provider or super admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = user.email === 'vinvadoothker@gmail.com'
  const isProvider = profile?.role === 'provider'

  // Allow access if user is provider OR super admin
  if (!isProvider && !isSuperAdmin) {
    redirect('/partner')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <ProviderDashboard />
      </div>
    </div>
  )
}

