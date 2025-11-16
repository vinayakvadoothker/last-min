'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Plus, Mail, Phone, Globe, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { PartnerForm } from './partner-form'

export function PartnersList() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      // First try to get all providers (super admin should be able to see all)
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading partners:', error)
        // If RLS error or permission error, it's okay - just show empty state
        // This can happen if there are no partners or RLS policies restrict access
        setPartners([])
        return
      }

      // If we have providers, try to get user info for each
      const partnersWithUsers = await Promise.all(
        (data || []).map(async (partner) => {
          if (partner.user_id) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, email, full_name')
                .eq('id', partner.user_id)
                .single()
              
              return { ...partner, profiles: profile }
            } catch {
              return partner
            }
          }
          return partner
        })
      )

      setPartners(partnersWithUsers)
    } catch (error) {
      console.error('Error loading partners:', error)
      // Don't show error toast - just set empty array
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (partnerId: string) => {
    if (!confirm('Are you sure you want to delete this partner? This will also delete all their activities.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', partnerId)

      if (error) throw error

      toast.success('Partner deleted successfully')
      loadPartners()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete partner')
    }
  }

  const handleEdit = (partner: any) => {
    setEditingPartner(partner)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPartner(null)
    loadPartners()
  }

  if (loading) {
    return <div className="text-center py-12">Loading partners...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Partners</h2>
          <p className="text-gray-600">Manage your platform partners</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {showForm && (
        <PartnerForm
          partner={editingPartner}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {partners.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Partners Yet</h3>
              <p className="text-gray-500 mb-4">
                Add your first partner to start managing activities on the platform.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Partner
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {partner.category}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {partner.profiles && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{partner.profiles.email}</span>
                    </div>
                  )}
                  {partner.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="h-4 w-4" />
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {partner.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{partner.city}, {partner.state || partner.country}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

