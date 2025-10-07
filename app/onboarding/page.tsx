'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadOrg() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('organization_id, organizations(name)')
        .eq('id', user.id)
        .single()

      if (userData?.organizations) {
        // @ts-ignore
        setOrgName(userData.organizations.name)
      }
      
      setLoading(false)
    }

    loadOrg()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <img src="/lib/logo.png" alt="I AM CFO" className="h-12 mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Welcome to I AM CFO! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            You're almost there, {orgName}. Let's connect your QuickBooks.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold">
                  ✓
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Account Created</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-full h-0.5 bg-gray-200 mx-4"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
                  2
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Connect QuickBooks</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-full h-0.5 bg-gray-200 mx-4"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-600 font-bold">
                  3
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Dashboard Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Step 1: Invite Us to Your QuickBooks
          </h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-sm font-medium text-blue-900 mb-2">📧 Accountant Email:</p>
              <div className="flex items-center">
                <code className="flex-1 bg-white px-4 py-2 rounded border border-blue-300 text-blue-900 font-mono text-lg">
                  accountant@iamcfo.com
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('accountant@iamcfo.com')
                    alert('Email copied to clipboard!')
                  }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Follow these steps:</h3>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Log in to QuickBooks Online</h4>
                  <p className="text-gray-600">
                    Go to{' '}
                    <a href="https://qbo.intuit.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      qbo.intuit.com
                    </a>{' '}
                    and sign in
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Navigate to Settings</h4>
                  <p className="text-gray-600">
                    Click the ⚙️ gear icon in the top right → <strong>Manage Users</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Invite Accountant</h4>
                  <p className="text-gray-600">
                    Go to the <strong>Accountant</strong> tab → Click <strong>"Invite Accountant"</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Enter Our Email</h4>
                  <p className="text-gray-600">
                    Paste: <code className="bg-gray-100 px-2 py-1 rounded">accountant@iamcfo.com</code>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Select Full Access</h4>
                  <p className="text-gray-600">
                    Choose <strong>"Full Access"</strong> so we can build your complete dashboard
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Send Invitation</h4>
                  <p className="text-gray-600">
                    Click <strong>"Invite"</strong> to send the invitation
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">✅ What Happens Next?</h3>
            <ul className="space-y-2 text-green-800">
              <li>• We'll receive your invitation within minutes</li>
              <li>• Our team will sync your QuickBooks data</li>
              <li>• We'll build your custom dashboard (24-48 hours)</li>
              <li>• You'll receive login credentials via email</li>
            </ul>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you run into any issues or have questions, we're here to help!
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              📅 Schedule Setup Call
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              📧 Email Support
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⏱️ Average setup time: 2 minutes | 🔒 Bank-level security | ✅ SOC 2 compliant</p>
        </div>
      </div>
    </div>
  )
}
