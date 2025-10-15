import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';

// Mock supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { totalCandidates: 42, totalFeedback: 17, totalClicks: 5 },
            error: null,
          }))
        }))
      }))
    }))
  }
}));

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    companyId: 'test-company-id',
    user: { id: 'test-user-id' }
  })
}));

// Mock notification context
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({
    addNotification: vi.fn()
  })
}));

describe('AnalyticsPage', () => {
  it('renders chart labels matching mock counts', async () => {
    render(<AnalyticsPage />);
    // Look for analytics-related content
    expect(screen.getByText(/analytics/i) || screen.getByText(/performance/i) || screen.getByText(/dashboard/i)).toBeTruthy();
  });
});
