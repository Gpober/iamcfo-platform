// app/api/marketing/send-single-email/route.ts
// Send campaign email to a single specific prospect

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Email templates by sequence step (SAME AS CAMPAIGN)
const EMAIL_TEMPLATES: Record<number, { subject: string; body: string }> = {
  1: {
    subject: "QB showing cash dropped $28K... but why?",
    body: `Hi {{first_name}},

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

Most of our clients are {{revenue_estimate}} businesses using QuickBooks or Xero. They keep their bookkeeper for compliance, and use us for intelligence.

Worth a 15-min look?

[Book a quick demo](https://info.iamcfo.com)

Best,
Greg Pober
Founder, I AM CFO
P: {{phone}}
https://info.iamcfo.com

P.S. We just helped a {{revenue_estimate}} {{industry}} company discover they were losing $4K/month in duplicate vendor payments. QuickBooks showed the payments, but didn't flag the duplicates. Took us 10 minutes to find.`
  },
  2: {
    subject: "Can you answer these 3 questions right now?",
    body: `{{first_name}},

Without opening QuickBooks or calling your bookkeeper, can you tell me:

1. How much cash do you have available TODAY (not last week)?
2. Which customer owes you the most money and how overdue are they?
3. What was your revenue this week vs. last week?

If you can't answer those in 30 seconds, you're flying blind.

QuickBooks gives you data. I AM CFO gives you intelligence.

→ See your numbers in real-time (updates hourly)
→ Ask the AI: "What's my runway?" - Get instant answers
→ Click any number to see the detail (no waiting for reports)
→ Get alerts when cash is low or A/R is aging

Most {{revenue_estimate}} businesses pay $300-600/month for bookkeeping that tells them what happened 2-3 weeks ago.

I AM CFO costs $699/month and shows you what's happening RIGHT NOW.

Want to see it with your actual QuickBooks data?

[Book 15-min demo](https://info.iamcfo.com)

Greg Pober
Founder, I AM CFO
P: {{phone}}
https://info.iamcfo.com`
  },
  3: {
    subject: "Your books are up to date. Your decisions aren't.",
    body: `{{first_name}},

Here's the problem:

Your bookkeeper closes September on October 15th.

But you're making hiring decisions, pricing decisions, and cash flow decisions in October... based on September data.

That 2-3 week lag is costing you more than you think.

**I AM CFO syncs with QuickBooks every hour:**

✓ See today's cash position (not last week's)
✓ Check A/R aging in real-time (catch collection issues early)  
✓ Compare this week's revenue to last week (spot trends immediately)
✓ Ask AI: "Can I afford to hire someone at $80K?" (get instant answers)

You're already paying $300-600/month for historical data.

$699/month gets you real-time intelligence.

**The difference:**
→ Catch the cash problem before it becomes a crisis
→ See the A/R aging before accounts hit 90 days
→ Make decisions with current data, not outdated reports

Most of our clients are {{revenue_estimate}} {{industry}} companies. They keep their bookkeeper for compliance. They use us to actually run the business.

Worth a look?

[See it live](https://info.iamcfo.com)

Best,
Greg Pober
Founder, I AM CFO  
P: {{phone}}
https://info.iamcfo.com

P.S. This is my last email. If you're happy with 2-3 week old financial data, ignore this. But if you've ever thought "I wish I could just SEE my numbers in real-time," that's exactly what I built.`
  }
};

// Personalize email template
function personalizeEmail(template: string, prospect: any): string {
  return template
    .replace(/{{first_name}}/g, prospect.first_name || 'there')
    .replace(/{{company}}/g, prospect.company || 'your company')
    .replace(/{{revenue_estimate}}/g, prospect.revenue_estimate || '$2M-10M')
    .replace(/{{industry}}/g, prospect.industry || 'business')
    .replace(/{{phone}}/g, process.env.SENDER_PHONE || '954-257-2856');
}

async function sendEmail(to: string, subject: string, body: string) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  const htmlBody = body
    .replace(/\n/g, '<br>')
    .replace(/→/g, '&rarr;')
    .replace(/✓/g, '&#10003;')
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
      },
      mail_settings: {
        footer: {
          enable: true,
          html: `<br><br><small style="color: #666;">I AM CFO | Real-time financial intelligence for growing businesses<br>
          <a href="https://info.iamcfo.com/unsubscribe?email=${encodeURIComponent(to)}">Unsubscribe</a></small>`
        }
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
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
    const { data: prospect, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !prospect) {
      return NextResponse.json(
        { error: 'Prospect not found in database' },
        { status: 404 }
      );
    }

    // Determine which email to send (next in sequence)
    const nextEmailNumber = prospect.sequence_step + 1;
    
    if (nextEmailNumber > 3) {
      return NextResponse.json(
        { error: 'Prospect has already received all 3 emails' },
        { status: 400 }
      );
    }

    const template = EMAIL_TEMPLATES[nextEmailNumber];
    
    if (!template) {
      return NextResponse.json(
        { error: `No template for email ${nextEmailNumber}` },
        { status: 400 }
      );
    }

    // Personalize email
    const subject = personalizeEmail(template.subject, prospect);
    const body = personalizeEmail(template.body, prospect);

    // Send email
    await sendEmail(prospect.email, subject, body);

    // Update database
    await supabase
      .from('prospects')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        sequence_step: nextEmailNumber
      })
      .eq('email', email.toLowerCase());

    console.log(`✅ Sent Email ${nextEmailNumber} to ${email}`);

    return NextResponse.json({
      success: true,
      sent: 1,
      email: email,
      email_number: nextEmailNumber,
      subject: subject
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
    status: 'ready',
    note: 'Sends the next email in the sequence (1, 2, or 3)'
  });
}
