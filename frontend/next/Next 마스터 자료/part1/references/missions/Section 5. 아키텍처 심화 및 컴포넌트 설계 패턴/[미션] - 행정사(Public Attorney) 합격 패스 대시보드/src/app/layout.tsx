import "./globals.css";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<html lang="ko"><body><nav className="p-6 bg-slate-900 text-white font-black">LAW-PASS</nav><main className="p-10 max-w-5xl mx-auto">{children}</main></body></html>);
}
