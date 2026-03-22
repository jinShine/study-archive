import "../globals.css";
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko"><body>
      <header className="p-8 bg-white/80 backdrop-blur-md border-b flex justify-between font-black text-blue-600 italic text-3xl sticky top-0 z-50 tracking-tighter">Smartly.</header>
      <main className="min-h-screen text-center p-24">{children}</main>
    </body></html>
  );
}
