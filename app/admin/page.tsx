'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import MarketingTab from './MarketingTab'

interface Organization {
  id: string
  name: string
  slug: string
  subdomain: string | null
  plan: string
  status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  qbo_connected: boolean
  invite_code: string | null
  created_at: string
  member_count?: number
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
  organization_id: string
  organization_name?: string
  face_verified: boolean
  created_at: string
}

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orgs' | 'users' | 'marketing'>('orgs')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'orgs') {
        fetchOrganizations()
      } else if (activeTab === 'users') {
        fetchUsers()
      }
    }
  }, [isAdmin, activeTab, selectedOrg])

  async function checkAdminAccess() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const adminEmails = [
      'gpober@iamcfo.com',
    ]
    
    const { data: user } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', session.user.id)
      .single()

    if (user?.role === 'super_admin' || adminEmails.includes(session.user.email || '')) {
      setIsAdmin(true)
    } else {
      alert('Access denied. Admin only.')
      router.push('/')
    }
    
    setLoading(false)
  }

  async function fetchOrganizations() {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organizations:', error)
      return
    }

    const orgsWithCounts = await Promise.all(
      (orgs || []).map(async (org) => {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)
        
        return { ...org, member_count: count || 0 }
      })
    )

    setOrganizations(orgsWithCounts)
  }

  async function fetchUsers() {
    let query = supabase
      .from('users')
      .select(`
        *,
        organizations!inner(name)
      `)
      .order('created_at', { ascending: false })

    if (selectedOrg) {
      query = query.eq('organization_id', selectedOrg)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    const formattedUsers = (data || []).map((user: any) => ({
      ...user,
      organization_name: user.organizations?.name || 'N/A'
    }))

    setUsers(formattedUsers)
  }

  async function updateOrgStatus(orgId: string, newStatus: string) {
    const { error } = await supabase
      .from('organizations')
      .update({ status: newStatus })
      .eq('id', orgId)

    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      alert('Status updated successfully')
      fetchOrganizations()
    }
  }

  async function accessOrgDashboard(org: Organization) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token || !session?.refresh_token) {
      alert('No session found. Please log in again.')
      return
    }

    const params = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at?.toString() || '',
      token_type: 'bearer',
      super_admin: 'true',
    })

    window.location.href = `https://${org.subdomain}.iamcfo.com/dashboard#${params.toString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading admin panel...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage organizations, users, and marketing</p>
        </div>

        {/* Tabs - Mobile Responsive */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <div className="flex space-x-4 sm:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('orgs')}
              className={`pb-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'orgs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Organizations ({organizations.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('marketing')}
              className={`pb-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'marketing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🚀 Marketing
            </button>
          </div>
        </div>

        {/* Marketing Tab */}
        {activeTab === 'marketing' && <MarketingTab />}

        {/* Organizations - Mobile Cards / Desktop Table */}
        {activeTab === 'orgs' && (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {organizations.map((org) => (
                <div key={org.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">{org.slug}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Plan:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {org.plan}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Members:</span>
                      <span className="ml-2 font-medium">{org.member_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">QBO:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        org.qbo_connected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {org.qbo_connected ? 'Connected' : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Code:</span>
                      <span className="ml-2 font-mono text-xs">{org.invite_code || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select
                      value={org.status}
                      onChange={(e) => updateOrgStatus(org.id, e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedOrg(org.id)
                        setActiveTab('users')
                      }}
                      className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      View Users
                    </button>
                    {org.subdomain && (
                      <button
                        onClick={() => accessOrgDashboard(org)}
                        className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        🔓 Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      QBO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Invite Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          <div className="text-sm text-gray-500">{org.slug}</div>
                          {org.subdomain && (
                            <button
                              onClick={() => accessOrgDashboard(org)}
                              className="text-xs text-blue-600 hover:underline cursor-pointer"
                            >
                              🔓 Access {org.subdomain}.iamcfo.com
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={org.status}
                          onChange={(e) => updateOrgStatus(org.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {org.member_count}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          org.qbo_connected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {org.qbo_connected ? 'Connected' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {org.invite_code || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            setSelectedOrg(org.id)
                            setActiveTab('users')
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Users
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Users - Mobile Cards / Desktop Table */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedOrg || ''}
                onChange={(e) => setSelectedOrg(e.target.value || null)}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                <option value="">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {selectedOrg && (
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {user.name || 'No name'}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Organization:</span>
                      <p className="font-medium text-gray-900 mt-1">{user.organization_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Role:</span>
                      <span className="block mt-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs w-fit">
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Face Verified:</span>
                      <span className={`block mt-1 px-2 py-1 rounded-full text-xs w-fit ${
                        user.face_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.face_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="text-gray-900 mt-1">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Face Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.organization_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.face_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.face_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
