import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabaseClient';

const DUMMY_CANDIDATE_ID = 'dummy-candidate-id';
const DUMMY_JOB_DESCRIPTION = 'Software Engineer, React, Node.js';

async function callGenerateFeedback(candidate_id: string, job_description: string) {
  const { data, error } = await supabase.functions.invoke('generate_feedback', {
    body: JSON.stringify({ candidate_id, job_description })
  });
  if (error) throw error;
  return data;
}

describe('generate_feedback Edge Function', () => {
  it('returns feedback_id and non-empty summary, and row exists in feedback table', async () => {
    const response = await callGenerateFeedback(DUMMY_CANDIDATE_ID, DUMMY_JOB_DESCRIPTION);
    expect(response).toHaveProperty('feedback_id');
    expect(response.summary).toBeDefined();
    expect(response.summary).not.toBe('');

    // Query feedback table for the new row
    const { data: feedbackRows, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', response.feedback_id);
    expect(error).toBeNull();
    expect(feedbackRows).toBeDefined();
    expect(feedbackRows.length).toBe(1);
    expect(feedbackRows[0].summary).toBe(response.summary);
  });
});
