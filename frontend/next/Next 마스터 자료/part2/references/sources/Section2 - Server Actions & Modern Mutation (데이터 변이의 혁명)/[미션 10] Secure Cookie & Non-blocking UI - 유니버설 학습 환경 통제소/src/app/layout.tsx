import type { Metadata } from "next";
import "./globals.css";
import { cookies } from 'next/headers';

export const metadata: Metadata = { 
  title: "Korapaduck 학습 통제소", 
  description: "Next.js Security Cookie Architecture" 
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  // 서버가 렌더링되는 찰나에 브라우저의 쿠키를 안전하게 빼냅니다.
  const cookieStore = await cookies();
  const learningMode = cookieStore.get('learningMode')?.value || 'standard';

  const isFocus = learningMode === 'focus';

  // [유연한 접근법] 쿠키 상태에 따라 전체 레이아웃의 접근성(글자 크기, 자간 등)을 제어합니다.
  const textScale = isFocus ? 'text-xl tracking-wide leading-loose' : 'text-base tracking-normal leading-normal';
  const bgTheme = isFocus ? 'bg-amber-50/30' : 'bg-slate-50';

  return (
    <html lang="ko">
      <body className={`antialiased min-h-screen ${bgTheme} transition-colors duration-700 font-sans`}>
        <div className={textScale}>
          {children}
        </div>
      </body>
    </html>
  );
}