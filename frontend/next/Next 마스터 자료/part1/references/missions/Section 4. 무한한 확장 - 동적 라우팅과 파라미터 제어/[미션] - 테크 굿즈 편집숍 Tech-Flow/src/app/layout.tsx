import "./globals.css";
import Link from "next/link";
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900">
        <nav className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <Link href="/" className="text-2xl font-black italic text-blue-600">TECH-FLOW.</Link>
          <div className="flex gap-6 font-bold text-sm text-slate-600">
            <Link href="/products/macbook">PRODUCTS</Link>
            <Link href="/shop/tech/iphone">SHOP</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
