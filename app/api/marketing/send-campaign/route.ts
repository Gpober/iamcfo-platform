// src/app/api/marketing/send-campaign/route.ts
// I AM CFO - Automated Email Campaign System
// Sends industry-specific emails to prospects using SendGrid

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Email templates by sequence step
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

// Send email via SendGrid
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
    // Initialize Supabase client at runtime (not build time)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const CRON_SECRET = process.env.CRON_SECRET;
    
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { batch_size, hours_between_emails, specific_email } = body;
    
    // NEW: Handle single specific email
    if (specific_email) {
      console.log(`📧 Sending single email to: ${specific_email}`);
      
      const { data: prospect, error: fetchError } = await supabase
        .from('prospects')
        .select('*')
        .eq('email', specific_email.toLowerCase())
        .single();

      if (fetchError || !prospect) {
        return NextResponse.json({ 
          error: 'Prospect not found',
          sent: 0 
        }, { status: 404 });
      }

      // Determine next email
      const nextEmailNumber = prospect.sequence_step + 1;
      
      if (nextEmailNumber > 3) {
        return NextResponse.json({ 
          error: 'Prospect has already received all 3 emails',
          sent: 0
        }, { status: 400 });
      }

      const template = EMAIL_TEMPLATES[nextEmailNumber];
      
      if (!template) {
        return NextResponse.json({ 
          error: `No template for email ${nextEmailNumber}`,
          sent: 0
        }, { status: 400 });
      }

      try {
        // Personalize and send
        const subject = personalizeEmail(template.subject, prospect);
        const emailBody = personalizeEmail(template.body, prospect);
        
        await sendEmail(prospect.email, subject, emailBody);
        
        // Update database
        await supabase
          .from('prospects')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            sequence_step: nextEmailNumber,
          })
          .eq('id', prospect.id);

        console.log(`✅ Sent Email ${nextEmailNumber} to ${specific_email}`);

        return NextResponse.json({
          message: `Email ${nextEmailNumber} sent successfully`,
          sent: 1,
          failed: 0,
          email: specific_email,
          email_number: nextEmailNumber
        });
        
      } catch (error) {
        console.error(`❌ Failed to send to ${specific_email}:`, error);
        return NextResponse.json({ 
          error: error instanceof Error ? error.message : 'Failed to send',
          sent: 0,
          failed: 1
        }, { status: 500 });
      }
    }
    
    // ORIGINAL: Handle batch campaign
    const batchSize = batch_size || parseInt(process.env.BATCH_SIZE || '50');
    const hoursBetween = hours_between_emails || parseInt(process.env.HOURS_BETWEEN_EMAILS || '48');

    // Calculate cutoff time for next email
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursBetween);

    // Get prospects ready for next email
    const { data: prospects, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .eq('source', 'xendoo-list')
      .lt('sequence_step', 3) // Send max 3 emails
      .or(`email_sent.eq.false,email_sent_at.lt.${cutoffTime.toISOString()}`)
      .order('email_sent_at', { ascending: true, nullsFirst: true })
      .limit(batchSize);

    if (fetchError) {
      console.error('Error fetching prospects:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!prospects || prospects.length === 0) {
      return NextResponse.json({ 
        message: 'No prospects ready for email',
        sent: 0,
        next_batch_in_hours: hoursBetween
      });
    }

    console.log(`Processing ${prospects.length} prospects...`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send emails
    for (const prospect of prospects) {
      try {
        // Determine which email to send (1, 2, or 3)
        const nextEmailNumber = prospect.sequence_step + 1;
        const template = EMAIL_TEMPLATES[nextEmailNumber];
        
        if (!template) {
          console.log(`No template for sequence step ${nextEmailNumber}`);
          continue;
        }

        // Personalize email
        const subject = personalizeEmail(template.subject, prospect);
        const emailBody = personalizeEmail(template.body, prospect);

        // Send email
        await sendEmail(prospect.email, subject, emailBody);

        // Update prospect record
        await supabase
          .from('prospects')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            sequence_step: nextEmailNumber,
          })
          .eq('id', prospect.id);

        results.sent++;
        console.log(`✓ Sent Email ${nextEmailNumber} to ${prospect.email} (${prospect.industry})`);

        // Rate limiting - wait 200ms between sends
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${prospect.email}: ${errorMessage}`);
        console.error(`✗ Failed to send to ${prospect.email}:`, errorMessage);
      }
    }

    return NextResponse.json({
      message: `Campaign batch completed`,
      sent: results.sent,
      failed: results.failed,
      total_processed: prospects.length,
      next_batch_in_hours: hoursBetween,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
    
  } catch (error) {
    console.error('Campaign send error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'I AM CFO Email Campaign API',
    status: 'ready',
    endpoints: {
      'POST /api/marketing/send-campaign': 'Send batch of campaign emails',
      'POST with specific_email': 'Send to single prospect'
    },
    config: {
      batch_size: process.env.BATCH_SIZE || '50',
      hours_between_emails: process.env.HOURS_BETWEEN_EMAILS || '48',
      sender: process.env.SENDER_EMAIL || 'gpober@iamcfo.com',
    }
  });
}
