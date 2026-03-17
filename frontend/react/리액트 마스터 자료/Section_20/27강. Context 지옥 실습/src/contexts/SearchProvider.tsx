import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext<any>(null);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [state] = useState('Search Active');
  return (
    <SearchContext.Provider value={{ data: state }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
