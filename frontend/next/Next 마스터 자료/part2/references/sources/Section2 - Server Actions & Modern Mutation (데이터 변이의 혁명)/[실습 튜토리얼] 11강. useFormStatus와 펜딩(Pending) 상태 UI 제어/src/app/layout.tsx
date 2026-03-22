import "./globals.css";
export const metadata = { title: "Server Actions 통제소" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 m-0 font-sans">
        <header className="p-5 border-b border-gray-200 bg-white shadow-sm">
          <h2 className="m-0 text-[#0070f3] font-bold text-xl">ARCHITECT CONTROL CENTER</h2>
        </header>
        <main className="p-5">{children}</main>
      </body>
    </html>
  );
}