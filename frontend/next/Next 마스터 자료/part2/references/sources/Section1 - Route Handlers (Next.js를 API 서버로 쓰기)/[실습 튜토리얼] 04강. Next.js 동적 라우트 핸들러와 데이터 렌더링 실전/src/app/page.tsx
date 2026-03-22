import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>시스템 통제 센터 메인</h1>
      <hr />
      <p>풀스택 데이터 파이프라인이 준비되었습니다.</p>
      <Link href="/products/777">
        <button style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}>
          777번 상품 데이터 타격 테스트
        </button>
      </Link>
    </div>
  );
}