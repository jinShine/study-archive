import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Next.js 마스터 클래스 2026',
  description: 'TanStack Query v5 완벽 연동 가이드',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}