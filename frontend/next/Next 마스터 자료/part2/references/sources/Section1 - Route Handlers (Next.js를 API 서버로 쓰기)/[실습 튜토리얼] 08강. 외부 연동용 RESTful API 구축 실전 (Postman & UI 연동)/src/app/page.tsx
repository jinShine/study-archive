import Link from 'next/link';
export default function HomePage() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>통합 데이터 파이프라인</h1><p style={{ color: "#94a3b8" }}>중단 없는 안정적인 시스템 연동이 준비되었습니다.</p>
      <hr style={{ borderColor: "#1e293b", margin: "20px 0" }} />
      <div style={{ display: "flex", gap: "15px" }}>
        <Link href="/notifications" style={{ padding: "12px 24px", background: "var(--primary)", color: "#000", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>실시간 알림 피드 진입</Link>
      </div>
    </div>
  );
}