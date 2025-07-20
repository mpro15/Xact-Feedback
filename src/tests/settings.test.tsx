import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from '../pages/settings/SettingsPage';

const mockSelect = jest.fn(() => Promise.resolve({
  data: [{ smtp_host: 'smtp.example.com', smtp_port: 587, smtp_user: 'user', smtp_pass: 'pass' }],
  error: null,
}));
const mockUpdate = jest.fn(() => Promise.resolve({ data: [{}], error: null }));

jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
      eq: jest.fn(() => ({ select: mockSelect, update: mockUpdate })),
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
