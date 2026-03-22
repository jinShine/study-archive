import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { 
  title: "Korapaduck Portal", 
  description: "Next.js 16 Parallel Routes Architecture" 
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen font-sans bg-slate-100">
        {children}
      </body>
    </html>
  );
}