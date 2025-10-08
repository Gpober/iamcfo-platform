import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateUniqueSlug } from '@/lib/utils/slug'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const supabase = createServerSupabaseClient()

      // Extract customer details
      const customerEmail = session.customer_details?.email
      const customerName = session.customer_details?.name || 'Unknown'
      const companyName = (session.metadata?.company_name as string) || customerName

      if (!customerEmail) {
        throw new Error('No customer email found')
      }

      // Generate unique slug for the organization
      const slug = await generateUniqueSlug(companyName, supabase)

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: companyName,
          slug: slug,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan: (session.metadata?.plan as string) || 'professional',
        })
        .select()
        .single()

      if (orgError) throw orgError

      console.log('Organization created:', org)

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
