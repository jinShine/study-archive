import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "환경 변수 제어 실습" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen p-8 bg-slate-50 flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
