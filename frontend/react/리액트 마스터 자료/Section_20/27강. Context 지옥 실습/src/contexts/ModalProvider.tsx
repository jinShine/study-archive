import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext<any>(null);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [state] = useState('Modal Active');
  return (
    <ModalContext.Provider value={{ data: state }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
