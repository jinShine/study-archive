import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "보안 통제 센터",
  description: "Next.js 15 useActionState 아키텍처"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}