import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get tracking parameters from URL
    const url = new URL(req.url)
    const emailId = url.searchParams.get('eid')
    const candidateId = url.searchParams.get('cid')
    const companyId = url.searchParams.get('coid')
    
    if (!emailId || !candidateId || !companyId) {
      throw new Error('Missing required tracking parameters')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Get IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip')
    const userAgent = req.headers.get('user-agent')

    // Log the email open
    await supabaseClient
      .from('email_tracking_pixels')
      .insert({
        email_id: emailId,
        candidate_id: candidateId,
        company_id: companyId,
        ip_address: ipAddress,
        user_agent: userAgent,
        opened_at: new Date().toISOString()
      })

    // Increment candidate email opens
    await supabaseClient.rpc('increment_email_opens', { candidate_id: candidateId })

    // Increment campaign opened count
    await supabaseClient.rpc('increment_campaign_stat', { 
      email_id: emailId,
      stat_column: 'opened_count'
    })

    // Return a transparent 1x1 pixel GIF
    const transparentPixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3B
    ])

    return new Response(transparentPixel, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error tracking email open:', error)
    
    // Still return a transparent pixel to avoid breaking the email
    const transparentPixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3B
    ])

    return new Response(transparentPixel, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
})