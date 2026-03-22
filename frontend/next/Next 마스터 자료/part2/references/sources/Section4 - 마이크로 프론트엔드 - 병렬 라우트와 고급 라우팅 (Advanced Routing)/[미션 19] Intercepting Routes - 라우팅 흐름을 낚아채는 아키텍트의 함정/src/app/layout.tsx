import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "라우팅 흐름 통제소",
  description: "Next.js Intercepting Routes Architecture"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}