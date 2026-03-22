import "./globals.css";
export const metadata = { title: "Korapaduck 시스템 통제소", description: "기술을 통한 교육의 평등을 실현하는 데이터 파이프라인" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko"><body>
      <header style={{ padding: "20px", borderBottom: "1px solid #1e293b", backgroundColor: "#020617" }}>
        <h2 style={{ margin: 0, color: "var(--primary)" }}>ARCHITECT CONTROL CENTER</h2>
      </header>
      <main>{children}</main>
    </body></html>
  );
}