import React from 'react';
import { MainLayout } from './components/MainLayout';
import { AuthProvider } from './contexts/AuthProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import { CartProvider } from './contexts/CartProvider';
import { NotificationProvider } from './contexts/NotificationProvider';
import { ModalProvider } from './contexts/ModalProvider';
import { LanguageProvider } from './contexts/LanguageProvider';
import { SearchProvider } from './contexts/SearchProvider';
import { UserPreferenceProvider } from './contexts/UserPreferenceProvider';
import { AnalyticsProvider } from './contexts/AnalyticsProvider';
import { InventoryProvider } from './contexts/InventoryProvider';

export default function App() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🚨 27강. Context 지옥 체험</h1>
      <p>아래 구조는 10겹의 Provider로 감싸져 있습니다.</p>
      <AuthProvider>
        <ThemeProvider>
        <CartProvider>
        <NotificationProvider>
        <ModalProvider>
        <LanguageProvider>
        <SearchProvider>
        <UserPreferenceProvider>
        <AnalyticsProvider>
        <InventoryProvider>
        <MainLayout />
      </InventoryProvider>
      </AnalyticsProvider>
      </UserPreferenceProvider>
      </SearchProvider>
      </LanguageProvider>
      </ModalProvider>
      </NotificationProvider>
      </CartProvider>
      </ThemeProvider>
      </AuthProvider>
    </div>
  );
}