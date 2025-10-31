'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Send, MessageSquare, Calendar, DollarSign, Search, Filter, ChevronDown } from 'lucide-react'

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

const PROSPECTS_PER_PAGE = 20

const SOURCE_LABELS: Record<SourceFilter, string> = {
  all: 'All Sources',
  email: 'Email',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  twitter: 'Twitter',
  referral: 'Referrals',
  website: 'Website'
}

export default function MobileMarketingTab() {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [totalProspects, setTotalProspects] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingProspects, setLoadingProspects] = useState(false)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [emailResult, setEmailResult] = useState<{ email: string, success: boolean, message: string } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const supabase = createClient()
  const totalPages = Math.ceil(totalProspects / PROSPECTS_PER_PAGE)

  // Fetch metrics when filter changes
  useEffect(() => {
    fetchMetrics()
  }, [sourceFilter])

  // Reset to page 1 and fetch when filter/search changes
  useEffect(() => {
    setCurrentPage(1)
    fetchProspects(1)
  }, [sourceFilter, searchQuery])

  // Fetch prospects when page changes
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

      if (sourceFilter === 'linkedin') {
        const { data: performanceData } = await supabase
          .from('linkedin_post_performance')
          .select('impressions, linkedin_clicks, website_clicks, prospects_generated, demos_booked, clients_closed, likes, comments, shares, posted_at')
        
        if (performanceData) {
          totalProspectsCount = performanceData.reduce((sum, post) => sum + (post.website_clicks || 0), 0)
          emailsSent = performanceData.filter(post => post.posted_at !== null).length
          replies = performanceData.reduce((sum, post) => 
            sum + (post.likes || 0) + (post.comments || 0) + (post.shares || 0), 0)
          demos = performanceData.reduce((sum, post) => sum + (post.demos_booked || 0), 0)
          clients = performanceData.reduce((sum, post) => sum + (post.clients_closed || 0), 0)
        }
      } else {
        // Build queries with optional source filter
        const buildQuery = (baseQuery: any) => 
          sourceFilter === 'all' ? baseQuery : baseQuery.ilike('source', `${sourceFilter}%`)

        const [
          { count: totalCount },
          { count: emailsSentCount },
          { count: repliesCount },
          { count: demosCount },
          { count: clientsCount }
        ] = await Promise.all([
          buildQuery(supabase.from('prospects').select('*', { count: 'exact', head: true })),
          buildQuery(supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('email_sent', true)),
          buildQuery(supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('replied', true)),
          buildQuery(supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('demo_booked', true)),
          buildQuery(supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('became_client', true))
        ])

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
        replies,
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
        .range(from, to)
        .order('created_at', { ascending: false })

      if (sourceFilter !== 'all') {
        query = query.ilike('source', `${sourceFilter}%`)
      }

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
        body: JSON.stringify({ specific_email: email })
      })

      const data = await response.json()

      if (response.ok && data.sent >= 1) {
        setEmailResult({ email, success: true, message: 'Email sent!' })
        fetchMetrics()
        fetchProspects(currentPage)
        setTimeout(() => setEmailResult(null), 3000)
      } else {
        setEmailResult({ 
          email, 
          success: false, 
          message: data.error || data.message || 'Failed to send' 
        })
      }
    } catch (error) {
      setEmailResult({ email, success: false, message: 'Error sending email' })
    } finally {
      setSendingEmail(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-500 text-sm">Loading marketing data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<TrendingUp className="w-4 h-4 text-gray-400" />}
          label="Prospects"
          value={metrics?.total_prospects || 0}
          color="gray"
        />
        <MetricCard
          icon={<Send className="w-4 h-4 text-blue-400" />}
          label="Sent"
          value={metrics?.emails_sent || 0}
          subtitle={metrics?.total_prospects ? 
            `${((metrics.emails_sent / metrics.total_prospects) * 100).toFixed(0)}%` 
            : '0%'}
          color="blue"
        />
        <MetricCard
          icon={<MessageSquare className="w-4 h-4 text-green-400" />}
          label="Replies"
          value={metrics?.replies || 0}
          subtitle={`${metrics?.email_to_reply_rate.toFixed(1)}% rate`}
          color="green"
        />
        <MetricCard
          icon={<Calendar className="w-4 h-4 text-purple-400" />}
          label="Demos"
          value={metrics?.demos_booked || 0}
          subtitle={`${metrics?.reply_to_demo_rate.toFixed(1)}% rate`}
          color="purple"
        />
        <div className="col-span-2">
          <MetricCard
            icon={<DollarSign className="w-4 h-4 text-indigo-400" />}
            label="Clients Closed"
            value={metrics?.clients_closed || 0}
            subtitle={`${metrics?.demo_to_client_rate.toFixed(1)}% close rate`}
            color="indigo"
            large
          />
        </div>
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {SOURCE_LABELS[sourceFilter]}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{totalProspects} prospects</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Filter Dropdown */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {(Object.keys(SOURCE_LABELS) as SourceFilter[]).map((source) => (
            <button
              key={source}
              onClick={() => {
                setSourceFilter(source)
                setShowFilters(false)
              }}
              className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-0 ${
                sourceFilter === source
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {SOURCE_LABELS[source]}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-blue-600 font-medium"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Prospects List Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-500 font-medium">
          {loadingProspects ? 'Loading...' : `${prospects.length} of ${totalProspects} prospects`}
        </span>
        {totalPages > 1 && (
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Prospects Cards */}
      {loadingProspects ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading prospects...</p>
          </div>
        </div>
      ) : prospects.length > 0 ? (
        <div className="space-y-3">
          {prospects.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              prospect={prospect}
              onSendEmail={sendEmailToProspect}
              sendingEmail={sendingEmail}
              emailResult={emailResult}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-gray-400 text-4xl mb-3">🔍</div>
          <p className="text-gray-600 font-medium mb-1">No prospects found</p>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery ? 'Try a different search term' : 'No prospects match the current filter'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Metric Card Component
function MetricCard({ 
  icon, 
  label, 
  value, 
  subtitle, 
  color, 
  large = false 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  subtitle?: string
  color: 'gray' | 'blue' | 'green' | 'purple' | 'indigo'
  large?: boolean
}) {
  const colorClasses = {
    gray: 'text-gray-900',
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className={`${large ? 'text-3xl' : 'text-2xl'} font-bold ${colorClasses[color]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  )
}

// Prospect Card Component
function ProspectCard({ 
  prospect, 
  onSendEmail, 
  sendingEmail, 
  emailResult 
}: { 
  prospect: Prospect
  onSendEmail: (email: string) => void
  sendingEmail: string | null
  emailResult: { email: string, success: boolean, message: string } | null
}) {
  const getProspectName = () => {
    if (prospect.first_name || prospect.last_name) {
      return `${prospect.first_name || ''} ${prospect.last_name || ''}`.trim()
    }
    return 'No name'
  }

  const getButtonState = () => {
    if (prospect.email_sent) {
      return { text: '✓ Email Sent', className: 'bg-gray-100 text-gray-500 cursor-not-allowed' }
    }
    if (sendingEmail === prospect.email) {
      return { text: 'Sending...', className: 'bg-gray-200 text-gray-600 cursor-wait' }
    }
    if (emailResult?.email === prospect.email) {
      if (emailResult.success) {
        return { text: '✓ Sent!', className: 'bg-green-100 text-green-700' }
      }
      return { text: '✗ Failed', className: 'bg-red-100 text-red-700' }
    }
    return { text: '📧 Send Email', className: 'bg-blue-600 hover:bg-blue-700 text-white' }
  }

  const buttonState = getButtonState()

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {getProspectName()}
          </h4>
          <p className="text-sm text-gray-600 truncate">{prospect.email}</p>
          {prospect.company && (
            <p className="text-xs text-gray-500 mt-1 truncate">{prospect.company}</p>
          )}
        </div>
        <span className="flex-shrink-0 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
          {prospect.source}
        </span>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {prospect.became_client && (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
            💰 Client
          </span>
        )}
        {prospect.demo_booked && !prospect.became_client && (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
            📅 Demo
          </span>
        )}
        {prospect.replied && !prospect.demo_booked && (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
            💬 Replied
          </span>
        )}
        {prospect.email_sent && !prospect.replied && (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
            ✉️ Sent
          </span>
        )}
        {!prospect.email_sent && (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
            ⏳ Not Contacted
          </span>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSendEmail(prospect.email)}
        disabled={sendingEmail === prospect.email || prospect.email_sent}
        className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${buttonState.className}`}
      >