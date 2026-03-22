import "./globals.css";
import Link from "next/link";
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 font-black text-indigo-600 shadow-sm">
          <Link href="/">ELECTRA.</Link>
          <Link href="/products" className="text-xs text-slate-400 uppercase tracking-widest">Shop</Link>
        </header>
        {children}
      </body>
    </html>
  );
}
