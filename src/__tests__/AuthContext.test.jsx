import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Prevent real HTTP calls from AuthContext.logout()
vi.mock('../api/client', () => ({ default: { post: vi.fn().mockResolvedValue({}) } }));

function Consumer() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <button onClick={() => login({ name: 'Alice', email: 'alice@test.com', provider: 'google' })}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
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

afterEach(() => {
  localStorage.clear();
});

describe('AuthContext', () => {
  it('starts with no user when localStorage is empty', () => {
    render(<AuthProvider><Consumer /></AuthProvider>);
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('login stores user and updates state', async () => {
    render(<AuthProvider><Consumer /></AuthProvider>);
    await act(async () => { screen.getByText('login').click(); });
    expect(screen.getByTestId('user').textContent).toBe('Alice');
    const stored = JSON.parse(localStorage.getItem('yd-user'));
    expect(stored.email).toBe('alice@test.com');
  });

  it('logout clears user and localStorage keys', async () => {
    // yd-token is now an httpOnly cookie managed by the server, not in localStorage
    localStorage.setItem('yd-custom-picture', 'data:img');
    render(<AuthProvider><Consumer /></AuthProvider>);
    await act(async () => { screen.getByText('login').click(); });
    await act(async () => { screen.getByText('logout').click(); });
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('yd-user')).toBeNull();
    expect(localStorage.getItem('yd-custom-picture')).toBeNull();
  });

  it('restores user from localStorage on mount', () => {
    localStorage.setItem('yd-user', JSON.stringify({ name: 'Bob', email: 'bob@test.com', provider: 'google' }));
    render(<AuthProvider><Consumer /></AuthProvider>);
    expect(screen.getByTestId('user').textContent).toBe('Bob');
  });
});
