import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('yd-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(userData) {
    const customPic = localStorage.getItem('yd-custom-picture');
    if (customPic) userData = { ...userData, picture: customPic };
    localStorage.setItem('yd-user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    // Ask the server to clear the httpOnly yd_token cookie (fire and forget)
    api.post('/v1/auth/logout/').catch(() => {});
    localStorage.removeItem('yd-user');
    localStorage.removeItem('yd-custom-picture');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
      if (user?.email) {
        window.google.accounts.id.revoke(user.email, () => {});
      }
    }
    setUser(null);
  }

  function updateUser(userData) {
    localStorage.setItem('yd-user', JSON.stringify(userData));
    setUser(userData);
  }

  function getEffectivePicture() {
    return localStorage.getItem('yd-custom-picture') || (user && user.picture) || '';
  }

  const value = useMemo(
    () => ({ user, login, logout, updateUser, getEffectivePicture }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
