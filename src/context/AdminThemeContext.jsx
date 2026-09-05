import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'admin-theme';
const THEMES = ['light', 'dark'];

const AdminThemeContext = createContext(null);

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'light';
  } catch {
    return 'light';
  }
};

/** Sync theme class to html/body for Tailwind dark: + toast styling */
const applyThemeToDocument = (isDark) => {
  document.documentElement.classList.toggle('dark', isDark);
  document.body.classList.toggle('admin-theme-dark', isDark);
  document.documentElement.dataset.adminTheme = isDark ? 'dark' : 'light';
};

export const AdminThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readStoredTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
    applyThemeToDocument(isDark);
    return () => applyThemeToDocument(false);
  }, [theme, isDark]);

  const setLightTheme = useCallback(() => setTheme('light'), []);
  const setDarkTheme = useCallback(() => setTheme('dark'), []);
  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    []
  );

  const value = useMemo(
    () => ({ theme, isDark, setTheme, setLightTheme, setDarkTheme, toggleTheme }),
    [theme, isDark, setLightTheme, setDarkTheme, toggleTheme]
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <div className={`admin-shell min-h-full transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return ctx;
};

export default AdminThemeContext;
