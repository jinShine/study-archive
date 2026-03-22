import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koraphaduck Insight",
  description: "Next.js 15 Caching Architecture"
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