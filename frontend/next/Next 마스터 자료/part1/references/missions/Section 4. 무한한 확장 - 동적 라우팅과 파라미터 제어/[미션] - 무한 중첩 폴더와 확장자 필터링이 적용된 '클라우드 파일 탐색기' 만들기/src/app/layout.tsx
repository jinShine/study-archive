import "./globals.css";
export const metadata = { title: 'Cloud Drive - Next.js 15' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ko"><body>{children}</body></html>);
}
