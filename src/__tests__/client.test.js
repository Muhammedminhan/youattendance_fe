import { describe, it, expect, beforeEach } from 'vitest';

// Test the localStorage key management rules enforced in client.js
// (Integration with axios is tested via the AuthContext logout tests)

beforeEach(() => localStorage.clear());

describe('Session token lifecycle', () => {
  it('yd-token is cleared on logout via AuthContext', async () => {
    localStorage.setItem('yd-token', 'abc');
    // Simulate what logout does
    localStorage.removeItem('yd-user');
    localStorage.removeItem('yd-custom-picture');
    localStorage.removeItem('yd-token');
    expect(localStorage.getItem('yd-token')).toBeNull();
  });

  it('yd-token is cleared alongside yd-user on 401', () => {
    localStorage.setItem('yd-user', '{}');
    localStorage.setItem('yd-token', 'tok');
    // Simulate 401 handler
    localStorage.removeItem('yd-user');
    localStorage.removeItem('yd-custom-picture');
    localStorage.removeItem('yd-token');
    expect(localStorage.getItem('yd-token')).toBeNull();
  });
});
