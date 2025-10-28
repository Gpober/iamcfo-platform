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
  
  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [sectionProspects, setSectionProspects] = useState<Prospect[]>([])
  const [loadingSection, setLoadingSection] = useState(false)
  
  // Send email state
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [emailResult, setEmailResult] = useState<{ email: string, success: boolean, message: string } | null>(null)
  
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

      const emailToReplyRate = emailsSent && replies ? (replies / emailsSent) * 100 : 0
      const replyToDemoRate = replies && demos ? (demos / replies) * 100 : 0
      const demoToClientRate = demos && clients ? (clients / demos) * 100 : 0

      setMetrics({
        total_prospects: totalProspects || 0,
        emails_sent: emailsSent || 0,
        replies: replies || 0,
        demos_booked: demos || 0,
        clients_closed: clients || 0,
        email_to_reply_rate: emailToReplyRate,
        reply_to_demo_rate: replyToDemoRate,
        demo_to_client_rate: demoToClientRate,
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProspects() {
    try {
      let query = supabase.from('prospects').select('*').order('created_at', { ascending: false })

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

      const { data, error } = await query

      if (error) throw error

      setProspects(data || [])
    } catch (error) {
      console.error('Error fetching prospects:', error)
    }
  }

  async function fetchLinkedInPerformance() {
    try {
      const { data, error } = await supabase
        .from('linkedin_post_performance')
        .select('*')
        .order('clicks', { ascending: false })
        .limit(10)

      if (error) throw error

      setLinkedinPosts(data || [])
    } catch (error) {
      console.error('Error fetching LinkedIn performance:', error)
    }
  }

  async function fetchSectionProspects(section: string) {
    setLoadingSection(true)
    try {
      let query = supabase.from('prospects').select('*').order('created_at', { ascending: false }).limit(50)

      if (sourceFilter !== 'all') {
        query = query.ilike('source', `${sourceFilter}%`)
      }

      switch (section) {
        case 'emails_sent':
          query = query.eq('email_sent', true)
          break
        case 'replies':
          query = query.eq('replied', true)
          break
        case 'demos':
          query = query.eq('demo_booked', true)
          break
        case 'clients':
          query = query.eq('became_client', true)
          break
        case 'total':
          // No additional filter
          break
      }

      const { data, error } = await query

      if (error) throw error

      setSectionProspects(data || [])
    } catch (error) {
      console.error('Error fetching section prospects:', error)
    } finally {
      setLoadingSection(false)
    }
  }

  function toggleSection(section: string) {
    if (expandedSection === section) {
      setExpandedSection(null)
      setSectionProspects([])
    } else {
      setExpandedSection(section)
      fetchSectionProspects(section)
    }
  }

  async function sendEmailToProspect(email: string) {
    setSendingEmail(email)
    setEmailResult(null)

    try {
      const response = await fetch('/api/marketing/send-single-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailResult({ 
          email, 
          success: true, 
          message: 'Email sent!' 
        })
        
        // Refresh data to update metrics
        refreshData()
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setEmailResult(null)
        }, 3000)
      } else {
        setEmailResult({ 
          email, 
          success: false, 
          message: data.error || 'Failed to send' 
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
    fetchProspects()
    if (expandedSection) {
      fetchSectionProspects(expandedSection)
    }
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
          <span>Showing: <strong className="text-gray-900">{metrics?.total_prospects || 0}</strong> prospects</span>
          {sourceFilter !== 'all' && (
            <span className="text-blue-600">
              from {getSourceLabel(sourceFilter)}
            </span>
          )}
        </div>
      </div>

      {/* Overview Cards with Expandable Prospect Lists */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Prospects Card */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('total')}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">
                  {sourceFilter === 'all' ? 'Total Prospects' : `${getSourceLabel(sourceFilter)} Prospects`}
                </div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics?.total_prospects || 0}
                </div>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'total' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSection === 'total' && (
            <div className="border-t border-gray-200 p-4 max-h-96 overflow-y-auto">
              {loadingSection ? (
                <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
              ) : sectionProspects.length > 0 ? (
                <div className="space-y-2">
                  {sectionProspects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{p.email}</div>
                        <div className="text-xs text-gray-500 truncate">{p.company || 'No company'}</div>
                      </div>
                      <button
                        onClick={() => sendEmailToProspect(p.email)}
                        disabled={sendingEmail === p.email}
                        className={`ml-2 px-3 py-1 text-xs rounded font-medium whitespace-nowrap ${
                          emailResult?.email === p.email && emailResult.success
                            ? 'bg-green-100 text-green-700'
                            : emailResult?.email === p.email && !emailResult.success
                            ? 'bg-red-100 text-red-700'
                            : sendingEmail === p.email
                            ? 'bg-gray-300 text-gray-600 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {sendingEmail === p.email ? '...' : emailResult?.email === p.email ? (emailResult.success ? '✓' : '✗') : '📧 Send'}
                      </button>
                    </div>
                  ))}
                  {sectionProspects.length === 50 && (
                    <div className="text-xs text-gray-500 text-center pt-2">Showing first 50 prospects</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">No prospects yet</div>
              )}
            </div>
          )}
        </div>

        {/* Emails Sent Card */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('emails_sent')}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
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
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'emails_sent' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSection === 'emails_sent' && (
            <div className="border-t border-gray-200 p-4 max-h-96 overflow-y-auto">
              {loadingSection ? (
                <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
              ) : sectionProspects.length > 0 ? (
                <div className="space-y-2">
                  {sectionProspects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-blue-50 rounded hover:bg-blue-100">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{p.email}</div>
                        <div className="text-xs text-gray-500 truncate">
                          Sent: {p.email_sent_at ? new Date(p.email_sent_at).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                      <button
                        onClick={() => sendEmailToProspect(p.email)}
                        disabled={sendingEmail === p.email}
                        className={`ml-2 px-3 py-1 text-xs rounded font-medium whitespace-nowrap ${
                          emailResult?.email === p.email && emailResult.success
                            ? 'bg-green-100 text-green-700'
                            : emailResult?.email === p.email && !emailResult.success
                            ? 'bg-red-100 text-red-700'
                            : sendingEmail === p.email
                            ? 'bg-gray-300 text-gray-600 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {sendingEmail === p.email ? '...' : emailResult?.email === p.email ? (emailResult.success ? '✓' : '✗') : '📧 Send'}
                      </button>
                    </div>
                  ))}
                  {sectionProspects.length === 50 && (
                    <div className="text-xs text-gray-500 text-center pt-2">Showing first 50 prospects</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">No emails sent yet</div>
              )}
            </div>
          )}
        </div>

        {/* Replies Card */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('replies')}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Replies</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {metrics?.replies || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics?.email_to_reply_rate.toFixed(1)}% reply rate
                </div>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'replies' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSection === 'replies' && (
            <div className="border-t border-gray-200 p-4 max-h-96 overflow-y-auto">
              {loadingSection ? (
                <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
              ) : sectionProspects.length > 0 ? (
                <div className="space-y-2">
                  {sectionProspects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-green-50 rounded hover:bg-green-100">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{p.email}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {p.company || 'No company'} · Replied: {p.replied_at ? new Date(p.replied_at).toLocaleDateString() : 'Yes'}
                        </div>
                      </div>
                      <button
                        onClick={() => sendEmailToProspect(p.email)}
                        disabled={sendingEmail === p.email}
                        className={`ml-2 px-3 py-1 text-xs rounded font-medium whitespace-nowrap ${
                          emailResult?.email === p.email && emailResult.success
                            ? 'bg-green-100 text-green-700'
                            : emailResult?.email === p.email && !emailResult.success
                            ? 'bg-red-100 text-red-700'
                            : sendingEmail === p.email
                            ? 'bg-gray-300 text-gray-600 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {sendingEmail === p.email ? '...' : emailResult?.email === p.email ? (emailResult.success ? '✓' : '✗') : '📧 Send'}
                      </button>
                    </div>
                  ))}
                  {sectionProspects.length === 50 && (
                    <div className="text-xs text-gray-500 text-center pt-2">Showing first 50 prospects</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">No replies yet</div>
              )}
            </div>
          )}
        </div>

        {/* Demos Card */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('demos')}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Demos Booked</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {metrics?.demos_booked || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics?.reply_to_demo_rate.toFixed(1)}% of replies
                </div>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'demos' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSection === 'demos' && (
            <div className="border-t border-gray-200 p-4 max-h-96 overflow-y-auto">
              {loadingSection ? (
                <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
              ) : sectionProspects.length > 0 ? (
                <div className="space-y-2">
                  {sectionProspects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-purple-50 rounded hover:bg-purple-100">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{p.email}</div>
                        <div className="text-xs text-gray-500 truncate">{p.company || 'No company'}</div>
                      </div>
                      <button
                        onClick={() => sendEmailToProspect(p.email)}
                        disabled={sendingEmail === p.email}
                        className={`ml-2 px-3 py-1 text-xs rounded font-medium whitespace-nowrap ${
                          emailResult?.email === p.email && emailResult.success
                            ? 'bg-green-100 text-green-700'
                            : emailResult?.email === p.email && !emailResult.success
                            ? 'bg-red-100 text-red-700'
                            : sendingEmail === p.email
                            ? 'bg-gray-300 text-gray-600 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {sendingEmail === p.email ? '...' : emailResult?.email === p.email ? (emailResult.success ? '✓' : '✗') : '📧 Send'}
                      </button>
                    </div>
                  ))}
                  {sectionProspects.length === 50 && (
                    <div className="text-xs text-gray-500 text-center pt-2">Showing first 50 prospects</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">No demos yet</div>
              )}
            </div>
          )}
        </div>

        {/* Clients Card */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('clients')}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Clients Closed</div>
                <div className="text-3xl font-bold text-indigo-600 mt-2">
                  {metrics?.clients_closed || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics?.demo_to_client_rate.toFixed(1)}% close rate
                </div>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'clients' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSection === 'clients' && (
            <div className="border-t border-gray-200 p-4 max-h-96 overflow-y-auto">
              {loadingSection ? (
                <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
              ) : sectionProspects.length > 0 ? (
                <div className="space-y-2">
                  {sectionProspects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-indigo-50 rounded hover:bg-indigo-100">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{p.email}</div>
                        <div className="text-xs text-gray-500 truncate">{p.company || 'No company'}</div>
                      </div>
                      <button
                        onClick={() => sendEmailToProspect(p.email)}
                        disabled={sendingEmail === p.email}
                        className={`ml-2 px-3 py-1 text-xs rounded font-medium whitespace-nowrap ${
                          emailResult?.email === p.email && emailResult.success
                            ? 'bg-green-100 text-green-700'
                            : emailResult?.email === p.email && !emailResult.success
                            ? 'bg-red-100 text-red-700'
                            : sendingEmail === p.email
                            ? 'bg-gray-300 text-gray-600 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {sendingEmail === p.email ? '...' : emailResult?.email === p.email ? (emailResult.success ? '✓' : '✗') : '📧 Send'}
                      </button>
                    </div>
                  ))}
                  {sectionProspects.length === 50 && (
                    <div className="text-xs text-gray-500 text-center pt-2">Showing first 50 clients</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">No clients yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Prospects Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Prospects</h3>
        <ProspectsTable prospects={prospects} onUpdate={refreshData} />
      </div>
    </div>
  )
}
