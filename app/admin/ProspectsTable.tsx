'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

interface ProspectsTableProps {
  prospects: Prospect[]
  onUpdate: () => void
}

export default function ProspectsTable({ prospects, onUpdate }: ProspectsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Prospect>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const startEdit = (prospect: Prospect) => {
    setEditingId(prospect.id)
    setEditForm({
      first_name: prospect.first_name || '',
      last_name: prospect.last_name || '',
      company: prospect.company || '',
      title: prospect.title || '',
      revenue_estimate: prospect.revenue_estimate || '',
      industry: prospect.industry || '',
      phone: prospect.phone || '',
      notes: prospect.notes || ''
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (prospectId: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('prospects')
        .update(editForm)
        .eq('id', prospectId)

      if (error) throw error

      setEditingId(null)
      setEditForm({})
      onUpdate()
    } catch (error) {
      console.error('Error updating prospect:', error)
      alert('Failed to update prospect')
    } finally {
      setSaving(false)
    }
  }

  const deleteProspect = async (prospectId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return

    setDeleting(prospectId)
    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', prospectId)

      if (error) throw error

      onUpdate()
    } catch (error) {
      console.error('Error deleting prospect:', error)
      alert('Failed to delete prospect')
    } finally {
      setDeleting(null)
    }
  }

  const toggleStatus = async (prospectId: string, field: 'replied' | 'demo_booked' | 'became_client', currentValue: boolean) => {
    try {
      const update: any = { [field]: !currentValue }
      
      // Set timestamp when toggling to true
      if (!currentValue) {
        if (field === 'replied') update.replied_at = new Date().toISOString()
        if (field === 'demo_booked') update.demo_booked_at = new Date().toISOString()
        if (field === 'became_client') update.became_client_at = new Date().toISOString()
      } else {
        // Clear timestamp when toggling to false
        if (field === 'replied') update.replied_at = null
        if (field === 'demo_booked') update.demo_booked_at = null
        if (field === 'became_client') update.became_client_at = null
      }

      const { error } = await supabase
        .from('prospects')
        .update(update)
        .eq('id', prospectId)

      if (error) throw error

      onUpdate()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  if (prospects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
        <p className="text-lg mb-2">No prospects found</p>
        <p className="text-sm">Upload a CSV to get started!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quick Toggle
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prospects.map((prospect) => (
              <tr key={prospect.id} className="hover:bg-gray-50">
                {/* Contact Info */}
                <td className="px-6 py-4">
                  {editingId === prospect.id ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editForm.first_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        placeholder="First name"
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      />
                      <input
                        type="text"
                        value={editForm.last_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        placeholder="Last name"
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">{prospect.email}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {prospect.first_name} {prospect.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{prospect.email}</div>
                    </div>
                  )}
                </td>

                {/* Company */}
                <td className="px-6 py-4">
                  {editingId === prospect.id ? (
                    <input
                      type="text"
                      value={editForm.company || ''}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="Company"
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{prospect.company || 'N/A'}</div>
                  )}
                </td>

                {/* Title */}
                <td className="px-6 py-4">
                  {editingId === prospect.id ? (
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Title"
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">{prospect.title || 'N/A'}</div>
                  )}
                </td>

                {/* Revenue */}
                <td className="px-6 py-4">
                  {editingId === prospect.id ? (
                    <select
                      value={editForm.revenue_estimate || ''}
                      onChange={(e) => setEditForm({ ...editForm, revenue_estimate: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Select</option>
                      <option value="$2M-$5M">$2M-$5M</option>
                      <option value="$5M-$10M">$5M-$10M</option>
                      <option value="$10M-$25M">$10M-$25M</option>
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500">{prospect.revenue_estimate || 'N/A'}</div>
                  )}
                </td>

                {/* Status */}
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

                {/* Actions */}
                <td className="px-6 py-4">
                  {editingId === prospect.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveEdit(prospect.id)}
                        disabled={saving}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(prospect)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProspect(prospect.id, prospect.email)}
                        disabled={deleting === prospect.id}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {deleting === prospect.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </td>

                {/* Quick Toggle */}
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <label className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        checked={prospect.replied}
                        onChange={() => toggleStatus(prospect.id, 'replied', prospect.replied)}
                        className="rounded"
                      />
                      <span>Replied</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        checked={prospect.demo_booked}
                        onChange={() => toggleStatus(prospect.id, 'demo_booked', prospect.demo_booked)}
                        className="rounded"
                      />
                      <span>Demo</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        checked={prospect.became_client}
                        onChange={() => toggleStatus(prospect.id, 'became_client', prospect.became_client)}
                        className="rounded"
                      />
                      <span>Client</span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
