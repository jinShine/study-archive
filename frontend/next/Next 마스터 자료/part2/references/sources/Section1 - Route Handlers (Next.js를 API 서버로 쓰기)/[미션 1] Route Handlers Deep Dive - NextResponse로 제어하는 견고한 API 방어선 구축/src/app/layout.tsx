import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 에이전트 통제 센터",
  description: "Next.js 15 API Route 실습",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
