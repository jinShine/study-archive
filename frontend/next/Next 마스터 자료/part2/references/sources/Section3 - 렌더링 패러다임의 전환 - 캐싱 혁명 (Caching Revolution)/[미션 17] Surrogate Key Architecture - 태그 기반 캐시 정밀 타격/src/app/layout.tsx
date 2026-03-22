import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { 
  title: "Surrogate Key Architecture", 
  description: "Next.js 16 revalidateTag and updateTag" 
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