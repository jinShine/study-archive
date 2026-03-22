import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { 
  title: "Korapaduck PPR Dashboard", 
  description: "Next.js 16 Partial Prerendering Architecture" 
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}