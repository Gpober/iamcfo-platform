'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProspectRow {
  email: string
  first_name?: string
  last_name?: string
  company?: string
  title?: string
  revenue_estimate?: string
  industry?: string
  phone?: string
  source?: string
  qb_version?: string
}

export default function ProspectUploader({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ProspectRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const supabase = createClient()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const parseCSV = (text: string): ProspectRow[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row')
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    // Check for required column
    if (!headers.includes('email')) {
      throw new Error('CSV must have an "email" column')
    }

    // Parse rows
    const rows: ProspectRow[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        row[header] = value
      })

      // Validate email
      if (row.email && row.email.includes('@')) {
        rows.push({
          email: row.email,
          first_name: row.first_name || row.firstname || '',
          last_name: row.last_name || row.lastname || '',
          company: row.company || '',
          title: row.title || '',
          revenue_estimate: row.revenue_estimate || row.revenue || '',
          industry: row.industry || '',
          phone: row.phone || '',
          source: row.source || 'manual',
          qb_version: row.qb_version || row.quickbooks_version || ''
        })
      }
    }

    return rows
  }

  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(null)
    setPreview([])

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setFile(file)

    try {
      const text = await file.text()
      const prospects = parseCSV(text)
      
      if (prospects.length === 0) {
        setError('No valid prospects found in CSV')
        return
      }

      setPreview(prospects.slice(0, 10)) // Show first 10 for preview
      setSuccess(`Found ${prospects.length} prospects. Review and click Upload.`)
    } catch (err: any) {
      setError(err.message)
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await file.text()
      const prospects = parseCSV(text)

      // Prepare data for insert
      const data = prospects.map(p => ({
        email: p.email.toLowerCase(),
        first_name: p.first_name || null,
        last_name: p.last_name || null,
        company: p.company || null,
        title: p.title || null,
        revenue_estimate: p.revenue_estimate || null,
        industry: p.industry || null,
        phone: p.phone || null,
        source: p.source || 'manual',
        qb_version: p.qb_version || null,
        uses_quickbooks: true,
        email_sent: false,
        sequence_step: 0
      }))

      // Upload in batches of 100
      let uploaded = 0
      let duplicates = 0
      const batchSize = 100

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        
        const { data: result, error: uploadError } = await supabase
          .from('prospects')
          .upsert(batch, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          })
          .select()

        if (uploadError) {
          // Check if it's a duplicate email error
          if (uploadError.message.includes('duplicate') || uploadError.code === '23505') {
            duplicates += batch.length
          } else {
            throw uploadError
          }
        } else {
          uploaded += batch.length
        }
      }

      setSuccess(`✅ Uploaded ${uploaded} prospects successfully!${duplicates > 0 ? ` (${duplicates} duplicates skipped)` : ''}`)
      setFile(null)
      setPreview([])
      
      // Refresh parent component
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleExport = async (filter?: string) => {
    setExporting(true)
    setError(null)

    try {
      let query = supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filter === 'not_contacted') {
        query = query.eq('email_sent', false)
      } else if (filter === 'contacted') {
        query = query.eq('email_sent', true)
      } else if (filter === 'replied') {
        query = query.eq('replied', true)
      } else if (filter === 'demo_booked') {
        query = query.eq('demo_booked', true)
      } else if (filter === 'clients') {
        query = query.eq('became_client', true)
      }

      const { data: prospects, error: fetchError } = await query

      if (fetchError) throw fetchError

      if (!prospects || prospects.length === 0) {
        setError('No prospects to export')
        return
      }

      // Convert to CSV
      const headers = [
        'email',
        'first_name',
        'last_name',
        'company',
        'title',
        'revenue_estimate',
        'industry',
        'phone',
        'source',
        'email_sent',
        'replied',
        'demo_booked',
        'became_client',
        'created_at'
      ]

      const csvContent = [
        headers.join(','),
        ...prospects.map(p => [
          p.email,
          p.first_name || '',
          p.last_name || '',
          p.company || '',
          p.title || '',
          p.revenue_estimate || '',
          p.industry || '',
          p.phone || '',
          p.source || '',
          p.email_sent ? 'Yes' : 'No',
          p.replied ? 'Yes' : 'No',
          p.demo_booked ? 'Yes' : 'No',
          p.became_client ? 'Yes' : 'No',
          new Date(p.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prospects-${filter || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setSuccess(`✅ Exported ${prospects.length} prospects`)
    } catch (err: any) {
      console.error('Export error:', err)
      setError(`Export failed: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAll = async (filter?: string) => {
    const confirmMessage = filter 
      ? `Are you sure you want to delete all ${filter} prospects? This cannot be undone.`
      : 'Are you sure you want to delete ALL prospects? This cannot be undone.'
    
    if (!window.confirm(confirmMessage)) return

    setError(null)
    setSuccess(null)

    try {
      let query = supabase.from('prospects').delete()

      // Apply filters
      if (filter === 'not_contacted') {
        query = query.eq('email_sent', false)
      } else if (filter === 'contacted') {
        query = query.eq('email_sent', true).eq('replied', false)
      } else if (filter === 'bounced') {
        // You can add a bounced field if needed
        setError('Bounced filter not yet implemented')
        return
      }

      const { error: deleteError } = await query

      if (deleteError) throw deleteError

      setSuccess(`✅ Deleted ${filter || 'all'} prospects`)
      
      // Refresh parent component
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(`Delete failed: ${err.message}`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📤 Manage Prospects</h3>
        <div className="flex items-center space-x-2">
          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={exporting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium disabled:bg-gray-400"
            >
              {exporting ? 'Exporting...' : '📥 Export CSV'}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport()}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                All Prospects
              </button>
              <button
                onClick={() => handleExport('not_contacted')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Not Contacted
              </button>
              <button
                onClick={() => handleExport('contacted')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Contacted (No Reply)
              </button>
              <button
                onClick={() => handleExport('replied')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Replied
              </button>
              <button
                onClick={() => handleExport('demo_booked')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Demo Booked
              </button>
              <button
                onClick={() => handleExport('clients')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
              >
                Became Clients
              </button>
            </div>
          </div>

          {/* Delete Dropdown */}
          <div className="relative group">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium">
              🗑️ Delete
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleDeleteAll('not_contacted')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                Delete Not Contacted
              </button>
              <button
                onClick={() => handleDeleteAll('contacted')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Delete Contacted (No Reply)
              </button>
              <button
                onClick={() => handleDeleteAll()}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg font-medium"
              >
                ⚠️ Delete ALL Prospects
              </button>
            </div>
          </div>

          <a
            href="/prospects-template.csv"
            download
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium"
          >
            📄 Template
          </a>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />
        
        <label htmlFor="csv-upload" className="cursor-pointer">
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV file with email, first_name, last_name, company, etc.</p>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Preview (first 10 of {preview.length} prospects)
          </h4>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Company</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((prospect, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{prospect.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {prospect.first_name} {prospect.last_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{prospect.company}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{prospect.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{prospect.revenue_estimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upload Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`px-6 py-2 rounded-lg font-medium ${
                uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {uploading ? 'Uploading...' : `Upload ${preview.length} Prospects`}
            </button>
          </div>
        </div>
      )}

      {/* CSV Format Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">CSV Format</h4>
        <p className="text-xs text-gray-600 mb-2">Required columns:</p>
        <ul className="text-xs text-gray-600 space-y-1 ml-4">
          <li>• <strong>email</strong> (required) - Must be valid email</li>
          <li>• <strong>first_name</strong> (optional)</li>
          <li>• <strong>last_name</strong> (optional)</li>
          <li>• <strong>company</strong> (optional)</li>
          <li>• <strong>title</strong> (optional)</li>
          <li>• <strong>revenue_estimate</strong> (optional) - e.g. "$2M-$5M", "$5M-$10M"</li>
          <li>• <strong>industry</strong> (optional)</li>
          <li>• <strong>source</strong> (optional) - e.g. "apollo", "linkedin", "manual"</li>
        </ul>
      </div>
    </div>
  )
}
