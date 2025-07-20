import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabaseClient';

const CAMPAIGN_ID = 'test-campaign-id'; // Replace with a valid campaign_id for your test
const TRACK_OPEN_URL = `/functions/track_open?fid=${CAMPAIGN_ID}`;
const TRACK_CLICK_URL = `/functions/track_click?fid=${CAMPAIGN_ID}&link=https://example.com`;

async function getBaseUrl() {
  // Use VITE_SUPABASE_URL or SUPABASE_URL
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
}

describe('Tracking Functions', () => {
  it('GET /functions/track_open updates opened_at in DB', async () => {
    const baseUrl = await getBaseUrl();
    const res = await fetch(baseUrl + TRACK_OPEN_URL);
    expect(res.ok).toBe(true);
    // Check DB for opened_at
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('opened_at')
      .eq('id', CAMPAIGN_ID)
      .single();
    expect(error).toBeNull();
    expect(data.opened_at).toBeDefined();
  });

  it('GET /functions/track_click updates clicked_at and returns 302', async () => {
    const baseUrl = await getBaseUrl();
    const res = await fetch(baseUrl + TRACK_CLICK_URL, { redirect: 'manual' });
    expect(res.status).toBe(302);
    // Check DB for clicked_at
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('clicked_at')
      .eq('id', CAMPAIGN_ID)
      .single();
    expect(error).toBeNull();
    expect(data.clicked_at).toBeDefined();
  });
});
