import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [state] = useState('Language Active');
  return (
    <LanguageContext.Provider value={{ data: state }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
