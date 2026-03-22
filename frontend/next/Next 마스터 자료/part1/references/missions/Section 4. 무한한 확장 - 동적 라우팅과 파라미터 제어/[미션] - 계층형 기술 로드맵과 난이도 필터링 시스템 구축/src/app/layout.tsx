import "./globals.css";
export const metadata = { title: 'Skill Roadmap - Next.js 15' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ko"><body>{children}</body></html>);
}
