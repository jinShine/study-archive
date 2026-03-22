export const metadata = {
  title: "시스템 통제 센터",
  description: "Next.js 15 API 파이프라인 실습",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "sans-serif", margin: 0 }}>
        <header style={{ padding: "20px", borderBottom: "1px solid #1e293b", backgroundColor: "#1e293b" }}>
          <h2 style={{ margin: 0, color: "#38bdf8" }}>ARCHITECT CONTROL CENTER</h2>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}