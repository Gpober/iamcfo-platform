'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, MapPin, ChevronRight, Loader2 } from 'lucide-react'

interface LocationAssignment {
  id: string
  locationId: string
  locationName: string
  locationCode?: string | null
  payrollUrl?: string | null
}

const ADMIN_ROLES = ['super_admin', 'admin', 'owner']
const EMPLOYEE_ROLES = ['employee', 'member', 'staff', 'viewer']

export default function MobileEmployeeDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [employeeName, setEmployeeName] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState<string | null>(null)
  const [organizationSubdomain, setOrganizationSubdomain] = useState<string | null>(null)
  const [locations, setLocations] = useState<LocationAssignment[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    async function loadAccess() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData?.session) {
          router.replace('/login')
          return
        }

        const session = sessionData.session

        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            full_name,
            role,
            organizations!inner (
              name,
              subdomain
            ),
            employee_locations:employee_locations (
              id,
              location_id,
              payroll_url,
              locations (
                id,
                name,
                code,
                payroll_form_url,
                mobile_payroll_url
              )
            ),
            employee_location_assignments:employee_location_assignments (
              id,
              location_id,
              payroll_url,
              locations (
                id,
                name,
                code,
                payroll_form_url,
                mobile_payroll_url
              )
            )
          `)
          .eq('id', session.user.id)
          .single()

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user record:', userError)
          if (isMounted) {
            setError('We were unable to load your account. Please try again or contact support.')
            setLoading(false)
          }
          return
        }

        const role = (userRecord as any)?.role || session.user.app_metadata?.role
        if (ADMIN_ROLES.includes(role)) {
          router.replace('/mobile-dashboard/admin')
          return
        }

        if (!EMPLOYEE_ROLES.includes(role)) {
          console.warn('Unknown role attempting to access employee mobile dashboard:', role)
          router.replace('/')
          return
        }

        const organization = (userRecord as any)?.organizations
        if (organization) {
          setOrganizationName(organization.name ?? null)
          setOrganizationSubdomain(organization.subdomain ?? null)
        }

        setEmployeeName((userRecord as any)?.full_name ?? session.user.user_metadata?.full_name ?? session.user.email ?? null)

        const assignments: LocationAssignment[] = []

        const collectAssignments = (records: any[] | undefined) => {
          if (!records) return

          records.forEach((assignment) => {
            const location = assignment?.locations || assignment?.location
            const payrollUrl =
              assignment?.payroll_url ??
              location?.mobile_payroll_url ??
              location?.payroll_form_url ??
              assignment?.mobile_payroll_url ??
              assignment?.payroll_form_url ??
              null

            const locationId = assignment?.location_id ?? location?.id ?? assignment?.id
            const locationName = location?.name ?? assignment?.location_name

            if (!locationId || !locationName) {
              return
            }

            assignments.push({
              id: assignment?.id?.toString() ?? locationId?.toString(),
              locationId: locationId?.toString(),
              locationName,
              locationCode: location?.code ?? assignment?.location_code ?? null,
              payrollUrl,
            })
          })
        }

        collectAssignments((userRecord as any)?.employee_locations)
        collectAssignments((userRecord as any)?.employee_location_assignments)

        if (assignments.length === 0) {
          const metadataLocations = (session.user.user_metadata?.locations as any[]) || []
          metadataLocations.forEach((metaLocation, index) => {
            if (!metaLocation) return
            const locationId = metaLocation?.id ?? metaLocation?.location_id ?? metaLocation?.code ?? `location-${index}`
            const locationName = metaLocation?.name ?? metaLocation?.locationName ?? `Location ${index + 1}`

            assignments.push({
              id: locationId.toString(),
              locationId: locationId.toString(),
              locationName,
              locationCode: metaLocation?.code ?? null,
              payrollUrl:
                metaLocation?.payrollUrl ??
                metaLocation?.mobilePayrollUrl ??
                metaLocation?.payroll_form_url ??
                metaLocation?.mobile_payroll_url ??
                null,
            })
          })
        }

        if (assignments.length === 0) {
          setError('No locations are assigned to your account. Please contact your administrator.')
        } else {
          setLocations(assignments)
        }

        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        console.error('Unexpected error loading mobile dashboard:', err)
        if (isMounted) {
          setError('Something went wrong while loading your payroll access. Please try again.')
          setLoading(false)
        }
      }
    }

    loadAccess()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function handleOpenPayroll(assignment: LocationAssignment) {
    if (assignment.payrollUrl) {
      window.location.href = assignment.payrollUrl
      return
    }

    const fallbackPath = `/mobile-dashboard/payroll?location=${encodeURIComponent(assignment.locationId)}`

    if (organizationSubdomain) {
      window.location.href = `https://${organizationSubdomain}.iamcfo.com${fallbackPath}`
    } else {
      router.push(fallbackPath)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
          Loading your payroll access...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Payroll access</p>
            <h1 className="text-xl font-semibold text-gray-900">
              {employeeName ? `Hi, ${employeeName.split(' ')[0]}` : 'Welcome'}
            </h1>
            {organizationName && (
              <p className="text-sm text-gray-500 mt-1">{organizationName}</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
          >
            <LogOut className="mr-1 h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <main className="px-4 pt-6">
        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select your location below to submit payroll. Access is limited to the locations assigned to your account.
            </p>

            {locations.map((assignment) => (
              <button
                key={`${assignment.id}-${assignment.locationId}`}
                onClick={() => handleOpenPayroll(assignment)}
                className="w-full rounded-xl bg-white border border-gray-200 p-4 shadow-sm flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div>
                  <div className="flex items-center text-gray-900 font-medium">
                    <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                    {assignment.locationName}
                  </div>
                  {assignment.locationCode && (
                    <p className="text-xs text-gray-500 mt-1">Location code: {assignment.locationCode}</p>
                  )}
                  {!assignment.payrollUrl && (
                    <p className="text-xs text-gray-400 mt-2">
                      Payroll link not configured. Tap to continue with default form.
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
