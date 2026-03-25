import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = { 
  title: 'Next.js 16 캐시 마스터',
  description: '서버 캐시와 클라이언트 상태 동기화 실습'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="text-gray-900 antialiased bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
