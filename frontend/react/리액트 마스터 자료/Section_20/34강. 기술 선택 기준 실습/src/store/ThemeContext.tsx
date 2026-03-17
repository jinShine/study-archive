import React, { createContext, useState, useContext } from 'react';
const ThemeContext = createContext<any>(null);
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const toggle = () => setIsDark(!isDark);
  return <ThemeContext.Provider value={{ isDark, toggle }}>{children}</ThemeContext.Provider>;
};
export const useThemeContext = () => useContext(ThemeContext);