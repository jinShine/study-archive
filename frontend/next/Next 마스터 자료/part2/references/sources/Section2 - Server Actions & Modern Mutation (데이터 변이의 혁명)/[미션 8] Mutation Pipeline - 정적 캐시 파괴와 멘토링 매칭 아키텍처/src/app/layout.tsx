import type { Metadata } from "next";
import "./globals.css";

// [SEO 최적화] 서버에서 <head> 태그를 미리 조립하여 크롤러에게 제공합니다.
export const metadata: Metadata = { 
  title: "Korapaduck 멘토링 시스템", 
  description: "Next.js Mutation Architecture" 
};

// [시스템 뼈대] 화면이 이동(redirect)해도 이 뼈대는 유지되며 {children}만 교체됩니다.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}