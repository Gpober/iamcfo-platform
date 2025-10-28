'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProspectUploader from './ProspectUploader'
import ProspectsTable from './ProspectsTable'

interface MarketingMetrics {
  total_prospects: number
  emails_sent: number
  replies: number
  demos_booked: number
  clients_closed: number
  email_to_reply_rate: number
  reply_to_demo_rate: number
  demo_to_client_rate: number
}

interface LinkedInPostPerformance {
  post_id: string
  topic: string
  post_date: string
  tracking_url: string
  linkedin_url: string | null
  clicks: number
  prospects: number
  demos: number
  clients: number
  revenue: number
}

interface Prospect {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company: string | null
  title: string | null
  revenue_estimate: string | null
  industry: string | null
  email_sent: boolean
  email_sent_at: string | null
  replied: boolean
  replied_at: string | null
  demo_booked: boolean
  became_client: boolean
  sequence_step: number
  source: string
  created_at: string
  phone: string | null
  notes: string | null
}

type SourceFilter = 'all' | 'email' | 'linkedin' | 'tiktok' | 'instagram' | 'twitter' | 'referral' | 'website'
type StatusFilter = 'all' | 'replied' | 'demo' | 'client'

export default function MarketingTab() {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPostPerformance[]>([])
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMetrics()
    fetchProspects()
    if (sourceFilter === 'linkedin') {
      fetchLinkedInPerformance()
    }
  }, [sourceFilter, statusFilter])

  async function fetchMetrics() {
    try {
      // Build base query with source filter
      let baseQuery = supabase.from('prospects')
      
      if (sourceFilter !== 'all') {
        baseQuery = baseQuery.select('*', { count: 'exact', head: true }).ilike('source', `${sourceFilter}%`)
      }

      const { count: totalProspects } = await (
        sourceFilter === 'all' 
          ? supabase.from('prospects').select('*', { count: 'exact', head: true })
          : supabase.from('prospects').select('*', { count: 'exact', head: true }).ilike('source', `${sourceFilter}%`)
      )

      const { count: emailsSent } = await (
        sourceFilter === 'all'
          ? supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('email_sent', true)
          : supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('email_sent', true).ilike('source', `${sourceFilter}%`)
      )

      const { count: replies } = await (
        sourceFilter === 'all'
          ? supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('replied', true)
          : supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('replied', true).ilike('source', `${sourceFilter}%`)
      )

      const { count: demos } = await (
        sourceFilter === 'all'
          ? supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('demo_booked', true)
          : supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('demo_booked', true).ilike('source', `${sourceFilter}%`)
      )

      const { count: clients } = await (
        sourceFilter === 'all'
          ? supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('became_client', true)
          : supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('became_client', true).ilike('source', `${sourceFilter}%`)
      )

      // Calculate conversion rates
      const emailToReplyRate = emailsSent ? ((replies || 0) / emailsSent) * 100 : 0
      const replyToDemoRate = replies ? ((demos || 0) / replies) * 100 : 0
      const demoToClientRate = demos ? ((clients || 0) / demos) * 100 : 0

      setMetrics({
        total_prospects: totalProspects || 0,
        emails_sent: emailsSent || 0,
        replies: replies || 0,
        demos_booked: demos || 0,
        clients_closed: clients || 0,
        email_to_reply_rate: emailToReplyRate,
        reply_to_demo_rate: replyToDemoRate,
        demo_to_client_rate: demoToClientRate
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  async function fetchProspects() {
    try {
      let query = supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      // Apply source filter
      if (sourceFilter !== 'all') {
        query = query.ilike('source', `${sourceFilter}%`)
      }

      // Apply status filter
      if (statusFilter === 'replied') {
        query = query.eq('replied', true)
      } else if (statusFilter === 'demo') {
        query = query.eq('demo_booked', true)
      } else if (statusFilter === 'client') {
        query = query.eq('became_client', true)
      }

      const { data, error } = await query

      if (error) throw error
      setProspects(data || [])
    } catch (error) {
      console.error('Error fetching prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLinkedInPerformance() {
    try {
      const { data, error } = await supabase
        .from('linkedin_campaign_performance')
        .select('*')
        .order('prospects_generated', { ascending: false })
        .limit(10)

      if (error) throw error

      const formatted: LinkedInPostPerformance[] = (data || []).map((post: any) => ({
        post_id: post.id,
        topic: post.topic || 'Untitled',
        post_date: post.post_date,
        tracking_url: post.tracking_url || '',
        linkedin_url: post.linkedin_url,
        clicks: post.website_clicks || 0,
        prospects: post.prospects_generated || 0,
        demos: post.demos_booked || 0,
        clients: post.clients_closed || 0,
        revenue: post.revenue_generated || 0
      }))

      setLinkedinPosts(formatted)
    } catch (error) {
      console.error('Error fetching LinkedIn performance:', error)
    }
  }

  const refreshData = () => {
    fetchMetrics()
    fetchProspects()
    if (sourceFilter === 'linkedin') {
      fetchLinkedInPerformance()
    }
  }

  const getSourceLabel = (source: SourceFilter) => {
    const labels: Record<SourceFilter, string> = {
      all: 'All Sources',
      email: 'Email Campaigns',
      linkedin: 'LinkedIn',
      tiktok: 'TikTok',
      instagram: 'Instagram',
      twitter: 'Twitter/X',
      referral: 'Referrals',
      website: 'Website'
    }
    return labels[source]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading marketing data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Prospects */}
      <ProspectUploader onUploadComplete={refreshData} />

      {/* Source Filter Dropdown */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Filter by Source:</h3>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">🌐 All Sources</option>
            <option value="email">📧 Email Campaigns</option>
            <option value="linkedin">💼 LinkedIn</option>
            <option value="tiktok">🎵 TikTok</option>
            <option value="instagram">📸 Instagram</option>
            <option value="twitter">🐦 Twitter/X</option>
            <option value="referral">👥 Referrals</option>
            <option value="website">🌍 Website Direct</option>
          </select>
        </div>
        
        {/* Source Stats Summary */}
        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
          <span>Showing: <strong className="text-gray-900">{metrics?.total_prospects || 0}</strong> prospects</span>
          {sourceFilter !== 'all' && (
            <span className="text-blue-600">
              from {getSourceLabel(sourceFilter)}
            </span>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            {sourceFilter === 'all' ? 'Total Prospects' : `${getSourceLabel(sourceFilter)} Prospects`}
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {metrics?.total_prospects || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Emails Sent</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {metrics?.emails_sent || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.total_prospects ? 
              `${((metrics.emails_sent / metrics.total_prospects) * 100).toFixed(1)}% of prospects` 
              : '0%'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Replies</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {metrics?.replies || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.email_to_reply_rate.toFixed(1)}% reply rate
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Demos Booked</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {metrics?.demos_booked || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.reply_to_demo_rate.toFixed(1)}% of replies
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Clients Closed</div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">
            {metrics?.clients_closed || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.demo_to_client_rate.toFixed(1)}% close rate
          </div>
        </div>
      </div>

      {/* LinkedIn Top Performers (only show when LinkedIn filter is active) */}
      {sourceFilter === 'linkedin' && linkedinPosts.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🏆 Top Performing LinkedIn Posts
          </h3>
          <div className="space-y-3">
            {linkedinPosts.slice(0, 5).map((post, idx) => (
              <div key={post.post_id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl font-bold text-blue-600">#{idx + 1}</span>
                      <span className="text-sm font-semibold text-gray-900">{post.topic}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Posted: {new Date(post.post_date).toLocaleDateString()}
                      {post.linkedin_url && (
                        <a
                          href={post.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-500 hover:underline"
                        >
                          View Post →
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-3 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Clicks</div>
                        <div className="text-lg font-bold text-gray-900">{post.clicks}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Prospects</div>
                        <div className="text-lg font-bold text-green-600">{post.prospects}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Demos</div>
                        <div className="text-lg font-bold text-purple-600">{post.demos}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Clients</div>
                        <div className="text-lg font-bold text-indigo-600">{post.clients}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Revenue</div>
                        <div className="text-lg font-bold text-green-700">${post.revenue}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {sourceFilter === 'all' ? 'Overall Conversion Funnel' : `${getSourceLabel(sourceFilter)} Funnel`}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700">Prospects</div>
            <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
              <div 
                className="bg-gray-400 h-8 rounded-full flex items-center justify-end pr-3"
                style={{ width: '100%' }}
              >
                <span className="text-white font-semibold text-sm">
                  {metrics?.total_prospects}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700">Emailed</div>
            <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
              <div 
                className="bg-blue-500 h-8 rounded-full flex items-center justify-end pr-3"
                style={{ 
                  width: `${metrics?.total_prospects ? 
                    (metrics.emails_sent / metrics.total_prospects) * 100 : 0}%` 
                }}
              >
                <span className="text-white font-semibold text-sm">
                  {metrics?.emails_sent} ({metrics?.total_prospects ? 
                    ((metrics.emails_sent / metrics.total_prospects) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700">Replied</div>
            <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
              <div 
                className="bg-green-500 h-8 rounded-full flex items-center justify-end pr-3"
                style={{ 
                  width: `${metrics?.emails_sent ? 
                    (metrics.replies / metrics.emails_sent) * 100 : 0}%` 
                }}
              >
                <span className="text-white font-semibold text-sm">
                  {metrics?.replies} ({metrics?.email_to_reply_rate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700">Demo Booked</div>
            <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
              <div 
                className="bg-purple-500 h-8 rounded-full flex items-center justify-end pr-3"
                style={{ 
                  width: `${metrics?.replies ? 
                    (metrics.demos_booked / metrics.replies) * 100 : 0}%` 
                }}
              >
                <span className="text-white font-semibold text-sm">
                  {metrics?.demos_booked} ({metrics?.reply_to_demo_rate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700">Clients</div>
            <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
              <div 
                className="bg-indigo-600 h-8 rounded-full flex items-center justify-end pr-3"
                style={{ 
                  width: `${metrics?.demos_booked ? 
                    (metrics.clients_closed / metrics.demos_booked) * 100 : 0}%` 
                }}
              >
                <span className="text-white font-semibold text-sm">
                  {metrics?.clients_closed} ({metrics?.demo_to_client_rate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prospects Table Header with Status Filters */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Prospects (Last 50)
              {sourceFilter !== 'all' && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  from {getSourceLabel(sourceFilter)}
                </span>
              )}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-sm rounded ${
                  statusFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('replied')}
                className={`px-3 py-1 text-sm rounded ${
                  statusFilter === 'replied'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Replied
              </button>
              <button
                onClick={() => setStatusFilter('demo')}
                className={`px-3 py-1 text-sm rounded ${
                  statusFilter === 'demo'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Demos
              </button>
              <button
                onClick={() => setStatusFilter('client')}
                className={`px-3 py-1 text-sm rounded ${
                  statusFilter === 'client'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Clients
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Table with Inline Editing */}
        <ProspectsTable prospects={prospects} onUpdate={refreshData} />
      </div>
    </div>
  )
}
