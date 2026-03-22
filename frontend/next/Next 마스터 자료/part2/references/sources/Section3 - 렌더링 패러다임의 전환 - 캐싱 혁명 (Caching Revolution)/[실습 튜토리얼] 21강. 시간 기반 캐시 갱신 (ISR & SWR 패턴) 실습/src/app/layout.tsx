import "./globals.css";
export const metadata = { title: "캐싱 패러다임 통제소" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko"><body className="bg-gray-50 text-gray-900 m-0 font-sans min-h-screen">
      <header className="p-5 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
        <h2 className="m-0 text-[#0070f3] font-bold text-xl">ARCHITECT CONTROL CENTER</h2>
        <a href="/" className="text-gray-500 hover:text-black font-semibold text-sm">대시보드</a>
      </header>
      <main className="p-5">{children}</main>
    </body></html>
  );
}