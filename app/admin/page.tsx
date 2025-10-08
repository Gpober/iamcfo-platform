'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  const [activeTab, setActiveTab] = useState<'orgs' | 'users'>('orgs')
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
      } else {
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

    // Add your admin email here
    const adminEmails = ['gpober@iamcfo.com']
    
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

    // Get member count for each org
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage all organizations and users</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('orgs')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orgs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Organizations ({organizations.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users ({users.length})
            </button>
          </div>
        </div>

        {/* Organizations Table */}
        {activeTab === 'orgs' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                          <a
                            href={`https://${org.subdomain}.iamcfo.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {org.subdomain}.iamcfo.com
                          </a>
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
        ) : (
          // Users Table
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <select
                value={selectedOrg || ''}
                onChange={(e) => setSelectedOrg(e.target.value || null)}
                className="border border-gray-300 rounded-lg px-4 py-2"
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
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
