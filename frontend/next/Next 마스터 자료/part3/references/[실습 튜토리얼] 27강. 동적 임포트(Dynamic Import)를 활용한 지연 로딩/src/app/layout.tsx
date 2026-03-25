import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "동적 임포트 실습", description: "Next.js Dynamic Import 튜토리얼" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body className="antialiased">{children}</body></html>;
}
