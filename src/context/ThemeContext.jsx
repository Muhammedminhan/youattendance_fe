import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isLight, setIsLight] = useState(() => {
    const stored = localStorage.getItem('yd-theme');
    return stored === 'light';
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('yd-theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  function toggleTheme() {
    setIsLight((prev) => !prev);
  }

  return (
    <ThemeContext.Provider value={{ isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
