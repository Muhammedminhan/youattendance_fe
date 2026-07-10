import { createContext, useContext, useState } from 'react';

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
    localStorage.removeItem('yd-user');
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
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

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, getEffectivePicture }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
