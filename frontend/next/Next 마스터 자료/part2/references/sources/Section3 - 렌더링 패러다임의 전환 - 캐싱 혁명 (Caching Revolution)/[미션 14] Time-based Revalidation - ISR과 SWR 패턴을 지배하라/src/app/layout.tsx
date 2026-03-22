import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { 
  title: "Global Exchange ISR", 
  description: "Next.js 15 ISR & SWR Architecture" 
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen font-sans bg-slate-900">
        {children}
      </body>
    </html>
  );
}