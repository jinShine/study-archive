import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state] = useState('Cart Active');
  return (
    <CartContext.Provider value={{ data: state }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
