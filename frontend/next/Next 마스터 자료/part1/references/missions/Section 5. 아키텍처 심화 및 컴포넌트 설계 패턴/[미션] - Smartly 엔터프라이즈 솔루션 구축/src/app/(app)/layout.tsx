import "../globals.css";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko"><body>
      <div className="flex min-h-screen">
        <aside className="w-80 bg-slate-900 text-white p-12 font-black uppercase italic tracking-tighter border-r-8 border-blue-600">Smartly Console</aside>
        <main className="flex-1 p-20 bg-slate-50">{children}</main>
      </div>
    </body></html>
  );
}
