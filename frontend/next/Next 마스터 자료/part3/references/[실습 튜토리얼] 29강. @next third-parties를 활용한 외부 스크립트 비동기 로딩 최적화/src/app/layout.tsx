import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

export const metadata: Metadata = {
  title: "서드파티 최적화 실습",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        {/* 유휴 상태에 안전하게 로드되는 애널리틱스 */}
        <GoogleAnalytics gaId="G-TEST12345" />
      </body>
    </html>
  );
}
