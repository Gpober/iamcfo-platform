'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronRight, Users, Building2, Megaphone, ExternalLink } from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  subdomain: string | null
  plan: string
  status: string
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
  created_at: string
}

export default function MobileAdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orgs' | 'users'>('orgs')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null)
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
      router.push('/mobile-dashboard')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-8">
        <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
        <p className="text-blue-100 text-sm">Super Admin Controls</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm -mt-4 rounded-t-3xl">
        <div className="flex">
          <button
            onClick={() => setActiveTab('orgs')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'orgs'
                ? 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <Building2 className="w-5 h-5 mx-auto mb-1" />
            Organizations
            {activeTab === 'orgs' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'users'
                ? 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-1" />
            Users
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Organizations View */}
        {activeTab === 'orgs' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 mb-2 px-1">
              {organizations.length} Organizations
            </div>
            {organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Org Header */}
                <button
                  onClick={() => setExpandedOrg(expandedOrg === org.id ? null : org.id)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900 mb-1">{org.name}</h3>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        org.status === 'active' ? 'bg-green-100 text-green-700' :
                        org.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {org.status}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{org.member_count} members</span>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedOrg === org.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedOrg === org.id && (
                  <div className="px-4 pb-4 space-y-3 border-t">
                    <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Plan</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                          {org.plan}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">QuickBooks</p>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          org.qbo_connected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {org.qbo_connected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 text-xs mb-1">Invite Code</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {org.invite_code || 'N/A'}
                        </code>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 text-xs mb-1">Subdomain</p>
                        <p className="text-xs font-mono text-gray-700">
                          {org.subdomain ? `${org.subdomain}.iamcfo.com` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedOrg(org.id)
                          setActiveTab('users')
                        }}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                      >
                        View Users
                      </button>
                      {org.subdomain && (
                        <button
                          onClick={() => accessOrgDashboard(org)}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Access Dashboard</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Users View */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {/* Filter */}
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <label className="text-xs text-gray-500 mb-2 block">Filter by Organization</label>
              <select
                value={selectedOrg || ''}
                onChange={(e) => setSelectedOrg(e.target.value || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                  className="text-xs text-blue-600 mt-2"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* User Cards */}
            <div className="text-xs text-gray-500 mb-2 px-1">
              {users.length} Users {selectedOrg && '(filtered)'}
            </div>
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {user.name || 'No name'}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                    {user.role}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500 mb-1">Organization</p>
                    <p className="text-gray-900 font-medium">{user.organization_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Joined</p>
                    <p className="text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
