'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Separate component that uses useSearchParams
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Login failed. Please try again.')
        setLoading(false)
        return
      }

      // Step 2: Get user's role and organization
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, organizations(subdomain)')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        // If can't fetch user data, check if admin by email
        const adminEmails = ['gpober@iamcfo.com']
        if (adminEmails.includes(email)) {
          router.push('/admin')
        } else {
          setError('Unable to determine account type. Please contact support.')
          setLoading(false)
        }
        return
      }

      const subdomain = (userData as any)?.organizations?.subdomain
      const role = userData?.role
      const adminEmails = ['gpober@iamcfo.com']
      const isSuperAdmin = role === 'super_admin' || adminEmails.includes(email)

      // ✅ Check for returnTo parameter (from client subdomain redirect)
      const returnTo = searchParams.get('returnTo')

      if (returnTo && isSuperAdmin) {
        // Super admin accessing a client subdomain
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token && session?.refresh_token) {
          const params = new URLSearchParams({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at?.toString() || '',
            token_type: 'bearer',
            super_admin: 'true', // Flag for client subdomain to recognize super admin
          })
          
          // Return to the client subdomain they were trying to access
          window.location.href = `${returnTo}#${params.toString()}`
          return
        }
      }

      // Step 3: Redirect based on role - WITH MOBILE DETECTION
      if (isSuperAdmin) {
        // Detect if mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        
        // Super admin - go to appropriate admin panel
        if (isMobile) {
          console.log('🔐 Super admin (mobile) - redirecting to /mobile-dashboard/admin')
          router.push('/mobile-dashboard/admin')
        } else {
          console.log('🔐 Super admin (desktop) - redirecting to /admin')
          router.push('/admin')
        }
      } else if (subdomain) {
        // Regular user - redirect to their organization's subdomain
        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        const destinationPath = isMobileDevice ? 'mobile-dashboard' : 'dashboard'

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.access_token && session?.refresh_token) {
          const params = new URLSearchParams({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at?.toString() || '',
            token_type: 'bearer',
          })

          // Redirect with session in URL hash
          window.location.href = `https://${subdomain}.iamcfo.com/${destinationPath}#${params.toString()}`
        } else {
          // Fallback if session tokens not available
          window.location.href = `https://${subdomain}.iamcfo.com/${destinationPath}`
        }
      } else {
        // User has no organization - shouldn't happen, but handle it
        setError('No organization found for your account. Please contact support.')
        await supabase.auth.signOut()
        setLoading(false)
      }

    } catch (err: any) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Don't have an account?{' '}
              <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/images/logo.png"
          alt="I AM CFO"
        />
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
