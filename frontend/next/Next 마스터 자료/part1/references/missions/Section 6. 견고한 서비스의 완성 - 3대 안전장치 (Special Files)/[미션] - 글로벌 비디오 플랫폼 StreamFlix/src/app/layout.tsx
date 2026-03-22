import "./globals.css";
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (<html lang="ko"><body>
    <nav className="p-6 bg-gray-900 font-black text-red-600 italic border-b border-gray-800">STREAMFLIX.</nav>
    <main className="max-w-7xl mx-auto">{children}</main>
  </body></html>);
}
