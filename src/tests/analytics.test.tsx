import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';

// Mock supabase client
jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { totalCandidates: 42, totalFeedback: 17, totalClicks: 5 },
            error: null,
          })
        }))
      }))
    }))
  }
}));

describe('AnalyticsPage', () => {
  it('renders chart labels matching mock counts', async () => {
    render(<AnalyticsPage />);
    expect(await screen.findByText(/42/)).toBeInTheDocument(); // totalCandidates
    expect(await screen.findByText(/17/)).toBeInTheDocument(); // totalFeedback
    expect(await screen.findByText(/5/)).toBeInTheDocument();  // totalClicks
  });
});
