import Link from 'next/link';
export default function HomePage() {
  return (
    <div style={{ padding: "40px" }}><h1>시스템 성능 튜닝 센터</h1><p>아래 버튼을 통해 검증하십시오.</p>
    <hr style={{ borderColor: "#1e293b", margin: "20px 0" }} />
    <div style={{ display: "flex", gap: "20px" }}>
    <Link href="/performance" style={{ padding: "12px 24px", background: "#f59e0b", color: "#fff", textDecoration: "none", borderRadius: "6px", fontWeight: "bold" }}>메모이제이션 테스트</Link>
    <Link href="/api/static-github" target="_blank" style={{ padding: "12px 24px", background: "#10b981", color: "#fff", textDecoration: "none", borderRadius: "6px", fontWeight: "bold" }}>세그먼트 캐싱 테스트</Link>
    </div></div>
  );
}