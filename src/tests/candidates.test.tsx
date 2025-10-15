import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { supabase } from '../lib/supabaseClient';
import { CandidatesPage } from '../pages/candidates/CandidatesPage';

const TEST_USER_EMAIL = 'info@camcess.com';
const TEST_USER_PASSWORD = 'kyoya123';
const TEST_CANDIDATE = {
  name: 'Test Candidate',
  email: 'test.candidate@example.com',
  company_id: 'test-company-id', // Replace with a valid company_id for your test user
};

describe('CandidatesPage', () => {  beforeAll(async () => {
    // Sign in test user
    const { error } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    if (error) throw error;
    // Insert candidate
    await supabase.from('candidates').insert([TEST_CANDIDATE]);
  });

  it('renders new candidate in table', async () => {
    render(<CandidatesPage />);
    await waitFor(() => {
      expect(screen.getByText(TEST_CANDIDATE.name)).toBeInTheDocument();
      expect(screen.getByText(TEST_CANDIDATE.email)).toBeInTheDocument();
    });
  });
});
