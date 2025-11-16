'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { Building2, MapPin, Phone, Globe, CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export function ProviderRequestsList() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch('/api/provider-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast.success('Provider request approved!')
      loadRequests()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request')
    }
  }

  const handleReject = async (requestId: string, reason: string) => {
    try {
      const response = await fetch('/api/provider-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          request_id: requestId,
          rejection_reason: reason 
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast.success('Provider request rejected')
      loadRequests()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading requests...</div>
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Provider Requests Yet</h3>
            <p className="text-gray-500 mb-4">
              When users request to become providers, their applications will appear here for review.
            </p>
            <p className="text-sm text-gray-400">
              You can approve or reject requests, and approved users will gain access to the provider platform.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const otherRequests = requests.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <ProviderRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id)}
                onReject={(reason) => handleReject(request.id, reason)}
              />
            ))}
          </div>
        </div>
      )}

      {otherRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Reviewed Requests</h2>
          <div className="space-y-4">
            {otherRequests.map((request) => (
              <ProviderRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id)}
                onReject={(reason) => handleReject(request.id, reason)}
                readOnly
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProviderRequestCard({
  request,
  onApprove,
  onReject,
  readOnly = false,
}: {
  request: any
  onApprove: () => void
  onReject: (reason: string) => void
  readOnly?: boolean
}) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {request.organization_name}
            </CardTitle>
            <CardDescription className="mt-1">
              {request.full_name} • {request.email}
            </CardDescription>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[request.status as keyof typeof statusColors]}`}>
            {request.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <div className="font-medium">{request.organization_type || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">
                  {request.city}, {request.state || ''} {request.country}
                </div>
              </div>
            </div>
            {request.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{request.phone}</div>
                </div>
              </div>
            )}
            {request.website && (
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Website</div>
                  <div className="font-medium">
                    <a href={request.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {request.website}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Business Address</div>
            <div className="font-medium">{request.business_address}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Why they should be onboarded:</div>
            <div className="bg-gray-50 p-3 rounded-md">{request.reason}</div>
          </div>

          {request.rejection_reason && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Rejection Reason:</div>
              <div className="bg-red-50 p-3 rounded-md text-red-800">{request.rejection_reason}</div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Submitted: {formatDateTime(request.created_at)}
            {request.reviewed_at && ` • Reviewed: ${formatDateTime(request.reviewed_at)}`}
          </div>

          {!readOnly && request.status === 'pending' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={onApprove}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              {!showRejectForm ? (
                <Button
                  onClick={() => setShowRejectForm(true)}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              ) : (
                <div className="flex-1 space-y-2">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full p-2 border rounded-md text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (rejectionReason.trim()) {
                          onReject(rejectionReason)
                          setShowRejectForm(false)
                          setRejectionReason('')
                        }
                      }}
                      variant="destructive"
                      size="sm"
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRejectForm(false)
                        setRejectionReason('')
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

