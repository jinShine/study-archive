import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>AI 스터디 플래너 메인 홈</h1>
      <p>SEO 테스트를 위한 페이지 링크 모음입니다.</p>
      <ul style={{ marginTop: "1rem", lineHeight: "2" }}>
        <li>
          <Link
            href="/about"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            정적 소개 페이지 (Static Metadata) 확인하기
          </Link>
        </li>
        <li>
          <Link
            href="/routine/123"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            동적 루틴 페이지 (Dynamic Metadata & JSON-LD) 확인하기
          </Link>
        </li>
      </ul>
    </main>
  );
}
