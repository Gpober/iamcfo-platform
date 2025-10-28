'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProspectUploader from './ProspectUploader'

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
  id: string
  post_date: string
  status: string
  topic: string
  impressions: number
  likes: number
  comments: number
  shares: number
  linkedin_clicks: number
  engagement_rate: number
  click_through_rate: number
  website_clicks: number
  prospects_generated: number
  demos_booked: number
  clients_closed: number
  click_to_prospect_rate: number
  prospect_to_demo_rate: number
  revenue_generated: number
  linkedin_url: string | null
  posted_at: string | null
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

const PROSPECTS_PER_PAGE = 50

export default function MarketingTab() {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPostPerformance[]>([])
  const [totalProspects, setTotalProspects] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingProspects, setLoadingProspects] = useState(false)
  
  // Send email state
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [emailResult, setEmailResult] = useState<{ email: string, success: boolean, message: string } | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchMetrics()
    if (sourceFilter === 'linkedin') {
      fetchLinkedInPerformance()
    }
  }, [sourceFilter, statusFilter])

  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when filters change
    fetchProspects(1)
  }, [sourceFilter, statusFilter, searchQuery])

  useEffect(() => {
    fetchProspects(currentPage)
  }, [currentPage])

  async function fetchMetrics() {
    try {
      let totalProspectsCount = 0
      let emailsSent = 0
      let replies = 0
      let demos = 0
      let clients = 0

      // LinkedIn-specific metrics from linkedin_post_performance table
      if (sourceFilter === 'linkedin') {
        const { data: performanceData } = await supabase
          .from('linkedin_post_performance')
          .select('impressions, linkedin_clicks, website_clicks, prospects_generated, demos_booked, clients_closed, likes, comments, shares, posted_at')
        
        if (performanceData) {
          // Card 1: Prospects = people who clicked to website
          totalProspectsCount = performanceData.reduce((sum, post) => sum + (post.website_clicks || 0), 0)
          
          // Card 2: Posts Published = count of posts that were published
          emailsSent = performanceData.filter(post => post.posted_at !== null).length
          
          // Card 3: Engagement = LinkedIn platform engagement (likes + comments + shares)
          replies = performanceData.reduce((sum, post) => 
            sum + (post.likes || 0) + (post.comments || 0) + (post.shares || 0), 0)
          
          // Card 4: Demos = sum from performance table
          demos = performanceData.reduce((sum, post) => sum + (post.demos_booked || 0), 0)
          
          // Card 5: Clients = sum from performance table
          clients = performanceData.reduce((sum, post) => sum + (post.clients_closed || 0), 0)
        }

      } else {
        // Standard metrics from prospects table for all other sources
        const { count: totalCount } = await (
          sourceFilter === 'all' 
            ? supabase.from('prospects').select('*', { count: 'exact', head: true })
            : supabase.from('prospects').select('*', { count: 'exact', head: true }).ilike('source', `${sourceFilter}%`)
        )

        const { count: emailsSentCount } = await (
          sourceFilter === 'all'
            ? supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('email_sent', true)
            : supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('email_sent', true).ilike('source', `${sourceFilter}%`)
        )

        const { count: repliesCount } = await (
          sourceFilter === 'all'
            ? supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('replied', true)
            : supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('replied', true).ilike('source', `${sourceFilter}%`)
        )

        const { count: demosCount } = await (
          sourceFilter === 'all'
            ? supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('demo_booked', true)
            : supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('demo_booked', true).ilike('source', `${sourceFilter}%`)
        )

        const { count: clientsCount } = await (
          sourceFilter === 'all'
            ? supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('became_client', true)
            : supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('became_client', true).ilike('source', `${sourceFilter}%`)
        )

        totalProspectsCount = totalCount || 0
        emailsSent = emailsSentCount || 0
        replies = repliesCount || 0
        demos = demosCount || 0
        clients = clientsCount || 0
      }

      const emailToReplyRate = emailsSent && replies ? (replies / emailsSent) * 100 : 0
      const replyToDemoRate = replies && demos ? (demos / replies) * 100 : 0
      const demoToClientRate = demos && clients ? (clients / demos) * 100 : 0

      setMetrics({
        total_prospects: totalProspectsCount,
        emails_sent: emailsSent,
        replies: replies,
        demos_booked: demos,
        clients_closed: clients,
        email_to_reply_rate: emailToReplyRate,
        reply_to_demo_rate: replyToDemoRate,
        demo_to_client_rate: demoToClientRate,
      })
      
      setTotalProspects(totalProspectsCount)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProspects(page: number) {
    setLoadingProspects(true)
    try {
      const from = (page - 1) * PROSPECTS_PER_PAGE
      const to = from + PROSPECTS_PER_PAGE - 1

      let query = supabase
        .from('prospects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (sourceFilter !== 'all') {
        query = query.ilike('source', `${sourceFilter}%`)
      }

      if (statusFilter === 'replied') {
        query = query.eq('replied', true)
      } else if (statusFilter === 'demo') {
        query = query.eq('demo_booked', true)
      } else if (statusFilter === 'client') {
        query = query.eq('became_client', true)
      }

      // Add search filter
      if (searchQuery.trim()) {
        query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      setProspects(data || [])
      if (count !== null) {
        setTotalProspects(count)
      }
    } catch (error) {
      console.error('Error fetching prospects:', error)
    } finally {
      setLoadingProspects(false)
    }
  }

  async function fetchLinkedInPerformance() {
    try {
      const { data, error } = await supabase
        .from('linkedin_post_performance')
        .select('*')
        .order('website_clicks', { ascending: false })
        .limit(10)

      if (error) throw error

      setLinkedinPosts(data || [])
    } catch (error) {
      console.error('Error fetching LinkedIn performance:', error)
    }
  }

  async function sendEmailToProspect(email: string) {
    setSendingEmail(email)
    setEmailResult(null)

    try {
      const response = await fetch('https://iamcfo-platform.vercel.app/api/marketing/send-campaign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer iamcfo_campaign_secret_2024_xyz789'
        },
        body: JSON.stringify({ 
          specific_email: email 
        })
      })

      const data = await response.json()

      if (response.ok && data.sent >= 1) {
        setEmailResult({ 
          email, 
          success: true, 
          message: 'Email sent!' 
        })
        
        refreshData()
        
        setTimeout(() => {
          setEmailResult(null)
        }, 3000)
      } else {
        setEmailResult({ 
          email, 
          success: false, 
          message: data.error || data.message || 'Failed to send' 
        })
      }
    } catch (error) {
      setEmailResult({ 
        email, 
        success: false, 
        message: 'Error sending email' 
      })
    } finally {
      setSendingEmail(null)
    }
  }

  function refreshData() {
    fetchMetrics()
    fetchProspects(currentPage)
  }

  function getSourceLabel(source: SourceFilter) {
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

  const totalPages = Math.ceil(totalProspects / PROSPECTS_PER_PAGE)

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
        
        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
          <span>Showing: <strong className="text-gray-900">{totalProspects || 0}</strong> prospects</span>
          {sourceFilter !== 'all' && (
            <span className="text-blue-600">
              from {getSourceLabel(sourceFilter)}
            </span>
          )}
        </div>
      </div>

      {/* Clean Metric Cards - Above Search */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Prospects Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            {sourceFilter === 'all' ? 'Total Prospects' : `${getSourceLabel(sourceFilter)} Prospects`}
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {metrics?.total_prospects || 0}
          </div>
        </div>

        {/* Emails Sent Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            {sourceFilter === 'email' ? 'Emails Sent' :
             sourceFilter === 'linkedin' ? 'Posts Published' :
             sourceFilter === 'tiktok' ? 'TikTok Videos' :
             sourceFilter === 'instagram' ? 'IG Posts' :
             sourceFilter === 'twitter' ? 'Tweets Sent' :
             'Outreach Sent'}
          </div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {metrics?.emails_sent || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.total_prospects ? 
              `${((metrics.emails_sent / metrics.total_prospects) * 100).toFixed(1)}% of prospects` 
              : '0%'}
          </div>
        </div>

        {/* Replies Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            {sourceFilter === 'email' ? 'Email Replies' :
             sourceFilter === 'linkedin' ? 'Total Engagement' :
             sourceFilter === 'tiktok' ? 'TikTok Engagement' :
             sourceFilter === 'instagram' ? 'IG Engagement' :
             sourceFilter === 'twitter' ? 'Tweet Replies' :
             'Replies'}
          </div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {metrics?.replies || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.email_to_reply_rate.toFixed(1)}% {sourceFilter === 'linkedin' ? 'engagement rate' : 'reply rate'}
          </div>
        </div>

        {/* Demos Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            {sourceFilter === 'linkedin' ? 'LinkedIn Demos' :
             sourceFilter === 'tiktok' ? 'TikTok Demos' :
             sourceFilter === 'instagram' ? 'IG Demos' :
             sourceFilter === 'twitter' ? 'Twitter Demos' :
             sourceFilter === 'referral' ? 'Referral Demos' :
             sourceFilter === 'website' ? 'Website Demos' :
             'Demos Booked'}
          </div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {metrics?.demos_booked || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.reply_to_demo_rate.toFixed(1)}% of {sourceFilter === 'linkedin' ? 'engagement' : 'replies'}
          </div>
        </div>

        {/* Clients Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            {sourceFilter === 'linkedin' ? 'LinkedIn Clients' :
             sourceFilter === 'tiktok' ? 'TikTok Clients' :
             sourceFilter === 'instagram' ? 'IG Clients' :
             sourceFilter === 'twitter' ? 'Twitter Clients' :
             sourceFilter === 'email' ? 'Email Clients' :
             sourceFilter === 'referral' ? 'Referral Clients' :
             sourceFilter === 'website' ? 'Website Clients' :
             'Clients Closed'}
          </div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">
            {metrics?.clients_closed || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.demo_to_client_rate.toFixed(1)}% close rate
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Search by email, name, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </div>
        
        {searchQuery && (
          <div className="mt-2 text-xs text-gray-500">
            Searching for: <strong className="text-gray-900">"{searchQuery}"</strong>
          </div>
        )}
      </div>

      {/* LinkedIn Post Performance Table */}
      {sourceFilter === 'linkedin' && linkedinPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💼 Top Performing LinkedIn Posts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prospects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {linkedinPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{post.topic}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.post_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.impressions?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((post.likes || 0) + (post.comments || 0) + (post.shares || 0)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{post.website_clicks?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{post.prospects_generated?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">{post.demos_booked?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{post.clients_closed?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${post.revenue_generated?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {post.linkedin_url ? (
                        <a
                          href={post.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Post
                        </a>
                      ) : (
                        <span className="text-gray-400">No link</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Prospects Table with Pagination */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            All Prospects 
            {totalPages > 1 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </h3>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                {(currentPage - 1) * PROSPECTS_PER_PAGE + 1} - {Math.min(currentPage * PROSPECTS_PER_PAGE, totalProspects)} of {totalProspects}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {loadingProspects ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading prospects...</div>
          </div>
        ) : prospects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prospects.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prospect.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prospect.first_name || prospect.last_name ? 
                        `${prospect.first_name || ''} ${prospect.last_name || ''}`.trim() : 
                        <span className="text-gray-400">No name</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prospect.company || <span className="text-gray-400">No company</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prospect.source || 'unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col space-y-1">
                        {prospect.became_client && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            💰 Client
                          </span>
                        )}
                        {prospect.demo_booked && !prospect.became_client && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            📅 Demo Booked
                          </span>
                        )}
                        {prospect.replied && !prospect.demo_booked && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            💬 Replied
                          </span>
                        )}
                        {prospect.email_sent && !prospect.replied && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            ✉️ Email Sent
                          </span>
                        )}
                        {!prospect.email_sent && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            ⏳ Not Contacted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => sendEmailToProspect(prospect.email)}
                        disabled={sendingEmail === prospect.email || prospect.email_sent}
                        className={`px-4 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                          prospect.email_sent
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : emailResult?.email === prospect.email && emailResult.success
                            ? 'bg-green-100 text-green-700'
                            : emailResult?.email === prospect.email && !emailResult.success
                            ? 'bg-red-100 text-red-700'
                            : sendingEmail === prospect.email
                            ? 'bg-gray-300 text-gray-600 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {prospect.email_sent 
                          ? '✓ Sent' 
                          : sendingEmail === prospect.email 
                          ? 'Sending...' 
                          : emailResult?.email === prospect.email 
                          ? (emailResult.success ? '✓ Sent!' : '✗ Failed') 
                          : '📧 Send Email'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No prospects found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
