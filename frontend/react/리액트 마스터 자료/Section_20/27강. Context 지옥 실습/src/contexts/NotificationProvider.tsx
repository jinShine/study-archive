import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state] = useState('Notification Active');
  return (
    <NotificationContext.Provider value={{ data: state }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
