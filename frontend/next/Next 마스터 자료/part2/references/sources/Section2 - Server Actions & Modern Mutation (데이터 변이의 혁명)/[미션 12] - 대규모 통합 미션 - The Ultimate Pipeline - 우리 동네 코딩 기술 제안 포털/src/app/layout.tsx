import "./globals.css";
import { cookies } from 'next/headers';
export const metadata = { title: "Korapaduck Portal" };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isVip = cookieStore.get('vip_mode')?.value === 'true';
  const themeClass = isVip ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  return (
    <html lang="ko">
      <body className={`antialiased min-h-screen ${themeClass} transition-colors duration-700 font-sans`}>{children}</body>
    </html>
  );
}