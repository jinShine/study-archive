import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ko"><body><nav className="p-6 border-b font-black text-stone-800">LUX-GALLERY.</nav>{children}</body></html>);
}
