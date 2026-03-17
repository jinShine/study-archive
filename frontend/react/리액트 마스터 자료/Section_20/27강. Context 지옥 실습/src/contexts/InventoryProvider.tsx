import React, { createContext, useContext, useState } from 'react';

const InventoryContext = createContext<any>(null);

export const InventoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [state] = useState('Inventory Active');
  return (
    <InventoryContext.Provider value={{ data: state }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
