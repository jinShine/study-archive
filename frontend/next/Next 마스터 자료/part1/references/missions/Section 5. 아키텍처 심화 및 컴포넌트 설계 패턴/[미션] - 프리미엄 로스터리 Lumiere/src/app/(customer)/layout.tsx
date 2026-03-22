import "../globals.css";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<html lang="ko"><body>
    {/* 고객용 GNB */}
    <nav className="p-6 border-b text-amber-900 font-black text-2xl italic">Lumiere.</nav>
    <main>{children}</main>
  </body></html>);
}
