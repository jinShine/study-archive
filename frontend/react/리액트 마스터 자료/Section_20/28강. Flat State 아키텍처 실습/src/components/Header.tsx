import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const Header = () => {
  const name = useAuthStore(s => s.username);
  return <header style={{ padding: '20px', background: '#f4f4f4' }}>👤 유저: {name}</header>;
};