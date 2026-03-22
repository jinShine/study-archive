export const metadata = { title: "성능 최적화 통제소", description: "Next.js 15 캐싱 실습" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko"><body style={{ backgroundColor: "#020617", color: "#f8fafc", fontFamily: "sans-serif", margin: 0 }}>
    <header style={{ padding: "20px", borderBottom: "1px solid #1e293b", backgroundColor: "#0f172a" }}>
    <h2 style={{ margin: 0, color: "#22d3ee" }}>PERFORMANCE ARCHITECT CENTER</h2></header>
    <main>{children}</main></body></html>
  );
}