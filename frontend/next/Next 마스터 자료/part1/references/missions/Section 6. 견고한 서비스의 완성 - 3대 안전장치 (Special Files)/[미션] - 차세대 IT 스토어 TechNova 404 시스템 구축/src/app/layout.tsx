import "./globals.css";
import Link from "next/link";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko"><body className="min-h-screen flex flex-col">
      <nav className="p-5 border-b bg-white flex justify-between items-center z-50 sticky top-0">
        <Link href="/" className="font-black text-indigo-600 text-xl">TechNova.</Link>
        <Link href="/" className="text-sm font-bold text-gray-500">Home</Link>
      </nav>
      <main className="flex-1 flex flex-col">{children}</main>
    </body></html>
  );
}
