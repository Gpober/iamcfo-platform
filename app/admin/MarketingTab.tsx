'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  email_sent: boolean
  email_sent_at: string | null
  replied: boolean
  replied_at: string | null
  demo_booked: boolean
  became_client: boolean
  sequence_step: number
  source: string
  created_at: string
}

export default function MarketingTab() {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [filter, setFilter] = useState<'all' | 'replied' | 'demo' | 'client'>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMetrics()
    fetchProspects()
  }, [filter])

  async function fetchMetrics() {
    try {
      // Get counts from prospects table
      const { count: totalProspects } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })

      const { count: emailsSent } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('email_sent', true)

      const { count: replies } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('replied', true)

      const { count: demos } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('demo_booked', true)

      const { count: clients } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('became_client', true)

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

      if (filter === 'replied') {
        query = query.eq('replied', true)
      } else if (filter === 'demo') {
        query = query.eq('demo_booked', true)
      } else if (filter === 'client') {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading marketing data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Prospects</div>
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

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
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

      {/* Prospects Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Prospects</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('replied')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'replied'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Replied
              </button>
              <button
                onClick={() => setFilter('demo')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'demo'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Demos
              </button>
              <button
                onClick={() => setFilter('client')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'client'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Clients
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prospects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {prospect.first_name} {prospect.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{prospect.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prospect.company || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {prospect.revenue_estimate || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {prospect.became_client && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                          Client ✓
                        </span>
                      )}
                      {prospect.demo_booked && !prospect.became_client && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          Demo Booked
                        </span>
                      )}
                      {prospect.replied && !prospect.demo_booked && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Replied
                        </span>
                      )}
                      {prospect.email_sent && !prospect.replied && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Email {prospect.sequence_step}
                        </span>
                      )}
                      {!prospect.email_sent && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          Not Contacted
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {prospect.email_sent_at
                      ? new Date(prospect.email_sent_at).toLocaleDateString()
                      : 'Not sent'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {prospect.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {prospects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No prospects found. Upload prospects to get started!
          </div>
        )}
      </div>
    </div>
  )
}
