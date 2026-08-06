import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SearchCtx = createContext(null);

export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openSearch  = useCallback(() => setOpen(true),  []);
  const closeSearch = useCallback(() => setOpen(false), []);
  const toggleSearch = useCallback(() => setOpen(o => !o), []);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape') closeSearch();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggleSearch, closeSearch]);

  return (
    <SearchCtx.Provider value={{ open, openSearch, closeSearch }}>
      {children}
    </SearchCtx.Provider>
  );
}

export function useSearch() {
  return useContext(SearchCtx);
}
