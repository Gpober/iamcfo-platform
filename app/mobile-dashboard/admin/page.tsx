'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronRight, Users, Building2, Megaphone, ExternalLink } from 'lucide-react'
import MobileMarketingTab from './MobileMarketingTab'

interface Organization {
  id: string
  name: string
  slug: string
  subdomain: string | null
  status: string
  plan_tier: string
  member_count: number
  qbo_company_id: string | null
  invite_code: string | null
}

interface User {
  id: string
  email: string
  role: string
  organization_id: string
  organization_name: string
  full_name: string | null
}

type TabType = 'orgs' | 'users' | 'marketing'

const ADMIN_ROLES = ['super_admin', 'admin']

export default function MobileAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('orgs')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchOrganizations()
      fetchUsers()
    }
  }, [isAdmin])

  async function checkAdminAccess() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!ADMIN_ROLES.includes(profile?.role || '')) {
      alert('Access denied. Admin access required.')
      router.push('/')
      return
    }

    setIsAdmin(true)
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
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        organizations!inner(name)
      `)
      .order('created_at', { ascending: false })

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

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <div className="text-gray-600">Loading admin panel...</div>
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
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your platform</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-10">
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
          <button
            onClick={() => setActiveTab('marketing')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'marketing'
                ? 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <Megaphone className="w-5 h-5 mx-auto mb-1" />
            Marketing
            {activeTab === 'marketing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Marketing Tab */}
        {activeTab === 'marketing' && <MobileMarketingTab />}

        {/* Organizations View */}
        {activeTab === 'orgs' && (
          <div className="space-y-3">
            {organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedOrg(expandedOrg === org.id ? null : org.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{org.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{org.slug}</p>
                    {org.subdomain && (
                      <p className="text-xs text-blue-600 mt-1 truncate">
                        {org.subdomain}.iamcfo.com
                      </p>
                    )}
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                      expandedOrg === org.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expandedOrg === org.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                          org.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {org.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Plan:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {org.plan_tier || 'Free'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Members:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {org.member_count}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">QBO:</span>
                        <span className={`ml-2 text-xs ${org.qbo_company_id ? 'text-green-600' : 'text-gray-400'}`}>
                          {org.qbo_company_id ? '✓ Connected' : '✗ Not connected'}
                        </span>
                      </div>
                    </div>

                    {org.invite_code && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Invite Code:</div>
                        <div className="font-mono text-sm text-gray-900">{org.invite_code}</div>
                      </div>
                    )}

                    {org.subdomain && (
                      <button
                        onClick={async () => {
                          try {
                            // Get current session
                            const { data: { session } } = await supabase.auth.getSession()
                            
                            if (!session) {
                              alert('No active session. Please log in again.')
                              return
                            }

                            // Build URL with tokens in hash for session transfer
                            const targetUrl = new URL(`https://${org.subdomain}.iamcfo.com/mobile-dashboard`)
                            const hash = new URLSearchParams({
                              access_token: session.access_token,
                              refresh_token: session.refresh_token,
                              super_admin: 'true'
                            }).toString()
                            
                            targetUrl.hash = hash
                            
                            console.log('🚀 Redirecting super admin to:', targetUrl.href)
                            
                            // Open in same window to maintain mobile experience
                            window.location.href = targetUrl.href
                          } catch (error) {
                            console.error('Error transferring session:', error)
                            alert('Failed to open dashboard. Please try again.')
                          }
                        }}
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors active:bg-blue-800"
                      >
                        Open Dashboard
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Users View */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* User Cards */}
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {user.full_name || user.email}
                    </h4>
                    {user.full_name && (
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 truncate">{user.organization_name}</p>
                  </div>
                  <span className={`flex-shrink-0 ml-2 px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'super_admin'
                      ? 'bg-red-100 text-red-700'
                      : user.role === 'owner'
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
