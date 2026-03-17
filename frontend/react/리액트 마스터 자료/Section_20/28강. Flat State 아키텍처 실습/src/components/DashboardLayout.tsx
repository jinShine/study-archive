import React from 'react';
import { Header } from './Header';

export const DashboardLayout = () => (
  <div>
    <Header />
    <main style={{ padding: '20px' }}>여기는 순수 서버 컴포넌트 영역입니다.</main>
  </div>
);