import "./globals.css";
export const metadata = { title: "라우팅 흐름 통제소" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="m-0 font-sans min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}