import React, { createContext, useContext, useState } from 'react';

const UserPreferenceContext = createContext<any>(null);

export const UserPreferenceProvider = ({ children }: { children: React.ReactNode }) => {
  const [state] = useState('UserPreference Active');
  return (
    <UserPreferenceContext.Provider value={{ data: state }}>
      {children}
    </UserPreferenceContext.Provider>
  );
};

export const useUserPreference = () => useContext(UserPreferenceContext);
