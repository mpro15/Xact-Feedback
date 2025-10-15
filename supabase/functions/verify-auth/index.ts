import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    // For local development, use default values if environment variables are not set
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH--qQwv8Hdp7fsn3W0YpN81IU';
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET') ?? 'super-secret-jwt-token-with-at-least-32-characters-long';

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasJwtSecret: !!jwtSecret
    });

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    let payload;
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(jwtSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      
      payload = await verify(token, key);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JWT token', details: error.message }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user exists and is active
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(payload.sub);
    
    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'User not found or inactive' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user is confirmed
    if (!user.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: 'Email not verified' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user's company and role information
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        companies (*)
      `)
      .eq('id', user.user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return verified user information
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.user.id,
          email: user.user.email,
          name: userProfile.name,
          role: userProfile.role || 'user',
          company_id: userProfile.company_id,
          company: userProfile.companies,
          is_onboarded: userProfile.is_onboarded,
          is_approved: userProfile.is_approved,
          permissions: {
            can_manage_users: userProfile.role === 'admin',
            can_access_analytics: userProfile.role === 'admin' || userProfile.role === 'manager',
            can_send_feedback: userProfile.is_approved,
            can_view_reports: userProfile.is_approved
          }
        },
        session: {
          expires_at: payload.exp,
          issued_at: payload.iat,
          token_type: 'JWT'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Authentication verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal authentication error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
