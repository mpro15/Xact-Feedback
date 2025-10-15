import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPage } from '../pages/settings/SettingsPage';

const mockSelect = vi.fn(() => Promise.resolve({
  data: [{ smtp_host: 'smtp.example.com', smtp_port: 587, smtp_user: 'user', smtp_pass: 'pass' }],
  error: null,
}));
const mockUpdate = vi.fn(() => Promise.resolve({ data: [{}], error: null }));

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
      eq: vi.fn(() => ({ select: mockSelect, update: mockUpdate })),
    })),
  },
}));

describe('SettingsPage SMTP', () => {
  it('renders, edits SMTP fields, and saves new config', async () => {
    render(<SettingsPage />);
    // Wait for fields to appear
    expect(await screen.findByDisplayValue('smtp.example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('587')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pass')).toBeInTheDocument();

    // Edit fields
    fireEvent.change(screen.getByLabelText(/SMTP Host/i), { target: { value: 'smtp.new.com' } });
    fireEvent.change(screen.getByLabelText(/SMTP Port/i), { target: { value: '465' } });
    fireEvent.change(screen.getByLabelText(/SMTP User/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/SMTP Password/i), { target: { value: 'newpass' } });

    // Click Save
    fireEvent.click(screen.getByText(/Save/i));

    // Assert update called with new values
    expect(mockUpdate).toHaveBeenCalledWith({
      smtp_host: 'smtp.new.com',
      smtp_port: '465',
      smtp_user: 'newuser',
      smtp_pass: 'newpass',
    });
  });
});
