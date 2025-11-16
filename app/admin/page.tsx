import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { PartnersList } from '@/components/partners-list'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ONLY allow access if email is vinvadoothker@gmail.com (super admin)
  const isSuperAdmin = user.email === 'vinvadoothker@gmail.com'

  if (!isSuperAdmin) {
    redirect('/activities')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Partner Management</h1>
          <p className="text-gray-600">Manage your platform partners</p>
        </div>
        <PartnersList />
      </div>
    </div>
  )
}

