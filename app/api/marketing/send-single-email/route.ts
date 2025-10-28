// app/api/marketing/send-single-email/route.ts
// Send campaign email to a single specific prospect

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EMAIL_TEMPLATE = {
  subject: "QB showing cash dropped $28K... but why?",
  body: `Hi there,

Your QuickBooks says cash dropped $28K last month.

But it doesn't tell you:
• WHY it dropped
• WHERE the money went  
• WHAT to do about it

That's the problem with QuickBooks - it shows you WHAT happened, but never WHY.

I AM CFO turns your QB data into answers you can act on:
→ Real-time dashboards that update hourly
→ AI that answers "why did cash drop?" instantly
→ Alerts when something needs your attention

Most of our clients are $2M-10M businesses using QuickBooks or Xero. They keep their bookkeeper for compliance, and use us for intelligence.

Worth a 15-min look?

[Book a quick demo](https://info.iamcfo.com)

Best,
Greg Pober
Founder, I AM CFO
P: 954-257-2856
https://info.iamcfo.com

P.S. We just helped a $5M company discover they were losing $4K/month in duplicate vendor payments. QuickBooks showed the payments, but didn't flag the duplicates. Took us 10 minutes to find.`
};

async function sendEmail(to: string, subject: string, body: string) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  const htmlBody = body
    .replace(/\n/g, '<br>')
    .replace(/→/g, '&rarr;')
    .replace(/•/g, '&bull;');

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject: subject
      }],
      from: {
        email: process.env.SENDER_EMAIL || 'gpober@iamcfo.com',
        name: process.env.SENDER_NAME || 'Greg Pober'
      },
      content: [{
        type: 'text/html',
        value: htmlBody
      }],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true }
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid error: ${response.status}`);
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the prospect
    const { data: prospect } = await supabase
      .from('prospects')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    // Send email
    await sendEmail(email, EMAIL_TEMPLATE.subject, EMAIL_TEMPLATE.body);

    // Update database
    await supabase
      .from('prospects')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        sequence_step: 1
      })
      .eq('email', email.toLowerCase());

    console.log(`✅ Campaign email sent to ${email}`);

    return NextResponse.json({
      success: true,
      sent: 1,
      email: email
    });

  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Single Email Sender',
    status: 'ready'
  });
}
