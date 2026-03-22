import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <nav className="p-6 bg-white border-b font-black text-blue-600 italic">GlobalVoyage.</nav>
        {children}
      </body>
    </html>
  );
}
