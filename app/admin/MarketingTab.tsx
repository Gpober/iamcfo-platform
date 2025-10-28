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

interface PlatformOverview {
  platform: string
  displayName: string
  icon: string
  color: string
  prospects: number
  demos: number
  clients: number
  conversion_rate: number
}

type SourceFilter = 'all' | 'email' | 'linkedin' | 'tiktok' | 'instagram' | 'twitter' | 'facebook' | 'referral' | 'website'
type StatusFilter = 'all' | 'replied' | 'demo' | 'client'

const PLATFORM_CONFIG = {
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: 'blue',
    description: 'Professional B2B networking and lead generation'
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: 'pink',
    description: 'Short-form video content for brand awareness'
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    color: 'purple',
    description: 'Visual storytelling and engagement'
  },
  twitter: {
    name: 'Twitter/X',
    icon: '🐦',
    color: 'sky',
    description: 'Real-time updates and thought leadership'
  },
  facebook: {
    name: 'Facebook',
    icon: '👥',
    color: 'blue',
    description: 'Community building and retargeting'
  },
  email: {
    name: 'Email',
    icon: '📧',
    color: 'green',
    description: 'Direct outreach campaigns'
  }
}

export default function MarketingTab() {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPostPerformance[]>([])
  const [platformOverviews, setPlatformOverviews] = useState<PlatformOverview[]>([])
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
    if (sourceFilter === 'all') {
      fetchPlatformOverviews()
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

  async function fetchPlatformOverviews() {
    try {
      const platforms: PlatformOverview[] = []
      
      for (const [key, config] of Object.entries(PLATFORM_CONFIG)) {
        const { count: totalProspects } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .ilike('source', `${key}%`)

        const { count: demos } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('demo_booked', true)
          .ilike('source', `${key}%`)

        const { count: clients } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('became_client', true)
          .ilike('source', `${key}%`)

        const conversionRate = totalProspects && clients ? (clients / totalProspects) * 100 : 0

        platforms.push({
          platform: key,
          displayName: config.name,
          icon: config.icon,
          color: config.color,
          prospects: totalProspects || 0,
          demos: demos || 0,
          clients: clients || 0,
          conversion_rate: conversionRate
        })
      }

      // Sort by prospects count
      platforms.sort((a, b) => b.prospects - a.prospects)
      setPlatformOverviews(platforms)
    } catch (error) {
      console.error('Error fetching platform overviews:', error)
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

      if (section === 'replies') {
        query = query.eq('replied', true)
      } else if (section === 'demos') {
        query = query.eq('demo_booked', true)
      } else if (section === 'clients') {
        query = query.eq('became_client', true)
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
      const response = await fetch('/api/send-campaign-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          template: 'follow_up'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setEmailResult({ email, success: true, message: 'Email sent!' })
        setTimeout(() => setEmailResult(null), 3000)
      } else {
        setEmailResult({ email, success: false, message: result.error })
        setTimeout(() => setEmailResult(null), 5000)
      }
    } catch (error) {
      setEmailResult({ email, success: false, message: 'Failed to send' })
      setTimeout(() => setEmailResult(null), 5000)
    } finally {
      setSendingEmail(null)
    }
  }

  function refreshData() {
    fetchMetrics()
    fetchProspects()
    if (sourceFilter === 'linkedin') {
      fetchLinkedInPerformance()
    }
    if (sourceFilter === 'all') {
      fetchPlatformOverviews()
    }
  }

  const platformConfig = sourceFilter !== 'all' ? PLATFORM_CONFIG[sourceFilter as keyof typeof PLATFORM_CONFIG] : null

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header with Platform-Specific Branding */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {platformConfig ? platformConfig.icon : '📊'} Marketing Dashboard
            {platformConfig && <span className="text-gray-500">/ {platformConfig.name}</span>}
          </h2>
          {platformConfig && (
            <p className="text-sm text-gray-600 mt-1">{platformConfig.description}</p>
          )}
        </div>
        <ProspectUploader onUploadComplete={refreshData} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="email">📧 Email</option>
              <option value="linkedin">💼 LinkedIn</option>
              <option value="tiktok">🎵 TikTok</option>
              <option value="instagram">📸 Instagram</option>
              <option value="twitter">🐦 Twitter/X</option>
              <option value="facebook">👥 Facebook</option>
              <option value="referral">🤝 Referral</option>
              <option value="website">🌐 Website</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="replied">Replied</option>
              <option value="demo">Demo Booked</option>
              <option value="client">Became Client</option>
            </select>
          </div>
        </div>
      </div>

      {/* Platform Overview Cards - Only shown when "All" is selected */}
      {sourceFilter === 'all' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Platform Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformOverviews.map((platform) => (
              <button
                key={platform.platform}
                onClick={() => setSourceFilter(platform.platform as SourceFilter)}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{platform.displayName}</h4>
                      <p className="text-xs text-gray-500">Click to view details</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prospects</span>
                    <span className="text-lg font-bold text-gray-900">{platform.prospects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Demos</span>
                    <span className="text-lg font-bold text-purple-600">{platform.demos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Clients</span>
                    <span className="text-lg font-bold text-green-600">{platform.clients}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Conversion Rate</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {platform.conversion_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LinkedIn-Specific Post Performance */}
      {sourceFilter === 'linkedin' && linkedinPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            💼 Top Performing LinkedIn Posts
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prospects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {linkedinPosts.map((post) => (
                  <tr key={post.post_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.topic}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.post_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.clicks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{post.prospects}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">{post.demos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{post.clients}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${post.revenue.toLocaleString()}</td>
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

      {/* Platform-Specific Insights */}
      {sourceFilter !== 'all' && platformConfig && (
        <div className={`bg-gradient-to-r from-${platformConfig.color}-50 to-${platformConfig.color}-100 rounded-lg p-6 border border-${platformConfig.color}-200`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            {platformConfig.icon} {platformConfig.name} Strategy Tips
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            {sourceFilter === 'linkedin' && (
              <>
                <p>✓ Post 3-5 times per week for optimal engagement</p>
                <p>✓ Use native video for 5x higher reach than links</p>
                <p>✓ Tag relevant companies and people to expand visibility</p>
                <p>✓ Best posting times: Tuesday-Thursday, 8-10am EST</p>
              </>
            )}
            {sourceFilter === 'tiktok' && (
              <>
                <p>✓ Post 1-3 times daily for algorithm favor</p>
                <p>✓ Hook viewers in first 3 seconds</p>
                <p>✓ Use trending sounds and hashtags strategically</p>
                <p>✓ Keep videos 15-60 seconds for maximum completion rate</p>
              </>
            )}
            {sourceFilter === 'instagram' && (
              <>
                <p>✓ Mix Reels, Stories, and Feed posts for balanced reach</p>
                <p>✓ Use 8-12 relevant hashtags per post</p>
                <p>✓ Engage with comments within first hour for algorithm boost</p>
                <p>✓ Best posting times: Wednesday 11am, Friday 10am-11am EST</p>
              </>
            )}
            {sourceFilter === 'twitter' && (
              <>
                <p>✓ Tweet 3-10 times daily for consistent presence</p>
                <p>✓ Use threads for longer-form content that drives engagement</p>
                <p>✓ Quote tweet and reply to industry leaders</p>
                <p>✓ Best posting times: Weekdays 8am-10am, 12pm-1pm EST</p>
              </>
            )}
            {sourceFilter === 'facebook' && (
              <>
                <p>✓ Focus on community building and engagement</p>
                <p>✓ Use Facebook Live for 6x higher engagement</p>
                <p>✓ Post 1-2 times daily, prioritize quality over quantity</p>
                <p>✓ Best posting times: Wednesday-Friday 1pm-4pm EST</p>
              </>
            )}
            {sourceFilter === 'email' && (
              <>
                <p>✓ Personalize subject lines for 26% higher open rates</p>
                <p>✓ Send Tuesday-Thursday for best engagement</p>
                <p>✓ A/B test send times, subject lines, and CTAs</p>
                <p>✓ Keep emails under 200 words with clear single CTA</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Prospects Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Prospects</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {metrics?.total_prospects || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {sourceFilter === 'all' ? 'All sources' : `From ${platformConfig?.name || sourceFilter}`}
          </div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {sourceFilter === 'all' ? 'All Prospects' : `${platformConfig?.name || sourceFilter} Prospects`}
        </h3>
        <ProspectsTable prospects={prospects} onUpdate={refreshData} />
      </div>
    </div>
  )
}
