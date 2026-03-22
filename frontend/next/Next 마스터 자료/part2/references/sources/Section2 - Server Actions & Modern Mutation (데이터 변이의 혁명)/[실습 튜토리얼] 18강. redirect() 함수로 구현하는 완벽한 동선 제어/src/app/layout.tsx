import "./globals.css";
export const metadata = { title: "동선 제어 사령부" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 m-0 font-sans min-h-screen flex items-center justify-center p-5">
        {children}
      </body>
    </html>
  );
}