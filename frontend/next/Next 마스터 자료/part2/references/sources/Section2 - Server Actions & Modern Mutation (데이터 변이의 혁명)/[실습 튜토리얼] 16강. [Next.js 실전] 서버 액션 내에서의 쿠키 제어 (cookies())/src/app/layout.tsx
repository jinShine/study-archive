// src/app/layout.tsx
import "./globals.css";
// 서버 컴포넌트에서도 쿠키를 읽어오기 위한 모듈
import { cookies } from 'next/headers';

export const metadata = { title: "쿠키 제어 통제소" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 브라우저가 접속할 때 동봉해 보낸 쿠키를 서버에서 즉시 파싱합니다.
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || 'light';

  // 읽어온 쿠키 값에 따라 Tailwind 클래스를 동적으로 결정합니다.
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  const headerClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-[#38bdf8]' : 'text-[#0070f3]';

  return (
    <html lang="ko">
      <body className={`${bgClass} m-0 font-sans transition-colors duration-500`}>
        <header className={`p-5 border-b shadow-sm flex items-center justify-between transition-colors duration-500 ${headerClass}`}>
          <h2 className={`m-0 font-bold text-xl ${textClass}`}>ARCHITECT CONTROL CENTER</h2>
        </header>
        <main className="p-10 flex flex-col items-center justify-center min-h-[80vh]">
          {children}
        </main>
      </body>
    </html>
  );
}