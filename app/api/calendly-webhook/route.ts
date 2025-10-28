import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📅 [CALENDLY] Webhook received:', body.event);

    // Calendly sends "invitee.created" event when someone books
    if (body.event === 'invitee.created') {
      const payload = body.payload;
      
      const email = payload.email.toLowerCase().trim();
      const name = payload.name || '';
      const [first_name, ...last_name_parts] = name.split(' ');
      const last_name = last_name_parts.join(' ');
      
      const meeting_time = payload.scheduled_event?.start_time;
      const meeting_uri = payload.scheduled_event?.uri;
      
      console.log('📅 [CALENDLY] Booking details:', {
        email,
        name,
        meeting_time,
        meeting_uri
      });

      // Check if prospect exists
      const { data: existing, error: fetchError } = await supabase
        .from('prospects')
        .select('*')
        .ilike('email', email)
        .single();

      if (existing) {
        // Update existing prospect
        console.log('📅 [CALENDLY] Updating existing prospect:', email);
        
        const { error: updateError } = await supabase
          .from('prospects')
          .update({
            demo_booked: true,
            demo_booked_at: new Date().toISOString(),
            first_name: first_name || existing.first_name,
            last_name: last_name || existing.last_name,
            notes: existing.notes 
              ? `${existing.notes}\n\nDemo booked: ${meeting_time}`
              : `Demo booked: ${meeting_time}`
          })
          .eq('email', email);

        if (updateError) {
          console.error('📅 [CALENDLY] Update error:', updateError);
          return NextResponse.json({ 
            error: 'Failed to update prospect' 
          }, { status: 500 });
        }

        console.log('✅ [CALENDLY] Prospect updated');
        
        return NextResponse.json({ 
          success: true,
          action: 'updated',
          email 
        });

      } else {
        // Create new prospect
        console.log('📅 [CALENDLY] Creating new prospect:', email);
        
        const { error: insertError } = await supabase
          .from('prospects')
          .insert({
            email,
            first_name,
            last_name,
            source: 'calendly',
            demo_booked: true,
            demo_booked_at: new Date().toISOString(),
            uses_quickbooks: false, // Unknown at this point
            email_sent: false,
            notes: `Demo booked via Calendly: ${meeting_time}`
          });

        if (insertError) {
          console.error('📅 [CALENDLY] Insert error:', insertError);
          return NextResponse.json({ 
            error: 'Failed to create prospect' 
          }, { status: 500 });
        }

        console.log('✅ [CALENDLY] New prospect created');
        
        return NextResponse.json({ 
          success: true,
          action: 'created',
          email 
        });
      }
    }

    // Other event types
    return NextResponse.json({ 
      success: true,
      message: 'Event received but not processed' 
    });

  } catch (error) {
    console.error('📅 [CALENDLY] Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

// GET endpoint to verify webhook is working
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Calendly webhook endpoint ready',
    endpoint: '/api/calendly-webhook'
  });
}
