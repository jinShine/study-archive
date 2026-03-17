import React, { createContext, useContext, useState } from 'react';

const AnalyticsContext = createContext<any>(null);

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const [state] = useState('Analytics Active');
  return (
    <AnalyticsContext.Provider value={{ data: state }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
