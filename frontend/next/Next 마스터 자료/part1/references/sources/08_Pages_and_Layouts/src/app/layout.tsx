import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-100 text-gray-900">
        <header className="p-4 bg-white border-b shadow-sm">
          <h1 className="text-xl font-black text-orange-600">Global Root Layout (Lv 1)</h1>
        </header>
        {/* 모든 페이지와 중첩 레이아웃은 이 children 자리로 들어옵니다. */}
        {children}
      </body>
    </html>
  );
}
