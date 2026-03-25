import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "네트워크 경계 방어 실습" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body className="antialiased min-h-screen flex flex-col items-center justify-center p-4">{children}</body></html>;
}
