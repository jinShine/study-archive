import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "번들 최적화 실습",
  description: "Next.js 번들 사이즈 시각화 및 최적화 튜토리얼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
