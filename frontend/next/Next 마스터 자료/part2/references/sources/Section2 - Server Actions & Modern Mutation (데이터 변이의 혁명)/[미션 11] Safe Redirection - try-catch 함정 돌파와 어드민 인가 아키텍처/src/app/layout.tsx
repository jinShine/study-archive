import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { 
  title: "Korapaduck Admin", 
  description: "Safe Redirection Architecture" 
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen font-sans bg-slate-950">
        {children}
      </body>
    </html>
  );
}