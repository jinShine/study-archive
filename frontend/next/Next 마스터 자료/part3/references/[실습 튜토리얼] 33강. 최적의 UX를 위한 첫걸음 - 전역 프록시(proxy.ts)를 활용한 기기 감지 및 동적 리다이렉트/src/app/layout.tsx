import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "기기 감지 및 최적화 실습" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body className="antialiased min-h-screen flex flex-col items-center justify-center p-4">{children}</body></html>;
}
