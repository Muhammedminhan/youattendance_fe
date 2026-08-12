import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Login from '../pages/Login';

function Wrapper({ children }) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  window.google = {
    accounts: {
      id: {
        initialize: vi.fn(),
        renderButton: vi.fn(),
        prompt: vi.fn(),
        disableAutoSelect: vi.fn(),
        revoke: vi.fn(),
      },
    },
  };
});

describe('Login page', () => {
  it('renders the welcome heading', () => {
    render(<Login />, { wrapper: Wrapper });
    expect(screen.getByText('Welcome back')).toBeTruthy();
  });

  it('renders the Google sign-in button', () => {
    render(<Login />, { wrapper: Wrapper });
    expect(screen.getByText(/Continue with Google/i)).toBeTruthy();
  });

  it('does not render demo button (removed)', () => {
    render(<Login />, { wrapper: Wrapper });
    expect(screen.queryByText(/demo/i)).toBeNull();
  });

  it('shows Live Dashboard feature', () => {
    render(<Login />, { wrapper: Wrapper });
    expect(screen.getByText('Live Dashboard')).toBeTruthy();
  });
});
