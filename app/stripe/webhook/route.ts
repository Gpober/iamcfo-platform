import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/client'
import { generateUniqueSlug, generateSubdomain } from '@/lib/utils/slug'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

/**
 * Stripe Webhook Handler
 * Handles payment events and creates organizations
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Extract metadata from checkout session
      const customerEmail = session.customer_email
      const companyName = session.metadata?.company_name
      const plan = session.metadata?.plan || 'professional'

      if (!customerEmail || !companyName) {
        console.error('Missing required metadata:', { customerEmail, companyName })
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Generate unique slug
      const slug = await generateUniqueSlug(companyName)
      const subdomain = generateSubdomain(slug)

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: companyName,
          slug,
          subdomain,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan,
          setup_fee_waived: true,
        })
        .select()
        .single()

      if (orgError) {
        console.error('Error creating organization:', orgError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      console.log('Organization created:', org)

      // Note: User will be linked to org during signup
      // Store org_id in session metadata for signup flow

      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      // Update organization subscription status
      const { error } = await supabase
        .from('organizations')
        .update({
          stripe_subscription_id: subscription.id,
          // Add subscription_status if you want to track active/canceled
        })
        .eq('stripe_customer_id', subscription.customer as string)

      if (error) {
        console.error('Error updating subscription:', error)
      }

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
