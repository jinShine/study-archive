import "../globals.css";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<html lang="ko"><body className="flex h-screen bg-slate-50">
    {/* 직원용 LNB */}
    <aside className="w-64 bg-slate-900 text-white p-6 font-black text-xl">LUMIERE POS</aside>
    <main className="flex-1 p-10">{children}</main>
  </body></html>);
}
