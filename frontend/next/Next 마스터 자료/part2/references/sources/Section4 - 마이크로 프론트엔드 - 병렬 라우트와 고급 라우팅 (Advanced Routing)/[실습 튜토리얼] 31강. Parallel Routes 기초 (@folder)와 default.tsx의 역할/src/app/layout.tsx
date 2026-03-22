import "./globals.css";
export const metadata = { title: "모듈러 아키텍처 통제소" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-100 text-gray-900 m-0 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}