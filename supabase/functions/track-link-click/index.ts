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
    const targetUrl = url.searchParams.get('url')
    const utmSource = url.searchParams.get('utm_source') || 'xact_feedback'
    const utmMedium = url.searchParams.get('utm_medium') || 'email'
    const utmCampaign = url.searchParams.get('utm_campaign') || 'candidate_feedback'
    const utmContent = url.searchParams.get('utm_content') || emailId
    
    if (!emailId || !candidateId || !companyId || !targetUrl) {
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

    // Log the link click
    await supabaseClient
      .from('email_link_clicks')
      .insert({
        email_id: emailId,
        candidate_id: candidateId,
        company_id: companyId,
        link_url: targetUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        ip_address: ipAddress,
        user_agent: userAgent,
        clicked_at: new Date().toISOString()
      })

    // Increment candidate email clicks
    await supabaseClient.rpc('increment_email_clicks', { candidate_id: candidateId })

    // Increment campaign clicked count
    await supabaseClient.rpc('increment_campaign_stat', { 
      email_id: emailId,
      stat_column: 'clicked_count'
    })

    // Check if this is a course link and track enrollment if it is
    const isCourseLink = checkIfCourseLink(targetUrl)
    if (isCourseLink) {
      await supabaseClient.rpc('increment_course_enrollments', { candidate_id: candidateId })
      
      await supabaseClient
        .from('analytics_events')
        .insert({
          company_id: companyId,
          candidate_id: candidateId,
          event_type: 'course_enrollment',
          event_data: {
            email_id: emailId,
            course_url: targetUrl,
            timestamp: new Date().toISOString()
          }
        })
    }

    // Add UTM parameters to the target URL
    const redirectUrl = addUtmParams(targetUrl, {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent
    })

    // Redirect to the target URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error tracking link click:', error)
    
    // Redirect to homepage if there's an error
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': '/',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
})

// Helper function to check if a URL is a course link
function checkIfCourseLink(url: string): boolean {
  const courseProviders = [
    'coursera.org',
    'udemy.com',
    'edx.org',
    'pluralsight.com',
    'linkedin.com/learning',
    'freecodecamp.org',
    'codecademy.com',
    'upgrad.com'
  ]
  
  return courseProviders.some(provider => url.includes(provider))
}

// Helper function to add UTM parameters to a URL
function addUtmParams(url: string, params: Record<string, string>): string {
  const urlObj = new URL(url)
  
  // Add UTM parameters
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })
  
  return urlObj.toString()
}