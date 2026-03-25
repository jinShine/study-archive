import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Next.js prefetchQuery 튜토리얼',
  description: '서버 컴포넌트에서 데이터 미리 가져오기',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}