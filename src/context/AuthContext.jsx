import { createContext, useContext, useMemo, useState } from 'react';

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
    const currentUser = user;
    localStorage.removeItem('yd-user');
    localStorage.removeItem('yd-custom-picture');
    localStorage.removeItem('yd-token');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
      if (currentUser?.email) {
        window.google.accounts.id.revoke(currentUser.email, () => {});
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
