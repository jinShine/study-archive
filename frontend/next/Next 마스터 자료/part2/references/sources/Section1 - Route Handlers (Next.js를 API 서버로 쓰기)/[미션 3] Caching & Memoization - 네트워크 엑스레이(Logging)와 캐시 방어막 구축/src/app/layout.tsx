import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "성능 통제 센터",
  description: "Next.js 15 Logging & Caching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}